import { reactive } from "../reactive";
import { normalizeVnode } from "./vnode";
import { patch } from "./render_bak";
import { effect } from "../reactive/effect";
const updateProps = (ins, vnode) => {
  const { type: Component, props: vnodeProps } = vnode;
  const props = (ins.props = {});
  const attrs = (ins.attrs = {});
  for (const key in vnodeProps) {
    const value = vnodeProps[key];
    Component.props.includes(key) ? (props[key] = value) : (attrs[key] = value);
  }
  ins.props = reactive(ins.props);
  ins.attrs = attrs;
};

export const mountComponent = (vnode, container, anchor) => {
  const { type: Component } = vnode; // 这里type就是组件含有setup的对象

  const instance = (vnode.component = {
    props: null,
    attrs: null,
    setupState: null, // 用来接收setup函数返回的值
    ctx: null,
    mount: null,
    subTree: null,
    update: null,
    isMount: false, // 是否已经挂载
    next: null,
  });

  updateProps(instance, vnode);
  instance.setupState = Component.setup?.(instance.props, {
    attrs: instance.attrs,
  });
  instance.ctx = {
    ...instance.props,
    ...instance.setupState,
  };
  // 这里就是响应式的精髓，setup的render中会调用响应式的变量，那么你只要用effet进行包裹就会收集该副作用函数实现其中响应式值变化时重新执行render
  instance.update = effect(() => {
    if (!instance.isMount) {
      const subTree = (instance.subTree = normalizeVnode(
        Component.render(instance.ctx)
      ));
      fallThrough(subTree, instance);
      patch(null, subTree, container, anchor);
      instance.isMount = true;
    } else {
      const preTree = instance.subTree;
      if (instance.next) {
        vnode = instance.next;
        instance.next = null;
        updateProps(instance, vnode);
        instance.ctx = {
          ...instance.props,
          ...instance.setupState,
        };
      }
      const subTree = (instance.subTree = normalizeVnode(
        Component.render(instance.ctx)
      ));
      fallThrough(subTree, instance);
      patch(preTree, subTree, container, anchor);
    }
  });
};

const fallThrough = (subTree, instance) => {
  if (Object.keys(instance.attrs).length) {
    subTree.props = {
      ...subTree.props,
      ...instance.attrs,
    };
  }
};
