import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";
import { computed } from "./reactive/computed";
import { h, render } from "./runtime/index";
// const foo = (globalThis.foo = ref(0));
// const com = (globalThis.com = computed(() => {
//   console.log('开始')
//   return foo.value * 2;
// }));
// effect(() => {
//   console.log("track foo....", com.value);
// });
const TextNode = h(
  "div",
  {
    class: "a b",
    style: {
      color: "red",
    },
    onClick: () => {
      console.log("点击了");
    },
    checked: "",
    custome: false,
  },
  [1, h("span", { class: "bb" }, "内部"), "44"]
);
render(TextNode, document.body);
