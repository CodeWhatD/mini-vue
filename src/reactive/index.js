import { isObject, hasChanged, isArray } from "../utils";
import { track, trigger } from "./effect";

const proxyMap = new WeakMap();

export const reactive = (target) => {
  if (!isObject(target)) {
    return target;
  }
  if (isReactive(target)) {
    return target;
  }
  if (proxyMap.get(target)) {
    return proxyMap.get(target);
  }
  const proxy = new Proxy(target, {
    get(target, key, recevier) {
      if (target.__isReactive) {
        return true;
      }
      const res = Reflect.get(target, key, recevier);
      track(target, key);
      return isObject(res) ? reactive(res) : res;
    },
    set(target, key, value, recevier) {
      const oldValue = target[key];
      const oldLength = target.length;
      const res = Reflect.set(target, key, value, recevier);
      if (hasChanged(oldValue, value)) {
        trigger(target, key);
        if (isArray(target) && hasChanged(oldLength, target.length)) {
          trigger(target, "length");
        }
      }
      return res;
    },
  });
  proxyMap.set(target, proxy);
  return proxy;
};

/**
 * 此函数可以判断该对象是否被代理
 * 处理特殊情况：reactive(reactive({a:1}))
 */
export const isReactive = (target) => {
  return !!(target && target.__isReactive);
};
