"""Track the breadboard frame by frame and render a steady, top-down video.

Usage: python3 tools/topdown.py IN.mp4 OUT.mp4 END_SECONDS [OUT_HEIGHT]

CORNERS are the board corners picked by hand in frame REF; change them for a
new video. PAD is how much desk to show around the board (fraction of the
board's size), so the view isn't cropped tight to the board.
Needs numpy and Pillow, plus ffmpeg on the PATH.
"""
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

IN, OUT, END = sys.argv[1], sys.argv[2], float(sys.argv[3])
OUT_H = int(sys.argv[4]) if len(sys.argv) > 4 else 2160
W, H = 1080, 1920            # source size (the 1080p original)
FPS = 30000 / 1001
TS = 0.5                     # tracking runs at half size
REF = 150                      # frame at 5s, where the corners were picked
# board corners in the reference frame: TL, TR, BR, BL
CORNERS = np.array([[155, 583], [598, 583], [714, 1075], [50, 1068]], float) * 1.5
BOARD_ASPECT = 1.09            # width / height of the board, measured from tinycpu/images/breadboard-computer.jpg
PAD = dict(left=0.10, right=0.10, top=0.12, bottom=0.12)
T, R = 12, 9                   # template half-size, search radius (tracking px)

# ---------------------------------------------------------------- geometry
def apply(Hm, pts):
    p = np.c_[pts, np.ones(len(pts))] @ Hm.T
    return p[:, :2] / p[:, 2:]

def _norm(p):
    c = p.mean(0)
    s = np.sqrt(2) / (np.linalg.norm(p - c, axis=1).mean() + 1e-9)
    return np.array([[s, 0, -s * c[0]], [0, s, -s * c[1]], [0, 0, 1]])

def homog(src, dst):
    """Normalized DLT: H with dst ~ H @ src."""
    src, dst = np.asarray(src, float), np.asarray(dst, float)
    Ts, Td = _norm(src), _norm(dst)
    a, b = apply(Ts, src), apply(Td, dst)
    A = []
    for (x, y), (u, v) in zip(a, b):
        A.append([-x, -y, -1, 0, 0, 0, u * x, u * y, u])
        A.append([0, 0, 0, -x, -y, -1, v * x, v * y, v])
    _, _, vt = np.linalg.svd(np.array(A))
    h = np.linalg.inv(Td) @ vt[-1].reshape(3, 3) @ Ts
    return h / h[2, 2]

def warp(img, Hm, size, resample=Image.BILINEAR):
    """Output pixel q samples img at Hm(q)."""
    c = (Hm / Hm[2, 2]).ravel()[:8]
    return img.transform(size, Image.PERSPECTIVE, tuple(c), resample)

# ---------------------------------------------------------------- frames
def read_frames():
    n = int(END * FPS)
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", IN, "-frames:v", str(n),
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W, 3)

frames = read_frames()
N = len(frames)
TW, TH = int(W * TS), int(H * TS)
CT = CORNERS * TS              # corners in tracking pixels
gray = lambda f: Image.fromarray(f).convert("L").resize((TW, TH), Image.BILINEAR)
print("frames", N, flush=True)

# ---------------------------------------------------------------- tracking
ref = np.asarray(gray(frames[REF]), float)
pts = []
for a in np.linspace(0.06, 0.94, 9):
    for b in np.linspace(0.06, 0.94, 9):
        top = CT[0] + (CT[1] - CT[0]) * a
        bot = CT[3] + (CT[2] - CT[3]) * a
        x, y = (top + (bot - top) * b).round().astype(int)
        if ref[y - T:y + T, x - T:x + T].std() > 18:
            pts.append((x, y))
pts = np.array(pts, float)
temps = []
for x, y in pts:
    t = ref[int(y) - T:int(y) + T, int(x) - T:int(x) + T]
    temps.append((t - t.mean()) / (t.std() + 1e-6))
print("patches", len(pts), flush=True)

def match(img, x, y, t):
    """Sub-pixel offset of template t around (x, y) in img, or None."""
    x, y = int(round(x)), int(round(y))
    win = img[y - T - R:y + T + R, x - T - R:x + T + R]
    if win.shape != (2 * (T + R), 2 * (T + R)):
        return None
    n = 2 * T
    v = np.lib.stride_tricks.sliding_window_view(win, (n, n))
    num = np.einsum("ijkl,kl->ij", v, t)          # t has zero mean
    c1 = np.pad(win, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    c2 = np.pad(win * win, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    box = lambda c: c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]
    var = box(c2) / n / n - (box(c1) / n / n) ** 2
    ncc = num / (np.sqrt(np.maximum(var, 0)) + 1e-6) / t.size
    j, i = np.unravel_index(ncc.argmax(), ncc.shape)
    if ncc[j, i] < 0.6 or not (0 < j < ncc.shape[0] - 1 and 0 < i < ncc.shape[1] - 1):
        return None
    def peak(a, b, c):         # parabola through three samples
        d = a - 2 * b + c
        return 0.0 if d == 0 else 0.5 * (a - c) / d
    dx = i + peak(ncc[j, i - 1], ncc[j, i], ncc[j, i + 1]) - R
    dy = j + peak(ncc[j - 1, i], ncc[j, i], ncc[j + 1, i]) - R
    return dx, dy

def refine(g, Hm):
    """Hm maps ref -> this frame (tracking px). Warp the frame into ref space,
    re-match every patch, refit."""
    rw = np.asarray(warp(g, Hm, (TW, TH)), float)
    src, dst = [], []
    for (x, y), t in zip(pts, temps):
        r = match(rw, x, y, t)
        if r:
            src.append((x, y))
            dst.append((x + r[0], y + r[1]))
    if len(src) < 8:
        return None, len(src)
    src, dst = np.array(src), apply(Hm, np.array(dst))
    keep = np.ones(len(src), bool)
    for _ in range(4):         # drop outliers (blinking LEDs, hands)
        Hn = homog(src[keep], dst[keep])
        err = np.linalg.norm(apply(Hn, src) - dst, axis=1)
        nk = err < max(1.0, np.median(err[keep]) * 3)
        if nk.sum() < 8:
            break
        keep = nk
    return homog(src[keep], dst[keep]), int(keep.sum())

def track(i, Hprev):
    Hm, g = Hprev, gray(frames[i])
    for _ in range(3):         # iterate: each pass starts from a better warp
        Hn, k = refine(g, Hm)
        if Hn is None:
            return Hprev, k
        step = np.abs(apply(Hn, CT) - apply(Hm, CT)).max()
        if np.abs(apply(Hn, CT) - apply(Hprev, CT)).max() > 20:
            return Hprev, -k   # implausible jump in one frame
        Hm = Hn
        if step < 0.05:
            break
    return Hm, k

Hs = [None] * N
Hs[REF] = np.eye(3)
for rng in (range(REF + 1, N), range(REF - 1, -1, -1)):
    prev = REF
    for i in rng:
        Hs[i], k = track(i, Hs[prev])
        prev = i
        if i % 90 == 0 or k < 8:
            print(i, "inliers", k, flush=True)
up, dn = np.diag([1 / TS, 1 / TS, 1]), np.diag([TS, TS, 1])
Hs = [up @ h @ dn for h in Hs]     # back to source pixels

# ---------------------------------------------------------------- render
# Corners of the padded view, in reference-frame pixels.
unit_to_ref = homog([[0, 0], [1, 0], [1, 1], [0, 1]], CORNERS)
view_unit = np.array([[-PAD["left"], -PAD["top"]], [1 + PAD["right"], -PAD["top"]],
                      [1 + PAD["right"], 1 + PAD["bottom"]], [-PAD["left"], 1 + PAD["bottom"]]])
view_ref = apply(unit_to_ref, view_unit)

# View corners in every frame. A light smoothing pass only removes tracking
# noise; the tracking itself is what holds the board still.
traj = np.array([apply(Hs[i], view_ref) for i in range(N)])
k = 2
pad = np.concatenate([traj[:1].repeat(k, 0), traj, traj[-1:].repeat(k, 0)])
ker = np.ones(2 * k + 1) / (2 * k + 1)
traj = np.apply_along_axis(lambda s: np.convolve(s, ker, "valid"), 0, pad)
np.save(OUT + ".corners.npy", traj)

vw = (1 + PAD["left"] + PAD["right"]) * BOARD_ASPECT
vh = 1 + PAD["top"] + PAD["bottom"]
OH = OUT_H
OW = int(round(OH * vw / vh / 2)) * 2
rect = np.array([[0, 0], [OW, 0], [OW, OH], [0, OH]], float)
print("output", OW, "x", OH, flush=True)

# Where the camera didn't see part of the view, fill from the reference frame
# (the board doesn't move), and past that, the dark desk color.
white = Image.new("L", (W, H), 255)
M_ref = homog(rect, view_ref)
plate = warp(Image.fromarray(frames[REF]), M_ref, (OW, OH), Image.BICUBIC)
plate_mask = warp(white, M_ref, (OW, OH))
desk = Image.new("RGB", (OW, OH), (16, 16, 18))
feather = lambda m: m.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(8))
plate = Image.composite(plate, desk, feather(plate_mask))

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                        "-s", f"{OW}x{OH}", "-r", "30000/1001", "-i", "-",
                        "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", OUT],
                       stdin=subprocess.PIPE)
for i in range(N):
    M = homog(rect, traj[i])             # output -> frame
    out = warp(Image.fromarray(frames[i]), M, (OW, OH), Image.BICUBIC)
    mask = warp(white, M, (OW, OH))
    if mask.getextrema()[0] < 255:
        out = Image.composite(out, plate, feather(mask))
    enc.stdin.write(out.tobytes())
    if i % 120 == 0:
        print("render", i, flush=True)
enc.stdin.close()
enc.wait()
print("wrote", OUT, flush=True)
