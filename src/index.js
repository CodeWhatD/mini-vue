import { reactive } from "./reactive";
import { effect } from "./reactive/effect";
import { ref } from "./reactive/ref";

const foo = (globalThis.foo = ref(1));

effect(() => {
  console.log("track foo....", foo.value);
});
