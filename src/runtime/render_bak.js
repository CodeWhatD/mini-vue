import { isBoolean, isNumber, isString } from "../utils";
import { ShapeFlgs } from "./vnode";

export const render = (vnode, container) => {
  const preVNode = container._vnode;
  if (!vnode) {
    // 如果没有nextVNode
    if (preVNode) {
      unMount(preVNode);
    }
  } else {
    patch(preVNode, vnode, container);
  }
  container._vnode = vnode;
};

const unMount = (vnode) => {
  const { shapeFlgs, el } = vnode;
  if (shapeFlgs & ShapeFlgs.COMPONENT) {
    unMountComponent(vnode);
  } else if (shapeFlgs & ShapeFlgs.FRAGMENT) {
    unMountFragment(vnode);
  } else {
    // ELEMENT
    el.parentNode.removeChild(el);
  }
};

const unMountComponent = (vnode) => {};

const unMountFragment = (vnode) => {};

const processComponent = (preVNode, vnode, container) => {};

const patch = (preVNode, vnode, container) => {
  // 如果两次的vnode不是相同的根节点，那么直接卸载preVnode
  if (preVNode && !isSameNode(preVNode, vnode)) {
    unMount(preVNode);
    preVNode = null;
  }
  const { shapeFlgs } = vnode;
  if (shapeFlgs & ShapeFlgs.COMPONENT) {
    processComponent(preVNode, vnode, container);
  }
};

const isSameNode = (preVNode, vnode) => {
  return preVNode.type === vnode.type;
};
