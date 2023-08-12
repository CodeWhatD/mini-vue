import { NodeTypes, ElementTypes, createRoot } from "./ast";
import { isVoidTag, isNativeTag } from ".";
import { camelize } from "../utils";
export function parse(content) {
  const context = createParseContext(content);
  const children = parseChildren(context);
  return createRoot(children);
}

function createParseContext(content) {
  return {
    options: {
      delimiters: ["{{", "}}"],
      isVoidTag,
      isNativeTag,
    },
    source: content,
  };
}

function parseChildren(context) {
  let nodes = new Array();
  while (!isEnd(context)) {
    let node;
    const str = context.source;
    if (str.startsWith(context.options.delimiters[0])) {
      // 解析插值
      node = parseInterpolation(context);
    } else if (str[0] === "<") {
      // 解析Element
      node = parseElement(context);
    } else {
      // 解析文本
      node = parseText(context);
    }
    nodes.push(node);
  }
  let needFilterWhiteSpace = false;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === NodeTypes.TEXT) {
      // 区分文本节点是否全是空白。 非全空白例子 a     b
      if (/[^\t\r\f\n]/.test(node.content)) {
        node.content = node.content.replace(/[\t\r\f\n]+/g, " ");
      } else {
        // 文本节点全是空白
        const pre = nodes[i - 1];
        const next = nodes[i + 1];
        if (
          !pre ||
          !next ||
          (pre.type === NodeTypes.ELEMENT &&
            next.type === NodeTypes.ELEMENT &&
            /[\r\n]/.test(node.content))
        ) {
          nodes[i] = null;
          if (!needFilterWhiteSpace) {
            needFilterWhiteSpace = true;
          }
        } else {
          // 这种情况匹配的是 <span>a</span>     <span>b</span>替换的是这俩标签之间的空格
          node.content = " ";
        }
      }
      if (needFilterWhiteSpace) {
        nodes = nodes.filter(Boolean);
      }
    }
  }
  return nodes;
}

function isEnd(context) {
  const str = context.source;
  return str.startsWith("</") || !str;
}
/**
 *
 * @param {上下文} context
 * @param {吃掉字符串数量} numberOfCharters
 */
function advanceBy(context, numberOfCharters) {
  context.source = context.source.slice(numberOfCharters);
}

/**
 *
 * @param {上下文} context
 * 吃掉起始所有的空格空格 比如 "      =1  " 把=1前面的空格都吃掉
 */
function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

// 下面函数的例子 <div id='foo'>hello {{ name }}</div>
function parseText(context) {
  const endTokends = ["<", context.options.delimiters[0]];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokends.length; i++) {
    const index = context.source.indexOf(endTokends[i]);
    if (index > -1 && index < endIndex) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content: content,
  };
}

function parseTextData(context, length) {
  const text = context.source.slice(length);
  advanceBy(context, length);
  return text;
}

function parseInterpolation(context) {
  const [open, close] = context.options.delimiters;
  advanceBy(context, open.length);
  const closeIndex = context.source.indexOf(close);
  const content = parseTextData(context, closeIndex).trim(); // 取到插值中的内容
  advanceBy(content, closeIndex);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      isStatic: false,
    },
  };
}

function parseElement(context) {
  // 匹配开头
  const element = parseTag(context);
  if (element.isSelfClosing || context.options.isVoidTag(element.tag)) {
    return element;
  }
  element.children = parseChildren(context);
  // 匹配结尾
  parseTag(context);
  return element;
}

function parseAttributes(context) {
  const props = new Array();
  const directives = new Array();
  while (
    context.source.length &&
    !context.source.startsWith(">") &&
    !context.source.startsWith("/>")
  ) {
    let attr = parseAttribute(context);
    if (attr.type === NodeTypes.DIRECTIVE) {
      directives.push(attr);
    } else {
      props.push(attr);
    }
  }
  return {
    props,
    directives,
  };
}
function parseAttribute(context) {
  // 这段正则是去找属性的开头比如id=去找id
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
  const name = match[0];
  // 把例子中的id吃掉
  advanceBy(context, match[0].length);
  advanceSpaces(context);
  let value;
  if (context.source[0] === "=") {
    // 此处判断的意义是有可能存在checked这种没有value的情况
    advanceBy(context, 1); // 吃掉等号
    advanceSpaces(context);
    value = parseAttributeValue(context);
    advanceSpaces(context);
  }
  // Directive 指令
  if (/^(:|@|v-)/.test(name)) {
    let dirname, argContent;
    if (name[0] === ":") {
      dirname = "bind";
      argContent = name.slice(1);
    } else if (name[0] === "@") {
      dirname = "on";
      argContent = name.slice(1);
    } else if (name.startsWith("v-")) {
      const [_dirName, _argContent] = name.slice(2).split(":");
      dirname = _dirName;
      argContent = _argContent;
    }
    return {
      type: NodeTypes.DIRECTIVE,
      name: dirname,
      exp: value && {
        // 表达式 :class="foo" 其中的foo
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        isStatic: false,
      },
      arg: argContent && {
        // :class="foo" 其中的class
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: camelize(argContent),
        isStatic: true,
      },
    };
  }
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value.content,
    },
  };
}

function parseAttributeValue(context) {
  const quote = context.source[0];
  advanceBy(context, 1);
  const endIndex = context.source.indexOf(quote);
  const content = parseTextData(context, endIndex);
  advanceBy(context, 1);
  return { content };
}

function isComponent(tag, context) {
  return !context.options.isNativeTag(tag);
}

function parseTag(context) {
  const match = /^<\/?([a-z][^\t\r\n\f />]*/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceSpaces(context);
  const { props, directives } = parseAttributes(context);
  const isSelfClosing = context.source.startsWith("/>");
  advanceBy(context, isSelfClosing ? 2 : 1);
  const tagType = isComponent(tag, context)
    ? ElementTypes.COMPONENT
    : ElementTypes.ELEMENT;
  return {
    type: NodeTypes.ELEMENT,
    tag: "",
    tagType,
    props: props,
    directives: directives,
    isSelfClosing, // 是否为自闭和标签
    children: [],
  };
}
