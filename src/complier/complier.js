import { parse } from "./parse";
import { codegen } from "./codegen";
export function complier(template) {
  const ast = parse(template);
  const result = codegen(ast);
  return result;
}
