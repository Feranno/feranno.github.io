// ================================================================
// STATE: values that change while the page runs, shared by every file.
// ================================================================
//
// Modules can't reassign each other's variables, but they can all change
// properties on one shared object. So everything that changes lives here.

export const state = {
  current: null,          // the open section (null = home view)
  hovered: null,          // the section under the mouse or menu (null = none)
  mouse: { x: 0, y: 0 },  // mouse position, -1 to 1 on each axis
  spin: { x: 0, y: 0 },   // extra rotation added by dragging
};
