import { ShapeFlgs } from "./vnode";

export const render = (vnode, container) => {
  mount(vnode, container);
};

const mount = (vnode, container) => {
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlgs.ELEMENT) {
    mountElement(vnode, container);
  } else if (shapeFlag & ShapeFlgs.TEXT) {
    mountTextNode(vnode, container);
  } else if (shapeFlag & ShapeFlgs.FRAGMENT) {
    mountFragment(vnode, container);
  } else {
    mountComponent(vnode, container);
  }
};

const mountElement = (vnode, container) => {};
const mountTextNode = (vnode, container) => {};
const mountFragment = (vnode, container) => {};
const mountComponent = (vnode, container) => {};
