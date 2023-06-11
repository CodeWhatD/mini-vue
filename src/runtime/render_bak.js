import { isBoolean, isNumber, isString } from "../utils";
import { ShapeFlgs } from "./vnode";

export const render = (vnode, container) => {
  const preVNode = container._vnode;
  if (!vnode) {
    if (preVNode) {
      unMount(preVNode);
    }
  } else {
    patch(preVNode, vnode, container);
  }
  container._vnode = vnode;
};

const patch = (preVNode, nextvnode, container, anchor) => {
  // 如果两次的vnode不是相同的根节点，那么直接卸载preVnode
  if (preVNode && !isSameNode(preVNode, nextvnode)) {
    anchor = (preVNode.el || preVNode.anchor).nextSibling;
    unMount(preVNode);
    preVNode = null;
  }
  const { shapeFlag } = nextvnode;
  if (shapeFlag & ShapeFlgs.ELEMENT) {
    processElement(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.TEXT) {
    processText(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.FRAGMENT) {
    processFragment(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.COMPONENT) {
    processComponent(preVNode, nextvnode, container, anchor);
  }
};

const mountElement = (vnode, container, anchor) => {
  const { type, props, shapeFlag, children } = vnode;
  const el = document.createElement(type);
  if (props) {
    patchProps(null, props, el);
  }
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    mountChildren(children, el, anchor);
  }
  container.insertBefore(el, anchor);
  vnode.el = el;
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

const unMountFragment = (vnode) => {
  let { el: current, anchor: end } = vnode;
  const parentNode = current.parentNode;
  while (current !== end) {
    let next = current.nextSibling;
    parentNode.removeChild(current);
    current = next;
  }
  parentNode.removeChild(end);
};

const processComponent = (preVNode, vnode, container, anchor) => {};

const processFragment = (preVNode, vnode, container, anchor) => {
  const fragmentStartAnchor = (vnode.el = preVNode
    ? preVNode.el
    : document.createTextNode(""));
  const fragmentEndAnchor = (vnode.anchor = preVNode
    ? preVNode.anchor
    : document.createTextNode(""));
  if (preVNode) {
    patchChildren(preVNode, vnode, container, fragmentEndAnchor);
  } else {
    container.insertBefore(fragmentStartAnchor, anchor);
    container.insertBefore(fragmentEndAnchor, anchor);
    mountChildren(vnode.children, container, fragmentEndAnchor);
  }
};

const processElement = (preVNode, vnode, container, anchor) => {
  if (preVNode) {
    console.log("preVnode", preVNode);
    console.log("vnode", vnode);
    patchElement(preVNode, vnode);
  } else {
    mountElement(vnode, container, anchor);
  }
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
      if (nextValue == null) {
        el.removeAttribute("style");
      } else {
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

const unMountChildren = (children) => {
  children.forEach((child) => {
    unMount(child);
  });
};

// 此函数将根据preVnode和nextVnode的不同类型执行对应的path操作
const patchChildren = (preVnode, nextVnode, container, anchor) => {
  const { shapeFlag: preShapeFlag, children: preChildren } = preVnode;
  const { shapeFlag, children: nextChildren } = nextVnode;
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      unMountChildren(preChildren);
    }
    console.log(preChildren, nextChildren);
    if (preChildren !== nextChildren) {
      container.textContent = nextChildren;
    }
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    if (preShapeFlag & ShapeFlgs.TEXT_CHILDREN) {
      container.textContent = "";
      mountChildren(nextChildren, container, anchor);
    } else if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      patchArrayChildren(preChildren, nextChildren, container, anchor);
    } else {
      mountChildren(nextChildren, container, anchor);
    }
  } else {
    if (preShapeFlag & ShapeFlgs.TEXT_CHILDREN) {
      container.textContent = "";
    } else if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      unMountChildren(preChildren);
    }
  }
};

const patchArrayChildren = (preChildren, nextChildren, container, anchor) => {
  const preChildrenLength = preChildren.length;
  const nextChildrenLength = nextChildren.length;
  const commonLength = Math.min(preChildrenLength, nextChildrenLength); // 公共长度
  if (preChildrenLength === nextChildrenLength) {
    for (let index = 0; index < commonLength; index++) {
      patch(preChildren[index], nextChildren[index], container, anchor);
    }
  }
  if (preChildrenLength > nextChildrenLength) {
    unMountChildren(preChildren.slice(commonLength));
  } else if (preChildrenLength < nextChildrenLength) {
    mountChildren(nextChildren.slice(commonLength), container, anchor);
  }
};

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/; // A-Z 匹配 innerHtml和textContent

const mountChildren = (children, container, anchor) => {
  children.forEach((child) => {
    patch(null, child, container, anchor);
  });
};

const processText = (preVNode, vnode, container, anchor) => {
  if (preVNode) {
    vnode.el = preVNode.el;
    preVNode.el.textContent = vnode.children;
  } else {
    mountText(vnode, container, anchor);
  }
};

const mountText = (vnode, container, anchor) => {
  const textNode = document.createTextNode(vnode.children);
  vnode.el = textNode;
  container.insertBefore(textNode, anchor);
};

const isSameNode = (preVNode, vnode) => {
  return preVNode.type === vnode.type;
};