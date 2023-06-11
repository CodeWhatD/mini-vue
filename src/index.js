import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";
import { computed } from "./reactive/computed";
import { h, render, Fragment } from "./runtime";
render(
  h("ul", { style: { color: "red" } }, [
    h("li", null, "first"),
    h(Fragment, null, [h("li", null, "LAR")]),
    h("li", null, "last"),
  ]),
  document.body
);
setTimeout(() => {
  render(
    h("ul", { style: { color: "red" } }, [
      h("div", null, "first"),
      h(Fragment, null, [h("div", null, "mid")]),
      h("li", null, "last"),
    ]),
    document.body
  );
}, 1000);
