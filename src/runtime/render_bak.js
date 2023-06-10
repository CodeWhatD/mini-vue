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

const processFragment = (preVNode, vnode, container) => {};

const processElement = (preVNode, vnode, container) => {
  if (preVNode) {
  } else {
  }
};

const mountElement = (vnode, container) => {
  const { type, props } = vnode;
  const el = document.createElement(type);
  patchProps(null, props, el);
  mountChildren(vnode, el);
  container.appendChild(el);
  vnode.el = el;
};

const patchElement = (preVNode, vnode) => {
  vnode.el = preVNode.el;
  patchProps(preVNode.props, vnode.props, vnode.el);
  patchChildren(preVNode, vnode, vnode.el);
};

const patchProps = (preProps, nextProps, el) => {
  if (preProps === nextProps) {
    return;
  }
  preProps = preProps || {};
  nextProps = nextProps || {};
  for (const key in nextProps) {
    const pre = preProps[key];
    const next = nextProps[key];
    if (pre !== next) {
      patchDomProp(pre, next, key, el);
    }
  }
  for (const key in preProps) {
    if (nextProps[key] == null) {
      patchDomProp(preProps[key], null, key, el);
    }
  }
};

const patchDomProp = (preValue, nextValue, key, el) => {
  switch (key) {
    case "class":
      el.className = nextValue || ""; // 或是为了防止 nextValue为null或者false 这种直接赋值会赋值成字符串false
      break;
    case "style":
      for (const nextStyleName in nextValue) {
        el.style[nextStyleName] = nextValue[nextStyleName];
      }
      if (preValue) {
        for (const styleName in preValue) {
          if (nextValue[styleName] == null) {
            // 这里处理的情况是 如果next元素中不存在pre元素的style 那么移除
            el[styleName] = "";
          }
        }
      }
      break;
    default:
      if (/^on[^a-z]/.test(key)) {
        const eventName = key.slice(2).toLowerCase(); // onClick => click
        if (preValue) {
          el.removeEventListener(eventName, preValue);
        }
        if (nextValue) {
          el.addEventListener(eventName, nextValue);
        }
      } else if (domPropsRE.test(key)) {
        if (nextValue === "" || isBoolean(nextValue)) {
          nextValue = true;
        }
        el[key] = nextValue;
      } else {
        if (nextValue == null || nextValue === false) {
          el.removeAttribute(key);
        } else {
          el.setAttribute(key, nextValue);
        }
      }
      break;
  }
};

const patchChildren = () => {};

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/; // A-Z 匹配 innerHtml和textContent

const mountChildren = (vnode, container) => {
  const { shapeFlag, children } = vnode;
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    mountText(children, container);
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    children.forEach((child) => {
      if (isString(typeof child) || isNumber(typeof child)) {
        mountText(child, container);
      } else {
        patch(null, child, container);
      }
    });
  }
};

const processText = (preVNode, vnode, container) => {
  if (preVNode) {
    vnode.el = preVNode.el;
    preVNode.el.textContent = vnode.children;
  } else {
    mountText(vnode, container);
  }
};

const mountText = (vnode, container) => {
  const textNode = document.createTextNode(vnode.children);
  container.appendChild(textNode);
  vnode.el = textNode;
};

const patch = (preVNode, vnode, container) => {
  // 如果两次的vnode不是相同的根节点，那么直接卸载preVnode
  if (preVNode && !isSameNode(preVNode, vnode)) {
    unMount(preVNode);
    preVNode = null;
  }
  const { shapeFlgs } = vnode;
  if (shapeFlgs & ShapeFlgs.COMPONENT) {
    processComponent(preVNode, vnode, container);
  } else if (shapeFlgs & ShapeFlgs.FRAGMENT) {
    processFragment(preVNode, vnode, container);
  } else if (shapeFlgs & ShapeFlgs.TEXT) {
    processText(preVNode, vnode, container);
  } else {
    processElement(preVNode, vnode, container);
  }
};

const isSameNode = (preVNode, vnode) => {
  return preVNode.type === vnode.type;
};
