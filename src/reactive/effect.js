const activeEffectStack = [];
let activeEffect;
export const effect = (fn, options = {}) => {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      activeEffectStack.push(activeEffect);
      cleanup(effectFn);
      return fn();
    } finally {
      activeEffectStack.pop();
      activeEffect = activeEffectStack[activeEffectStack.length - 1];
    }
  };
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  if (options.scheduler) {
    effectFn.scheduler = options.scheduler;
  }
  return effectFn;
};

const cleanup = (effectFn) => {
  for (let i = 0; i < effectFn.deps.length; i++) {
    effectFn.deps[i].delete(effectFn);
  }
  // 清空deps数组
  effectFn.deps.length = 0;
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
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
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
  const effectsToRun = new Set(); 
  /**
   * 这里新创建一个set原因为
   * forEach在遍历set时，如果一个值已经被访问过，但该值被删除并重新添加到集合，如果此时forEach还没有结束，那么该值会被重新访问 解决这个问题很简单 我们可以在触发依赖的时候，构造一个set集合，并遍历
   */
  deps && deps.forEach((effectFn) => effectsToRun.add(effectFn));
  effectsToRun.forEach((effectFn) => {
    // 执行调度
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
};
