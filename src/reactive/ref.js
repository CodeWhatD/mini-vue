// @ts-nocheck
import { reactive } from ".";
import { hasChanged, isObject } from "../utils";
import { track, trigger } from "./effect";
export const ref = (value) => {
  return isRef(value) ? value : new RefImpl(value);
};

/**
 * 判断是否为ref 原理和reactive差不多
 */
export const isRef = (value) => {
  return !!(value && value.__isRef);
};

class RefImpl {
  constructor(value) {
    this._isRef = true;
    this._value = convert(value);
  }
  get value() {
    track(this, "value");
    return this._value;
  }
  set value(value) {
    if (hasChanged(this.value, value)) {
      this._value = convert(value);
      trigger(this, "value");
    }
  }
}
const convert = (value) => {
  return isObject(value) ? reactive(value) : value;
};
