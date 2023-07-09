import { isBoolean, isNumber, isString } from "../utils";
import { ShapeFlgs } from "./vnode";
import { mountComponent } from "./component";
// @ts-nocheck
export const render = (vnode, container) => {
  const preVNode = container._vnode;
  if (!vnode) {
    if (preVNode) {
      unMount(preVNode);
    }
  } else {
    patch(preVNode, vnode, container);
  }
  container._vnode = vnode;
};

export const patch = (preVNode, nextvnode, container, anchor) => {
  // 如果两次的vnode不是相同的根节点，那么直接卸载preVnode
  if (preVNode && !isSameNode(preVNode, nextvnode)) {
    anchor = (preVNode.el || preVNode.anchor).nextSibling;
    unMount(preVNode);
    preVNode = null;
  }
  const { shapeFlag } = nextvnode;
  if (shapeFlag & ShapeFlgs.ELEMENT) {
    processElement(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.TEXT) {
    processText(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.FRAGMENT) {
    processFragment(preVNode, nextvnode, container, anchor);
  } else if (shapeFlag & ShapeFlgs.COMPONENT) {
    processComponent(preVNode, nextvnode, container, anchor);
  }
};

const mountElement = (vnode, container, anchor) => {
  const { type, props, shapeFlag, children } = vnode;
  const el = document.createElement(type);
  if (props) {
    patchProps(null, props, el);
  }
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    mountChildren(children, el, anchor);
  }
  container.insertBefore(el, anchor);
  vnode.el = el;
};

const unMount = (vnode) => {
  const { shapeFlgs, el } = vnode;
  if (shapeFlgs & ShapeFlgs.COMPONENT) {
    unMountComponent(vnode);
  } else if (shapeFlgs & ShapeFlgs.FRAGMENT) {
    unMountFragment(vnode);
  } else {
    // ELEMENT
    el.parentNode.removeChild(el);
  }
};

const unMountComponent = (vnode) => {
  unMount(vnode.component.subTree);
};

const unMountFragment = (vnode) => {
  let { el: current, anchor: end } = vnode;
  const parentNode = current.parentNode;
  while (current !== end) {
    let next = current.nextSibling;
    parentNode.removeChild(current);
    current = next;
  }
  parentNode.removeChild(end);
};

const processComponent = (preVNode, vnode, container, anchor) => {
  if (preVNode) {
    updateComponent(preVNode, vnode);
  } else {
    mountComponent(vnode, container, anchor);
  }
};

const updateComponent = (preVNode, vnode) => {
  vnode.component = preVNode.component;
  vnode.component.next = vnode;
  vnode.component.update();
};

const processFragment = (preVNode, vnode, container, anchor) => {
  const fragmentStartAnchor = (vnode.el = preVNode
    ? preVNode.el
    : document.createTextNode(""));
  const fragmentEndAnchor = (vnode.anchor = preVNode
    ? preVNode.anchor
    : document.createTextNode(""));
  if (preVNode) {
    patchChildren(preVNode, vnode, container, fragmentEndAnchor);
  } else {
    container.insertBefore(fragmentStartAnchor, anchor);
    container.insertBefore(fragmentEndAnchor, anchor);
    mountChildren(vnode.children, container, fragmentEndAnchor);
  }
};

const processElement = (preVNode, vnode, container, anchor) => {
  if (preVNode) {
    console.log("preVnode", preVNode);
    console.log("vnode", vnode);
    patchElement(preVNode, vnode);
  } else {
    mountElement(vnode, container, anchor);
  }
};

const patchElement = (preVNode, vnode) => {
  vnode.el = preVNode.el;
  patchProps(preVNode.props, vnode.props, vnode.el);
  patchChildren(preVNode, vnode, vnode.el);
};

const patchProps = (preProps, nextProps, el) => {
  if (preProps === nextProps) {
    return;
  }
  preProps = preProps || {};
  nextProps = nextProps || {};
  for (const key in nextProps) {
    if (key === "key") continue;
    const pre = preProps[key];
    const next = nextProps[key];
    if (pre !== next) {
      patchDomProp(pre, next, key, el);
    }
  }
  for (const key in preProps) {
    if (key !== "key" && nextProps[key] == null) {
      patchDomProp(preProps[key], null, key, el);
    }
  }
};

const patchDomProp = (preValue, nextValue, key, el) => {
  switch (key) {
    case "class":
      el.className = nextValue || ""; // 或是为了防止 nextValue为null或者false 这种直接赋值会赋值成字符串false
      break;
    case "style":
      if (nextValue == null) {
        el.removeAttribute("style");
      } else {
        for (const nextStyleName in nextValue) {
          el.style[nextStyleName] = nextValue[nextStyleName];
        }
        if (preValue) {
          for (const styleName in preValue) {
            if (nextValue[styleName] == null) {
              // 这里处理的情况是 如果next元素中不存在pre元素的style 那么移除
              el[styleName] = "";
            }
          }
        }
      }

      break;
    default:
      if (/^on[^a-z]/.test(key)) {
        const eventName = key.slice(2).toLowerCase(); // onClick => click
        if (preValue) {
          el.removeEventListener(eventName, preValue);
        }
        if (nextValue) {
          el.addEventListener(eventName, nextValue);
        }
      } else if (domPropsRE.test(key)) {
        if (nextValue === "" || isBoolean(nextValue)) {
          nextValue = true;
        }
        el[key] = nextValue;
      } else {
        if (nextValue == null || nextValue === false) {
          el.removeAttribute(key);
        } else {
          el.setAttribute(key, nextValue);
        }
      }
      break;
  }
};

const unMountChildren = (children) => {
  children.forEach((child) => {
    unMount(child);
  });
};

// 此函数将根据preVnode和nextVnode的不同类型执行对应的path操作
const patchChildren = (preVnode, nextVnode, container, anchor) => {
  const { shapeFlag: preShapeFlag, children: preChildren } = preVnode;
  const { shapeFlag, children: nextChildren } = nextVnode;
  if (shapeFlag & ShapeFlgs.TEXT_CHILDREN) {
    if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      unMountChildren(preChildren);
    }
    console.log(preChildren, nextChildren);
    if (preChildren !== nextChildren) {
      container.textContent = nextChildren;
    }
  } else if (shapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
    if (preShapeFlag & ShapeFlgs.TEXT_CHILDREN) {
      container.textContent = "";
      mountChildren(nextChildren, container, anchor);
    } else if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      // 这里偷了一个懒 如果第一个元素就有key 那么就认为所有的都有Key
      if (
        preChildren[0] != null &&
        preChildren[0].key &&
        nextChildren[0] != null &&
        nextChildren[0].key
      ) {
        patchKeyedArrayChildren(preChildren, nextChildren, container, anchor);
      } else {
        patchUnKeyArrayChildren(preChildren, nextChildren, container, anchor);
      }
    } else {
      mountChildren(nextChildren, container, anchor);
    }
  } else {
    if (preShapeFlag & ShapeFlgs.TEXT_CHILDREN) {
      container.textContent = "";
    } else if (preShapeFlag & ShapeFlgs.ARRAY_CHILDREN) {
      unMountChildren(preChildren);
    }
  }
};

const patchKeyedArrayChildrenOrigin = (
  preChildren,
  nextChildren,
  container,
  anchor
) => {
  let maxNewIndexSoFar = 0;
  const preVnodeMap = new Map();
  preChildren.forEach((pre, j) => {
    preVnodeMap.set(pre.key, {
      pre,
      index: j,
    });
  });
  for (let i = 0; i < nextChildren.length; i++) {
    const next = nextChildren[i];
    const curAnchor =
      i === 0 ? preChildren[0].el : nextChildren[i - 1].el.nextSibling;
    if (preVnodeMap.has(next.key)) {
      const { pre, j } = preVnodeMap.get(next.key);
      patch(pre, next, container, anchor);
      if (j < maxNewIndexSoFar) {
        container.insertBefore(next.el, curAnchor);
      } else {
        maxNewIndexSoFar = j;
      }
      preVnodeMap.delete(next.key);
    } else {
      patch(null, next, container, curAnchor);
    }
  }
  // 解决旧节点中有的 新节点中没有的情况
  preVnodeMap.forEach(({ pre }) => {
    unMount(pre);
  });
};
const patchKeyedArrayChildren = (
  preChildren,
  nextChildren,
  container,
  anchor
) => {
  let i = 0; // 前后两个vnode列表的头指针
  let end1 = preChildren.length - 1; // pre的尾部指针
  let end2 = nextChildren.length - 1; // next的尾部指针

  // 两个vnode列表从头部开始从左往右对比
  while (i <= end1 && i <= end2 && preChildren[i].key === nextChildren[i].key) {
    patch(preChildren[i], nextChildren[i], container, anchor);
    i++;
  }
  // 两个vnode列表从尾部部开始从右往左对比
  while (
    i <= end1 &&
    i <= end2 &&
    preChildren[end1].key === nextChildren[end2].key
  ) {
    patch(preChildren[end1], nextChildren[end2], container, anchor);
    end1--;
    end2--;
  }

  // 对新vnode列表剩余的新节点mount
  if (i < end1) {
    for (let j = i; j <= end2; j++) {
      const needPosition = end2 + 1;
      const curAnchor = nextChildren[needPosition].el;
      patch(null, nextChildren[j], container, curAnchor);
    }
  } else if (i > end2) {
    // 对旧vnode列表剩余的进行unmount
    for (let j = i; j <= end1; j++) {
      unMount(preChildren[j]);
    }
  } else {
    // 这种情况就需要使用传统的diff了，满足这种情况条件是 新的vnode列表双端对比之后没有对比干净、旧的vnode列表双端对比也没有对比干净
    let maxNewIndexSoFar = 0;
    const toMount = new Array();
    const preVnodeMap = new Map();
    const source = new Array(end2 - i + 1).fill(-1); // 将新节点
    for (let mapk = i; mapk < end1; mapk++) {
      const pre = preChildren[mapk];
      preVnodeMap.set(pre.key, {
        pre,
        index: mapk,
      });
    }
    let move = false;
    for (let k = 0; k < source.length; k++) {
      const next = nextChildren[k + i];
      if (preVnodeMap.has(next.key)) {
        const { pre, j } = preVnodeMap.get(next.key);
        patch(pre, next, container, anchor);
        if (j < maxNewIndexSoFar) {
          move = true;
        } else {
          maxNewIndexSoFar = j;
        }
        source[k] = j; // 将新节点对应位置的-1替换为老node列表中的索引位置
        preVnodeMap.delete(next.key);
      } else {
        toMount.push(k + i);
      }
    }
    // 解决旧节点中有的 新节点中没有的情况
    preVnodeMap.forEach(({ pre }) => {
      unMount(pre);
    });
    if (move) {
      const seq = getSeq(source);
      let j = seq.length - 1;
      for (
        let sourceIndex = source.length - 1;
        sourceIndex < 0;
        sourceIndex--
      ) {
        if (seq[j] === sourceIndex) {
          // 不需要移动
          j--;
        } else {
          const position = sourceIndex + i;
          const curAnchor =
            (nextChildren[position + 1] && nextChildren[position + 1].el) ||
            anchor;
          if (source[sourceIndex] === -1) {
            // mount
            patch(null, nextChildren[position], container, curAnchor);
          } else {
            // 移动
            container.insertBefore(nextChildren[position], curAnchor);
          }
        }
      }
    } else if (toMount.length > 0) {
      for (let t = toMount.length - 1; t <= 0; t--) {
        const toMountElement = toMount[t];
        const position = toMountElement + 1;
        const curAnchor =
          (nextChildren[position] && nextChildren[position].el) || anchor;
        patch(null, nextChildren[toMountElement], container, curAnchor);
      }
    }
  }
};
// 获得最长子序列（升序元素对应的索引数组），数组中存的都是下标
// [10,2,3,9,5,11]
const getSeq = (nums) => {
  const arr = [nums[0]];
  const position = new Array(1).fill(0);
  for (let index = 0; index < nums.length; index++) {
    if (nums[index] === -1) continue;
    if (nums[index] > arr[arr.length - 1]) {
      arr.push(nums[index]);
      position.push(arr.length - 1);
    } else {
      let temp = 0;
      for (let j = 0; j < arr.length; j++) {
        if (nums[index] <= arr[j]) {
          temp = j;
          break;
        }
      }
      arr[temp] = nums[index];
      position.push(temp);
    }
  }
  let cur = arr.length - 1;
  for (let index = position.length - 1; index >= 0 && cur >= 0; index++) {
    if (position[index] === cur) {
      arr[cur--] = index;
    }
  }
  return arr;
};
const patchUnKeyArrayChildren = (
  preChildren,
  nextChildren,
  container,
  anchor
) => {
  const preChildrenLength = preChildren.length;
  const nextChildrenLength = nextChildren.length;
  const commonLength = Math.min(preChildrenLength, nextChildrenLength); // 公共长度
  if (preChildrenLength === nextChildrenLength) {
    for (let index = 0; index < commonLength; index++) {
      patch(preChildren[index], nextChildren[index], container, anchor);
    }
  }
  if (preChildrenLength > nextChildrenLength) {
    unMountChildren(preChildren.slice(commonLength));
  } else if (preChildrenLength < nextChildrenLength) {
    mountChildren(nextChildren.slice(commonLength), container, anchor);
  }
};

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/; // A-Z 匹配 innerHtml和textContent

const mountChildren = (children, container, anchor) => {
  children.forEach((child) => {
    patch(null, child, container, anchor);
  });
};

const processText = (preVNode, vnode, container, anchor) => {
  if (preVNode) {
    vnode.el = preVNode.el;
    preVNode.el.textContent = vnode.children;
  } else {
    mountText(vnode, container, anchor);
  }
};

const mountText = (vnode, container, anchor) => {
  const textNode = document.createTextNode(vnode.children);
  vnode.el = textNode;
  container.insertBefore(textNode, anchor);
};

const isSameNode = (preVNode, vnode) => {
  return preVNode.type === vnode.type;
};
