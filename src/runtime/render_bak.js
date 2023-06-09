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
  mountProps(props, el);
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
  for (const key in nextProps) {
    const pre = preProps[key];
    const next = nextProps[key];
    if (pre !== next) {
      patchDomProp(pre, next, key, el);
    }
  }
};

const patchDomProp = (pre, next, key, el) => {};

const patchChildren = () => {};

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/; // A-Z 匹配 innerHtml和textContent
const mountProps = (props, el) => {
  for (const key in props) {
    let value = props[key];
    switch (key) {
      case "class":
        el.className = value;
        break;
      case "style":
        for (const styleName in value) {
          el.style[styleName] = value[styleName];
        }
        break;
      default:
        // 处理onXX事件情况
        if (/^on[^a-z]/.test(key)) {
          const eventName = key.slice(2).toLowerCase(); // onClick => click
          el.addEventListener(eventName, value);
        } else if (domPropsRE.test(key)) {
          // 处理dom中自带的属性
          if (value === "" || isBoolean(value)) {
            // 处理直接在元素上给checked的情况，注意checked后面给的值是''也会选中
            value = true;
          }
          el[key] = value;
        } else {
          // 这里处理的是当自定义属性给的是false则直接去除该属性
          // 注意：value == null 这里用==也是为了实现 null与undefined比较时是相等的
          if (value == null || value === false) {
            el.removeAttribute(key);
          } else {
            el.setAttribute(key, value);
          }
        }
        break;
    }
  }
};

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
