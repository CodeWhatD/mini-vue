import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";
import { computed } from "./reactive/computed";
import { h, render, Fragment } from "./runtime";

const Com = {
  setup() {
    const count = ref(0);
    const add = () => {
      count.value++
      count.value++
      count.value++
    };
    return {
      count,
      add,
    };
  },
  render(ctx) {
    console.log('render')
    return [
      h("div", null, ctx.count.value ),
      h("button", { onClick: ctx.add }, "add"),
    ];
  },
};

const vnode = h(Com);
render(vnode, document.body);
