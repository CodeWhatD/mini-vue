import { isBoolean, isNumber, isString } from "../utils";
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
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)&/; // A-Z 匹配 innerHtml和textContent
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
          console.log('事件')
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
    mountTextNode(children, container);
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    children.forEach((child) => {
      if (isString(typeof child) || isNumber(typeof child)) {
        mountTextNode(child, container);
      } else {
        mount(child, container);
      }
    });
  }
};
