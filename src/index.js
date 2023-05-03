import { reactive } from "./reactive";
import { effect } from "./reactive/effect";

const observer = (globalThis.observer = reactive([1, 2, 3]));

effect(() => {
  console.log("track....", observer.length);
});
