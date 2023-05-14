const activeEffectStack = [];
let activeEffect;
export const effect = (fn, options = {}) => {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      activeEffectStack.push(activeEffect);
      return fn();
    } finally {
      activeEffectStack.pop();
      activeEffect = activeEffectStack[activeEffectStack.length - 1];
    }
  };
  if (!options.lazy) {
    effectFn();
  }
  if (options.scheduler) {
    effectFn.scheduler = options.scheduler;
  }
  return effectFn;
};

const targetMap = new WeakMap(); // 创建一个响应式对象 依赖副作用的的一个结构，用来记录响应式对象中key所对应的副作用

export const track = (target, key) => {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target); // 获取响应式对象所对应的追踪（Map中存储的是key值所对应的副作用Set）
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key); // 获取属性所对应的副作用 如果没有也重新set一个空的
  if (!deps) {
    depsMap.set(key, (deps = new Map()));
  }
  deps.set(key, activeEffect);
};

export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }
  deps.forEach((effectFn) => {
    // 执行调度
    if (effectFn.scheduler) {
      console.log("执行调度");
      effectFn.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
};
