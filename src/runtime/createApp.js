import { isString } from "../utils";
import { render } from "./render_bak";
import { h } from "./vnode";

export const createApp = (rootComponent) => {
  const app = {
    mount(el) {
      render(h(rootComponent), isString(el) ? document.querySelector(el) : el);
    },
  };
  return app;
};
