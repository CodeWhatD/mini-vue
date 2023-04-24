import { reactive } from "./reactive";
import { effect } from "./reactive/effect";

const observer = (globalThis.observer = reactive({
  a: 1,
}));

effect(() => {
  console.log("track....", observer.a);
});
