import { isObject } from "../utils/isObject";
import { track, trigger } from "./effect";
export const reactive = (target) => {
  if (!isObject(target)) {
    return target;
  }
  const proxy = new Proxy(target, {
    get(target, key, recevier) {
      track(target, key);
      return Reflect.get(target, key, recevier);
    },
    set(target, key, value, recevier) {
      const res = Reflect.set(target, key, value, recevier);
      trigger(target, key);
      return res;
    },
  });
  return proxy;
};
