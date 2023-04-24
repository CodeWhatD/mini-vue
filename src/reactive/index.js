import { isObject, hasChanged } from "../utils";
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
      track(target, key);
      return Reflect.get(target, key, recevier);
    },
    set(target, key, value, recevier) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, recevier);
      if (hasChanged(oldValue, value)) {
        trigger(target, key);
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
