import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";
import { computed } from "./reactive/computed";
import { h, render, Fragment } from "./runtime";

const obj = reactive({
  ok: true,
  name: "dmy",
});

window.obj = obj;

effect(() => {
  console.log("执行了函数"), obj.ok ? alert(obj.name) : 'false';
});
