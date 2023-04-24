/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _reactive__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reactive */ \"./src/reactive/index.js\");\n/* harmony import */ var _reactive_effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reactive/effect */ \"./src/reactive/effect.js\");\n\n\n\nconst observer = (globalThis.observer = (0,_reactive__WEBPACK_IMPORTED_MODULE_0__.reactive)({\n  a: 1,\n}));\n\n(0,_reactive_effect__WEBPACK_IMPORTED_MODULE_1__.effect)(() => {\n  console.log(\"track....\", observer.a);\n});\n\n\n//# sourceURL=webpack://mini-vue/./src/index.js?");

/***/ }),

/***/ "./src/reactive/effect.js":
/*!********************************!*\
  !*** ./src/reactive/effect.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"effect\": () => (/* binding */ effect),\n/* harmony export */   \"track\": () => (/* binding */ track),\n/* harmony export */   \"trigger\": () => (/* binding */ trigger)\n/* harmony export */ });\nlet activeEffect;\nconst effect = (fn) => {\n  const effectFn = () => {\n    try {\n      activeEffect = effectFn;\n      fn();\n    } finally {\n    }\n  };\n  effectFn();\n  return effectFn;\n};\n\nconst targetMap = new WeakMap(); // 创建一个响应式对象 依赖副作用的的一个结构，用来记录响应式对象中key所对应的副作用\n\nconst track = (target, key) => {\n  if (!activeEffect) {\n    return;\n  }\n  let depsMap = targetMap.get(target); // 获取响应式对象所对应的追踪（Map中存储的是key值所对应的副作用Set）\n  if (!depsMap) {\n    targetMap.set(target, (depsMap = new Map()));\n  }\n  let deps = depsMap.get(key); // 获取属性所对应的副作用 如果没有也重新set一个空的\n  if (!deps) {\n    depsMap.set(key, (deps = new Map()));\n  }\n  deps.set(key, activeEffect);\n};\n\nconst trigger = (target, key) => {\n  const depsMap = targetMap.get(target);\n  if (!depsMap) {\n    return;\n  }\n  const deps = depsMap.get(key);\n  if (!deps) {\n    return;\n  }\n  deps.forEach((effectFn) => {\n    effectFn();\n  });\n};\n\n\n//# sourceURL=webpack://mini-vue/./src/reactive/effect.js?");

/***/ }),

/***/ "./src/reactive/index.js":
/*!*******************************!*\
  !*** ./src/reactive/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"reactive\": () => (/* binding */ reactive)\n/* harmony export */ });\n/* harmony import */ var _utils_isObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/isObject */ \"./src/utils/isObject.js\");\n/* harmony import */ var _effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./effect */ \"./src/reactive/effect.js\");\n\n\nconst reactive = (target) => {\n  if (!(0,_utils_isObject__WEBPACK_IMPORTED_MODULE_0__.isObject)(target)) {\n    return target;\n  }\n  const proxy = new Proxy(target, {\n    get(target, key, recevier) {\n      (0,_effect__WEBPACK_IMPORTED_MODULE_1__.track)(target, key);\n      return Reflect.get(target, key, recevier);\n    },\n    set(target, key, value, recevier) {\n      const res = Reflect.set(target, key, value, recevier);\n      (0,_effect__WEBPACK_IMPORTED_MODULE_1__.trigger)(target, key);\n      return res;\n    },\n  });\n  return proxy;\n};\n\n\n//# sourceURL=webpack://mini-vue/./src/reactive/index.js?");

/***/ }),

/***/ "./src/utils/isObject.js":
/*!*******************************!*\
  !*** ./src/utils/isObject.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"isObject\": () => (/* binding */ isObject)\n/* harmony export */ });\nconst isObject = (target) => {\n  return typeof target === \"object\" && target !== null;\n};\n\n\n//# sourceURL=webpack://mini-vue/./src/utils/isObject.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;