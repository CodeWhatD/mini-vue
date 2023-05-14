// @ts-nocheck
import { isFunction } from "../utils";
import { effect, track, trigger } from "./effect";
export const computed = function (getterOrOptions) {
  let getter, setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("computed is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedImpl(getter, setter);
};

class ComputedImpl {
  constructor(getter, setter) {
    this._value = undefined;
    this._setter = setter;
    this._dirty = true; // 依赖是否更新
    this.effectFn = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, "value");
        }
      },
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this.effectFn();
      this._dirty = false;
      track(this, "value");
    }
    return this._value;
  }
  set value(value) {
    this._setter(value);
  }
}
