import { reactive } from "../reactive";

const initProps = (ins, vnode) => {
  const { type: Component, props: vnodeProps } = vnode;
  const props = (ins.props = {});
  const attrs = (ins.attrs = {});
  for (const key in vnodeProps) {
    const value = vnodeProps[key];
    Component.props.include(key) ? (props[key] = value) : (attrs[key] = value);
  }
  ins.props = reactive(ins.props);
};

export const mountComponent = (vnode, container, anchor) => {
  const instance = {
    props: null,
    attrs: null,
  };

  initProps(instance, vnode);
};
