// ================================================================
// SCENE: the three.js world, the spheres, rings, sparks,
// the camera's movement, and the animation loop.
// ================================================================

import * as THREE from "three";
import { SECTIONS } from "./content.js";
import {
  HOME_DISTANCE, CAMERA_EASE, RING_RADIUS, DOTS_PER_RING, RING_TILTS,
  SPARK_COUNT, SPARK_TRAVEL, REDUCED_MOTION,
} from "./config.js";
import { state } from "./state.js";

// Build the whole scene. Throws if the browser can't do WebGL
// (main.js catches that and the site keeps working without 3D).
export function createScene() {

  // ---------- Renderer, camera, lights ----------

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // alpha: see-through background
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // sharp on retina, capped for speed
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,                                  // field of view (degrees)
    innerWidth / innerHeight,            // aspect ratio
    0.1, 100                             // draw things between these distances
  );
  camera.position.z = HOME_DISTANCE;

  scene.add(new THREE.AmbientLight("#ffffff", 0.6));        // soft light from everywhere
  const light = new THREE.PointLight("#ffffff", 1.5, 0, 0);  // a bulb with infinite range, no fade
  light.position.set(10, 10, 10);
  scene.add(light);

  // Everything that spins lives in `world`, so one rotation moves it all
  const world = new THREE.Group();
  scene.add(world);


  // ---------- Spheres: a soft glow shell + a wireframe per section ----------

  const spheres = SECTIONS.map((section) => {
    const segments = Math.round(12 + section.radius * 8);   // fewer lines on small spheres

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(section.radius, 64, 64),
      new THREE.MeshStandardMaterial({
        color: section.color,
        emissive: section.color,         // glows on its own
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,          // visible from inside too (the camera flies in)
        depthWrite: false,               // let inner spheres show through outer ones
      })
    );
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(section.radius, segments, segments),
      new THREE.MeshBasicMaterial({
        color: section.color, wireframe: true, transparent: true, opacity: 0.25, depthWrite: false,
      })
    );
    glow.renderOrder = wire.renderOrder = -section.radius;   // draw big spheres first

    world.add(glow, wire);
    return { section, glow, wire, offset: Math.random() * 10 };  // offset: don't all breathe in sync
  });


  // ---------- Orbit rings: one circle of dots, reused at several tilts ----------

  const dotTexture = makeDotTexture();

  const ringPositions = new Float32Array(DOTS_PER_RING * 3);   // x,y,z for each dot
  for (let i = 0; i < DOTS_PER_RING; i++) {
    const angle = (i / DOTS_PER_RING) * Math.PI * 2;
    ringPositions[i * 3]     = RING_RADIUS * Math.cos(angle);
    ringPositions[i * 3 + 1] = RING_RADIUS * Math.sin(angle);
    ringPositions[i * 3 + 2] = 0;
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));

  // Each ring is drawn twice on the same spot (big & faint + small & bright) = a cheap glow
  const haloDot = new THREE.PointsMaterial({ size: 0.3,  map: dotTexture, transparent: true, opacity: 0.15, depthWrite: false });
  const coreDot = new THREE.PointsMaterial({ size: 0.08, map: dotTexture, transparent: true, opacity: 0.9,  depthWrite: false });

  const rings = RING_TILTS.map((degrees, i) => {
    const ring = new THREE.Group();
    ring.add(new THREE.Points(ringGeometry, haloDot));
    ring.add(new THREE.Points(ringGeometry, coreDot));
    ring.rotation.x = THREE.MathUtils.degToRad(degrees);
    ring.userData.speed = 0.1 + 0.02 * i;            // each ring a little faster
    world.add(ring);
    return ring;
  });


  // ---------- Sparks: particles that fly out of the hovered sphere ----------

  const sparkData = Array.from({ length: SPARK_COUNT }, () => {
    const theta = Math.random() * Math.PI * 2;        // around the equator
    const phi = Math.acos(2 * Math.random() - 1);     // from the pole (this formula spreads them evenly)
    return {
      dir: new THREE.Vector3().setFromSphericalCoords(1, phi, theta),   // a direction, length 1
      speed: 0.1 + 0.1 * Math.random(),
      offset: Math.random() * 100,                    // so they don't all start together
    };
  });
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  const sparks = new THREE.Points(sparkGeometry, new THREE.PointsMaterial({
    size: 0.12, map: dotTexture, transparent: true, opacity: 0.9, depthWrite: false,
    blending: THREE.AdditiveBlending,                 // overlaps get brighter, like light
  }));
  sparks.frustumCulled = false;                       // they move after creation, so never skip drawing them
  world.add(sparks);


  // ---------- Picking: which sphere is under a screen position? ----------

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const center = new THREE.Vector3(0, 0, 0);
  const smallestFirst = [...SECTIONS].sort((a, b) => a.radius - b.radius);

  // Measure how close the mouse ray passes to the center, then pick the
  // smallest sphere that's at least that big. One number instead of six hit tests.
  function sectionAt(clientX, clientY) {
    pointer.x = (clientX / innerWidth) * 2 - 1;      // pixels → -1..1
    pointer.y = -(clientY / innerHeight) * 2 + 1;    // screen y points down, 3D y points up
    raycaster.setFromCamera(pointer, camera);
    const distance = raycaster.ray.distanceToPoint(center);
    return smallestFirst.find((s) => s.radius >= distance) ?? null;
  }


  // ---------- Animation: one small function per job ----------

  // Slow breathing, plus a white pulse on the hovered sphere
  function animateSpheres(t) {
    for (const { section, glow, wire, offset } of spheres) {
      const breathe = REDUCED_MOTION ? 1 : 1 + 0.008 * Math.sin(2 * t + offset);
      glow.scale.setScalar(breathe);
      wire.scale.setScalar(breathe);

      const hot = section === state.hovered;
      wire.material.color.set(hot ? "#ffffff" : section.color);
      wire.material.opacity = hot ? 0.9 : 0.25;
      glow.material.opacity = hot ? 0.15 : 0.06;
      glow.material.emissiveIntensity = hot ? 1.5 + 0.3 * Math.sin(10 * t) : 0.4;
    }
  }

  // Spin each ring in its own tilted plane
  function animateRings(t) {
    for (const ring of rings) ring.rotation.z = t * ring.userData.speed;
  }

  // Sparks fly out SPARK_TRAVEL units, then restart at the surface (the % trick)
  function animateSparks(t) {
    const hovered = state.hovered;
    sparks.visible = hovered !== null;
    if (!hovered) return;

    sparks.material.color.set(hovered.color);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const p = sparkData[i];
      const distance = hovered.radius + ((t * p.speed + p.offset) % SPARK_TRAVEL);
      sparkPositions[i * 3]     = p.dir.x * distance;
      sparkPositions[i * 3 + 1] = p.dir.y * distance;
      sparkPositions[i * 3 + 2] = p.dir.z * distance;
    }
    sparkGeometry.attributes.position.needsUpdate = true;   // send the new positions to the GPU
  }

  // Glide the camera toward its goal: the open sphere, or home
  const cameraGoal = new THREE.Vector3(0, 0, HOME_DISTANCE);  // where the camera wants to be
  const lookGoal = new THREE.Vector3();                        // where it wants to look
  const look = new THREE.Vector3();                            // where it's looking now

  function animateCamera(dt) {
    const current = state.current;
    if (current) {
      // Close enough to frame the sphere, shifted so it sits in the left half
      const distance = current.radius * 3.2 + 1.5;
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance * camera.aspect;
      const shift = camera.aspect > 1 ? halfWidth * 0.5 : 0;  // tall screens: no shift
      cameraGoal.set(shift, 0, distance);
      lookGoal.set(shift, 0, 0);
    } else {
      // Home: centered, leaning slightly toward the mouse
      cameraGoal.set(0, 0, HOME_DISTANCE);
      lookGoal.set(state.mouse.x * 0.5, state.mouse.y * 0.5, 0);
    }

    // Move a fraction of the remaining distance each frame: fast when far,
    // gentle on arrival. Based on elapsed time, so 60Hz and 120Hz feel the same.
    const k = 1 - Math.exp(-CAMERA_EASE * dt);
    camera.position.lerp(cameraGoal, k);
    look.lerp(lookGoal, k);
    camera.lookAt(look);
  }


  // ---------- The loop ----------

  const clock = new THREE.Clock();
  const autoSpin = REDUCED_MOTION ? 0 : 1;

  function loop() {
    const dt = clock.getDelta();         // seconds since the last frame
    const t = clock.elapsedTime;         // seconds since the start

    world.rotation.y = autoSpin * 0.1 * t + state.spin.y;
    world.rotation.x = autoSpin * 0.05 * t + state.spin.x;
    animateSpheres(t);
    animateRings(t);
    animateSparks(t);
    animateCamera(dt);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);         // the browser pauses this automatically in background tabs
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  // What the rest of the site can use
  return {
    canvas: renderer.domElement,
    sectionAt,
    resize,
    start: loop,
  };
}


// A soft round dot, drawn once on a 2D canvas, used by rings and sparks
function makeDotTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const half = size / 2;
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0,   "rgba(255,255,255,1)");     // solid center
  grad.addColorStop(0.3, "rgba(255,255,255,0.8)");
  grad.addColorStop(1,   "rgba(255,255,255,0)");     // transparent edge
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
