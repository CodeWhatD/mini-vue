import { isString } from "../utils";
import { render } from "./render_bak";
import { h } from "./vnode";

export const createApp = (rootComponent) => {
  const app = {
    mount(el) {
      if (isString(el)) {
        el = document.querySelector(el);
      }
      if (!rootComponent.render && !rootComponent.template) {
        rootComponent.template = el.innerHtml;
        el.innerHtml = "";
        render(h(rootComponent), el);
      }
    },
  };
  return app;
};
