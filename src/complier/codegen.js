import { NodeTypes } from "../complier/ast";
import { capitialize } from "../utils";
export function codegen(ast) {
  const code = traverseNode(ast);
  return `
    return ${code}
  `;
}
function traverseNode(node, parent) {
  switch (node.type) {
    case NodeTypes.ROOT:
      if (node.children.length === 1) {
        return traverseNode(node.children[0], node);
      }
      const result = traverseChildren(node);
      return result;
    case NodeTypes.ELEMENT:
      return resolveElementAstNode(node, parent);
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
const resolveElementAstNode = (node, parent) => {
  // 这里有一些递归调用resolveElementAstNode 是为了处理完一个指令后，可能该标签还有其他指令需要都处理了，不用担心死循环因为一直在用pluck吃掉指令
  // 处理 v-if
  const ifNode =
    pluck(node.directives, "if") || pluck(node.directives, "else-if");
  if (ifNode) {
    const { exp } = ifNode;
    const condition = exp.contnet; // v-if="condition" 條件
    const consequent = resolveElementAstNode(node, parent); // 表達式正確時的顯示
    let alternate; // false時的顯示
    const { children } = parent;
    let i = children.findIndex((child) => child === node) + 1;
    // 解释一下底下的循环，这里为了找v-if下面的兄弟节点，也就是v-else，需要排除空格节点找有效节点所以循环去找
    for (; i < children.length; i++) {
      const sibling = children[i];
      if (sibling.type === NodeTypes.TEXT && !sibling.content.trim()) {
        children.splice(i, 1);
        i--; // 防止for循环错乱
        continue;
      }
      // 找到下一个兄弟节点
      if (sibling.type === NodeTypes.ELEMENT) {
        if (
          pluck(sibling.directives, "else") ||
          pluck(sibling.directives, "else-if", false)
        ) {
          alternate = resolveElementAstNode(sibling, parent);
          children.splice(i, 1); // 避免重复渲染v-else节点，三目表达式已经有了
        }
      } 
    }
    return `${condition} ? ${consequent} : ${alternate || createTextVNode()}`;
  }
  // 处理 v-for
  const forNode = pluck(node.directives, "for");
  if (forNode) {
    const { exp } = forNode;
    // 下面这个正则示例为 (item,index) in items 把 (item,index) 和 items取出来
    const [args, source] = exp.content.split(/\sin\s|\sof\s/);
    return `h(Fragment,null,renderList(${source.trim()},${args} => ${resolveElementAstNode(
      node,
      parent
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
    const result = traverseNode(child, node);
    _results.push(result);
  }
  return `[${_results.join(", ")}]`;
};
