import { isArray, isNumber, isString } from "../utils";

export const ShapeFlgs = {
  ELEMENT: 1,
  TEXT: 1 << 1,
  FRAGMENT: 1 << 2,
  COMPONENT: 1 << 3,
  TEXT_CHILDREN: 1 << 4,
  ARRAY_CHILDREN: 1 << 5,
  CHILDREN: 1 << 4 || 1 << 5,
};

export const Text = Symbol("Text");
export const Fragment = Symbol("Fragment");

/**
 *
 * @param {string | Object | Text | Fragment} type
 * @param {Object | null} props
 * @param {string | Array | null} children
 * @returns VNode
 */
export function h(type, props, children) {
  let shapeFlag = 0;
  if (isString(typeof type)) {
    shapeFlag = ShapeFlgs.ELEMENT;
  } else if (type === Text) {
    shapeFlag = ShapeFlgs.TEXT;
  } else if (type === Fragment) {
    shapeFlag = ShapeFlgs.FRAGMENT;
  } else {
    shapeFlag = ShapeFlgs.COMPONENT;
  }
  if (isString(typeof children) || isNumber(typeof children)) {
    shapeFlag |= ShapeFlgs.TEXT_CHILDREN;
    children = children.toString();
  } else if (isArray(children)) {
    shapeFlag |= ShapeFlgs.ARRAY_CHILDREN;
  }
  return {
    type,
    props,
    children,
    shapeFlag,
    el: null,
    anchor: null,
    key: props?.key,
  };
}
