import { NodeTypes } from "../complier/ast";
import { capitialize } from "../utils";
export function codegen(ast) {
  const code = traverseNode(ast);
  return `
    return ${code}
  `;
}
function traverseNode(node) {
  switch (node.type) {
    case NodeTypes.ROOT:
      if (node.children.length === 1) {
        return traverseNode(node.children[0]);
      }
      const result = traverseChildren(node);
      return result;
    case NodeTypes.ELEMENT:
      return resolveElementAstNode(node);
    case NodeTypes.INTERPOLATION:
      return createTextVNode(node.content);
    case NodeTypes.TEXT:
      return createTextVNode(node);
    default:
      break;
  }
}

const createTextVNode = (node) => {
  const child = createText(node);
  return `h(Text,null,'${child}')`;
};

// 此方法目的是方便解析静态与非静态节点内容，静态则直接转字符串相反非静态直接返回表达式内容
const createText = ({ isStatic = true, content = "" } = {}) => {
  return isStatic ? JSON.stringify(content) : content;
};

// 处理特殊指令
const resolveElementAstNode = (node) => {
  const forNode = pluck(node.directives, "for");
  if (forNode) {
    const { exp } = forNode;
    // 下面这个正则示例为 (item,index) in items 把 (item,index) 和 items取出来
    const [args, source] = exp.content.split(/\sin\s|\sof\s/);
    return `h(Fragment,null,renderList(${source.trim()},${args} => ${createElementVNode(
      node
    )}))`;
  }
  return createElementVNode(node);
};

const pluck = (directives, name, remove = true) => {
  const index = directives.findIndex((dir) => dir.name === name);
  const _dirInstance = directives[index];
  if (index > -1 && remove) {
    directives.splice(index, 1);
  }
  return _dirInstance;
};

const createElementVNode = (node) => {
  const { children } = node;
  const tag = JSON.stringify(node.tag);
  const propsArr = createPropsArr(node);
  const propsStr = propsArr.length ? `{ ${propsArr.join(", ")} }` : "null";

  if (!children.length) {
    return propsStr === "null" ? `h(${tag})` : `h(${tag},${propsStr})`;
  }
  let childrenStr = traverseChildren(node);
  return `h(${tag},null,${childrenStr})`;
};

const createPropsArr = (node) => {
  const { props, directives } = node;
  return [
    ...props.map((prop) => `${prop.name}: ${createText(prop.value)}`),
    ...directives.map((dir) => {
      switch (dir.name) {
        case "bind":
          return `${dir.arg.content}:${createText(dir.exp)}`;
        case "on":
          const eventName = `on${capitialize(dir.arg.content)}`;
          let exp = dir.exp.content;
          if (/\([^)]*?\)$/.test(exp) && !exp.includes("=>")) {
            exp = `$event => ${exp}`;
          }
          return `${eventName}: ${exp}`;
        case "html":
          return `innerHtml: ${createText(dir.exp)}`;
        default:
          return `${dir.name}:${createText(dir.exp)}`;
      }
    }),
  ];
};

const traverseChildren = (node) => {
  const { children } = node;
  if (children.length === 1) {
    const child = children[0];
    if (child.type === NodeTypes.TEXT) {
      return createText(child);
    }
    if (child.type === NodeTypes.INTERPOLATION) {
      return createText(child.content);
    }
  }
  const _results = new Array();
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const result = traverseNode(child);
    _results.push(result);
  }
  return `[${_results.join(", ")}]`;
};
