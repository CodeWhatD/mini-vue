import { reactive } from "./reactive";
import { effect } from "./reactive/effect";

const observer = (globalThis.observer = reactive({
  count1: 1,
  count2: 1,
}));

effect(() => {
  console.log("track count1....", observer.count1);
  effect(() => {
    console.log("track count2....", observer.count2);
  });
});
