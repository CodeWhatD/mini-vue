import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";
import { computed } from "./reactive/computed";

const foo = (globalThis.foo = ref(0));
const com = (globalThis.com = computed(() => {
  console.log('开始')
  return foo.value * 2;
}));
// effect(() => {
//   console.log("track foo....", com.value);
// });
