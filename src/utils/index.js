export const isObject = (target) => {
  return typeof target === "object" && target !== null;
};

/**
 * 判断响应式的值是否真的发生改变
 * 处理情况：当我们给响应式的值重复赋值同一值的时候也trigger去了，这是不对的，只有真正发生改变
 * 函数注意：这里处理了一个特殊情况，两个NaN是不等的
 */
export const hasChanged = (oldValue, value) => {
  return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value));
};

export const isArray = (target) => {
  return Array.isArray(target);
};

export const isFunction = (target) => {
  return typeof target === "function";
};

export const isString = (target) => {
  return target === "string";
};

export const isNumber = (target) => {
  return target === "number";
};

export const isBoolean = (target) => {
  return target === "boolean";
};
