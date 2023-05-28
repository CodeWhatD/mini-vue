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

const mountElement = (vnode, container) => {
  const { type, props } = vnode;
  const el = document.createElement(type);
  mountProps(props, el);
  mountChildren(vnode, el);
  container.appendChild(el);
};
const mountTextNode = (vnode, container) => {
  const textNode = document.createTextNode(vnode);
  container.appendChild(textNode);
};
const mountFragment = (vnode, container) => {
  mountChildren(vnode, container);
};
const mountComponent = (vnode, container) => {};
const mountProps = (props, el) => {
  for (const key in props) {
    const value = props[key];
    switch (key) {
      case "class":
        el.className = value;
      case "style":
        for (const styleName in value) {
          el.style[styleName] = value[styleName];
        }
      default:
        // 处理onXX事件情况
        if (/^on[^a-z]/.test(value)) {
          const eventName = value.slice(2).toLowerCase(); // onClick => click
          el.addEventListener(eventName, value);
        }
        break;
    }
  }
};
const mountChildren = (vnode, container) => {
  const { shapeFlag, children } = vnode;
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    mountTextNode(vnode, container);
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    children.forEach((child) => {
      mount(child, container);
    });
  }
};
