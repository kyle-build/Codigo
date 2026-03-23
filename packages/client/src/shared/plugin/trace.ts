// import type { LoaderContext } from "@rspack/core";
// import { parse } from "@babel/parser";
// import generateModule from "@babel/generator";
// const generate = (generateModule as any).default || generateModule;
// import t from "@babel/types";
// import traverseModule from "@babel/traverse";
// const traverse = (traverseModule as any).default || traverseModule;
// import path from "path";

// // 组件过滤黑名单
// const externalAntd = [
//   "Popup",
//   "Dialog",
//   "ActionSheet",
//   "Toast",
//   "Popover",
//   "FloatingBubble",
//   "FloatingPanel",
// ];

// // 常用事件白名单
// const commonEvents = [
//   "onClick",
//   "onChange",
//   "onSubmit",
//   "onFocus",
//   "onBlur",
//   "onMouseEnter",
//   "onMouseLeave",
//   "onKeyDown",
//   "onKeyUp",
//   "onScroll",
//   "onWheel",
//   "onDrag",
//   "onDrop",
//   "onCopy",
//   "onCut",
//   "onPaste",
//   "onTouchStart",
//   "onTouchMove",
//   "onTouchEnd",
//   "onTouchCancel",
//   "onPointerDown",
//   "onPointerMove",
//   "onPointerUp",
//   "onPointerCancel",
//   "onPointerOut",
//   "onPointerOver",
//   "onPointerEnter",
//   "onPointerLeave",
//   "onGestureStart",
//   "onGestureChange",
//   "onGestureEnd",
//   "onGestureCancel",
//   "onGestureOver",
// ];

// // 上报函数列表
// const reportFunctions = [
//   "reportUseState",
//   "reportUseEffect",
//   "reportModel",
//   "reportComponentEvent",
//   "reportEntryFunction",
//   "reportReturnFunction",
//   "reportComponentProps",
//   "reportModelData",
// ];

// /**
//  * 获取节点的行号
//  * @param nodePath
//  * @returns
//  */
// const getLineNumber = (nodePath: any): number => {
//   if (nodePath.node.loc) {
//     return nodePath.node.loc.start.line;
//   }
//   return 0;
// };

// /**
//  * useState转换
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const userStateNodeTransform = (nodePath: any, relPath: string) => {
//   if (
//     t.isIdentifier(nodePath.node.callee) &&
//     nodePath.node.callee.name === "useState"
//   ) {
//     const parentVariableDeclarator = nodePath.findParent((p) =>
//       p.isVariableDeclarator()
//     );
//     if (!parentVariableDeclarator) return;

//     const arrayPattern = parentVariableDeclarator.node.id;
//     if (!t.isArrayPattern(arrayPattern) || arrayPattern.elements.length !== 2)
//       return;

//     const [stateName, _] = arrayPattern.elements;
//     if (!t.isIdentifier(stateName)) return;

//     const originSetterName = t.identifier(
//       `origin${
//         stateName.name.charAt(0).toUpperCase() + stateName.name.slice(1)
//       }`
//     );

//     arrayPattern.elements[1] = originSetterName;

//     const setterFunction = t.variableDeclaration("const", [
//       t.variableDeclarator(
//         t.identifier(
//           `set${
//             stateName.name.charAt(0).toUpperCase() + stateName.name.slice(1)
//           }`
//         ),
//         t.arrowFunctionExpression(
//           [t.identifier("data")],
//           t.blockStatement([
//             t.variableDeclaration("const", [
//               t.variableDeclarator(
//                 t.identifier(
//                   `old${
//                     stateName.name.charAt(0).toUpperCase() +
//                     stateName.name.slice(1)
//                   }`
//                 ),
//                 stateName
//               ),
//             ]),
//             t.variableDeclaration("const", [
//               t.variableDeclarator(
//                 t.identifier("nextValue"),
//                 t.conditionalExpression(
//                   t.binaryExpression(
//                     "===",
//                     t.unaryExpression("typeof", t.identifier("data")),
//                     t.stringLiteral("function")
//                   ),
//                   t.callExpression(t.identifier("data"), [stateName]),
//                   t.identifier("data")
//                 )
//               ),
//             ]),
//             t.expressionStatement(
//               t.callExpression(t.identifier("reportUseState"), [
//                 t.objectExpression([
//                   t.objectProperty(
//                     t.identifier("type"),
//                     t.stringLiteral("useState")
//                   ),
//                   t.objectProperty(
//                     t.identifier("filePath"),
//                     t.stringLiteral(relPath)
//                   ),
//                   t.objectProperty(
//                     t.identifier("line"),
//                     t.numericLiteral(nodePath.node.loc?.start.line || 0)
//                   ),
//                   t.objectProperty(
//                     t.identifier("name"),
//                     t.stringLiteral(stateName.name)
//                   ),
//                   t.objectProperty(
//                     t.identifier("oldValue"),
//                     t.identifier(
//                       `old${
//                         stateName.name.charAt(0).toUpperCase() +
//                         stateName.name.slice(1)
//                       }`
//                     )
//                   ),
//                   t.objectProperty(
//                     t.identifier("newValue"),
//                     t.identifier("nextValue")
//                   ),
//                 ]),
//               ])
//             ),
//             t.expressionStatement(
//               t.callExpression(originSetterName, [t.identifier("nextValue")])
//             ),
//           ])
//         )
//       ),
//     ]);

//     const parentStatement = nodePath.findParent((p) =>
//       p.isVariableDeclaration()
//     );
//     if (parentStatement) {
//       parentStatement.insertAfter(setterFunction);
//     }
//   }
// };

// /**
//  * useEffect转换
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const userEffectNodeTransform = (nodePath: any, relPath: string) => {
//   if (
//     t.isIdentifier(nodePath.node.callee) &&
//     nodePath.node.callee.name === "useEffect"
//   ) {
//     const dependenciesNode = nodePath.node.arguments[1];
//     if (!dependenciesNode || !t.isArrayExpression(dependenciesNode)) return;

//     const dependencies = dependenciesNode.elements;
//     const reportUseEffect = t.expressionStatement(
//       t.callExpression(t.identifier("reportUseEffect"), [
//         t.objectExpression([
//           t.objectProperty(t.identifier("type"), t.stringLiteral("useEffect")),
//           t.objectProperty(t.identifier("filePath"), t.stringLiteral(relPath)),
//           t.objectProperty(
//             t.identifier("line"),
//             t.numericLiteral(nodePath.node.loc?.start.line || 0)
//           ),
//           t.objectProperty(
//             t.identifier("dependencies"),
//             t.arrayExpression(dependencies)
//           ),
//         ]),
//       ])
//     );
//     nodePath.insertBefore(reportUseEffect);
//   }
// };

// /**
//  * 过滤函数 函数式组件 node_modules下的函数 上报函数
//  * @param nodePath
//  * @param functionName
//  * @param returnArgumentType
//  * @param filePath
//  * @returns
//  */
// const filterFunction = (
//   nodePath: any,
//   functionName: string,
//   filePath
// ): boolean => {
//   if (
//     /node_modules/.test(filePath) ||
//     reportFunctions.includes(functionName) ||
//     isJSXElementType(nodePath, filePath)
//   ) {
//     return true;
//   }
//   return false;
// };

// /**
//  * 获取函数返回值类型
//  * @param nodePath
//  */
// const isJSXElementType = (nodePath: any, relPath: string): boolean => {
//   if (!(relPath.endsWith(".tsx") || relPath.endsWith(".jsx"))) {
//     return false;
//   }
//   if (!nodePath || !nodePath.node) {
//     return false;
//   }
//   if (
//     t.isFunctionDeclaration(nodePath.node) ||
//     t.isArrowFunctionExpression(nodePath.node)
//   ) {
//     const body = nodePath.node.body.body;
//     if (!body || body.length === 0) {
//       return false;
//     }
//     for (const temp of body) {
//       if (t.isReturnStatement(temp) && temp.argument) {
//         if (t.isJSXElement(temp.argument)) {
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// };

// /**
//  * 函数入参
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const functionEntryTransform = (nodePath: any, relPath: string) => {
//   if (!nodePath.node || !nodePath.node.body) return;

//   if (!t.isBlockStatement(nodePath.node.body)) {
//     nodePath.node.body = t.blockStatement([
//       t.returnStatement(nodePath.node.body),
//     ]);
//   }

//   const functionName = nodePath.node.id?.name || "anonymous";
//   if (filterFunction(nodePath, functionName, relPath)) {
//     return;
//   }

//   if (!Array.isArray(nodePath.node.body.body)) return;

//   const params = nodePath.node.params.map((param: any) => {
//     if (t.isIdentifier(param)) {
//       return {
//         name: param.name,
//         value: t.identifier(param.name),
//       };
//     }
//     return {
//       name: "unknown",
//       value: t.identifier("undefined"),
//     };
//   });

//   const reportCall = t.expressionStatement(
//     t.callExpression(t.identifier("reportEntryFunction"), [
//       t.objectExpression([
//         t.objectProperty(
//           t.identifier("type"),
//           t.stringLiteral("function-entry")
//         ),
//         t.objectProperty(t.identifier("filePath"), t.stringLiteral(relPath)),
//         t.objectProperty(
//           t.identifier("line"),
//           t.numericLiteral(getLineNumber(nodePath))
//         ),
//         t.objectProperty(
//           t.identifier("functionNames"),
//           t.arrayExpression([t.stringLiteral(functionName)])
//         ),
//         t.objectProperty(
//           t.identifier("params"),
//           t.arrayExpression(
//             params.map((p) =>
//               t.objectExpression([
//                 t.objectProperty(t.identifier("name"), t.stringLiteral(p.name)),
//                 t.objectProperty(t.identifier("value"), p.value),
//               ])
//             )
//           )
//         ),
//       ]),
//     ])
//   );
//   nodePath.get("body").unshiftContainer("body", reportCall);
// };

// /**
//  * 函数返回值
//  * @param nodePath
//  * @param relPath
//  */
// const functionReturnTransform = (nodePath: any, relPath: string) => {
//   if (!nodePath.node || !nodePath.node.body) return;
//   const functionName = nodePath.node.id?.name || "anonymous";
//   if (filterFunction(nodePath, functionName, relPath)) {
//     return;
//   }

//   nodePath.traverse({
//     ReturnStatement(returnPath) {
//       if (returnPath.getData("transformed")) {
//         return;
//       }
//       returnPath.setData("transformed", true);

//       const originalReturnExpr = returnPath.node.argument;
//       if (!originalReturnExpr) return;

//       const temp = `_${functionName}`;

//       const iife = t.arrowFunctionExpression(
//         [],
//         t.blockStatement([
//           t.variableDeclaration("const", [
//             t.variableDeclarator(t.identifier(temp), originalReturnExpr),
//           ]),
//           t.expressionStatement(
//             t.callExpression(t.identifier("reportReturnFunction"), [
//               t.objectExpression([
//                 t.objectProperty(
//                   t.identifier("type"),
//                   t.stringLiteral("function-return")
//                 ),
//                 t.objectProperty(
//                   t.identifier("filePath"),
//                   t.stringLiteral(relPath)
//                 ),
//                 t.objectProperty(
//                   t.identifier("line"),
//                   t.numericLiteral(getLineNumber(returnPath))
//                 ),
//                 t.objectProperty(
//                   t.identifier("functionNames"),
//                   t.arrayExpression([t.stringLiteral(functionName)])
//                 ),
//                 t.objectProperty(
//                   t.identifier("functionReturn"),
//                   t.identifier(temp)
//                 ),
//               ]),
//             ])
//           ),
//           t.returnStatement(t.identifier(temp)),
//         ])
//       );

//       returnPath.node.argument = t.callExpression(iife, []);
//       returnPath.stop();
//     },
//   });
// };

// /**
//  * 函数转换
//  * @param nodePath
//  * @param relPath
//  */
// const functionTransform = (nodePath: any, relPath: string): void => {
//   functionEntryTransform(nodePath, relPath);
//   functionReturnTransform(nodePath, relPath);
// };

// /**
//  * 数据流转追踪
//  * @param nodePath
//  * @param relPath
//  */
// const modelsTransform = (nodePath: any, relPath: string) => {};

// /**
//  * 组件事件
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const componentEventTransform = (nodePath: any, relPath: string) => {
//   const attributes = nodePath.get("openingElement").node.attributes;
//   attributes.forEach((attr) => {
//     if (!t.isJSXAttribute(attr)) return;
//     const attrName = attr.name.name as string;
//     if (!commonEvents.includes(attrName)) return;
//     const eventHandler = attr.value;
//     if (!t.isJSXExpressionContainer(eventHandler)) return;

//     const componentName = nodePath.get("openingElement").node.name.name;
//     const wrappedHandler = t.arrowFunctionExpression(
//       [t.identifier("event")],
//       t.blockStatement([
//         t.expressionStatement(
//           t.callExpression(t.identifier("reportComponentEvent"), [
//             t.objectExpression([
//               t.objectProperty(t.identifier("type"), t.stringLiteral("event")),
//               t.objectProperty(
//                 t.identifier("filePath"),
//                 t.stringLiteral(relPath)
//               ),
//               t.objectProperty(
//                 t.identifier("line"),
//                 t.numericLiteral(nodePath.node.loc?.start.line || 0)
//               ),
//               t.objectProperty(
//                 t.identifier("functionNames"),
//                 t.arrayExpression([t.stringLiteral(componentName)])
//               ),
//               t.objectProperty(t.identifier("name"), t.stringLiteral(attrName)),
//               t.objectProperty(
//                 t.identifier("component"),
//                 t.stringLiteral(componentName)
//               ),
//               t.objectProperty(
//                 t.identifier("componentCodePosition"),
//                 t.objectExpression([
//                   t.objectProperty(
//                     t.identifier("filePath"),
//                     t.stringLiteral(relPath)
//                   ),
//                   t.objectProperty(
//                     t.identifier("line"),
//                     t.numericLiteral(nodePath.node.loc?.start.line || 0)
//                   ),
//                 ])
//               ),
//               t.objectProperty(
//                 t.identifier("handler"),
//                 t.stringLiteral(
//                   t.isIdentifier(eventHandler.expression)
//                     ? eventHandler.expression.name
//                     : "anonymous"
//                 )
//               ),
//               t.objectProperty(
//                 t.identifier("handlerCodePosition"),
//                 t.objectExpression([
//                   t.objectProperty(
//                     t.identifier("filePath"),
//                     t.stringLiteral(relPath)
//                   ),
//                   t.objectProperty(
//                     t.identifier("line"),
//                     t.numericLiteral(eventHandler.loc?.start.line || 0)
//                   ),
//                 ])
//               ),
//             ]),
//           ])
//         ),
//         ...(t.isExpression(eventHandler.expression)
//           ? [
//               t.expressionStatement(
//                 t.callExpression(eventHandler.expression, [
//                   t.identifier("event"),
//                 ])
//               ),
//             ]
//           : []),
//       ])
//     );

//     attr.value = t.jsxExpressionContainer(wrappedHandler);
//   });
// };

// /**
//  *
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const propsTransform = (nodePath: any, relPath: string) => {
//   if (/node_modules/.test(relPath) || !isJSXElementType(nodePath, relPath)) {
//     return;
//   }
//   const functionName = nodePath.node.id?.name || "anonymous";
//   if (!Array.isArray(nodePath.node.body.body)) return;
//   const params = nodePath.node.params.flatMap((param: any) => {
//     if (t.isIdentifier(param)) {
//       return [
//         {
//           name: param.name,
//           value: t.identifier(param.name),
//         },
//       ];
//     }

//     if (t.isObjectPattern(param)) {
//       return param.properties
//         .map((prop: any) => {
//           if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
//             return {
//               name: prop.key.name,
//               value: t.isIdentifier(prop.value)
//                 ? t.identifier(prop.value.name)
//                 : t.identifier("undefined"),
//             };
//           }
//           return null;
//         })
//         .filter(Boolean);
//     }

//     return [
//       {
//         name: "unknown",
//         value: t.identifier("undefined"),
//       },
//     ];
//   });

//   console.log("functionName", functionName);
//   console.log("relpath", relPath);
//   console.log("params", params);

//   const effectCallback = t.arrowFunctionExpression(
//     [],
//     t.blockStatement([
//       t.expressionStatement(
//         t.callExpression(t.identifier("reportComponentProps"), [
//           t.objectExpression([
//             t.objectProperty(
//               t.identifier("componentName"),
//               t.stringLiteral(functionName)
//             ),
//             t.objectProperty(
//               t.identifier("props"),
//               t.objectExpression(
//                 params.map((p) =>
//                   t.objectProperty(t.identifier(p.name), p.value)
//                 )
//               )
//             ),
//             t.objectProperty(
//               t.identifier("filePath"),
//               t.stringLiteral(relPath)
//             ),
//           ]),
//         ])
//       ),
//     ])
//   );

//   const dependencies = t.arrayExpression(params.map((p) => p.value));

//   const useEffectCall = t.expressionStatement(
//     t.callExpression(t.identifier("useEffect"), [effectCallback, dependencies])
//   );

//   nodePath.get("body").unshiftContainer("body", useEffectCall);
// };

// /**
//  * 获取属性值
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const getAttributeValue = (nodePath: any, relPath: string) => {
//   const { node } = nodePath;
//   const { openingElement } = node;
//   let tagName = "";
//   if (t.isJSXIdentifier(openingElement.name)) {
//     tagName = openingElement.name.name;
//   } else if (t.isJSXMemberExpression(openingElement.name)) {
//     tagName = openingElement.name.property.name;
//   }
//   if (externalAntd.includes(tagName)) {
//     return;
//   }

//   const startLine = openingElement.loc?.start.line;
//   const endLine =
//     node.closingElement?.loc?.end.line ?? openingElement.loc?.end.line;

//   return [
//     { name: "data-ai-start-line", value: startLine },
//     { name: "data-ai-end-line", value: endLine },
//     { name: "data-ai-comp-name", value: tagName },
//     { name: "data-ai-file-path", value: relPath },
//   ];
// };

// /**
//  * 组件属性绑定
//  * @param has
//  * @param openingElement
//  * @param attrName
//  * @param attrValue
//  */
// const attributesBind = (
//   has: boolean,
//   openingElement: any,
//   attrName: string,
//   attrValue: any
// ) => {
//   if (!has) {
//     openingElement.attributes.push(
//       t.jsxAttribute(
//         t.jsxIdentifier(attrName),
//         t.stringLiteral(String(attrValue ?? ""))
//       )
//     );
//   }
// };

// /**
//  * 节点转换
//  * @param nodePath
//  * @param relPath
//  */
// const componentsNodeTransform = (nodePath: any, relPath: string) => {
//   const attributeConfigs = getAttributeValue(nodePath, relPath);
//   const openingElement = nodePath.get("openingElement").node;
//   if (!attributeConfigs) return;
//   attributeConfigs.forEach(({ name, value }) => {
//     const hasAttribute = openingElement.attributes.some(
//       (attr: any) => attr.type === "JSXAttribute" && attr.name.name === name
//     );
//     attributesBind(hasAttribute, openingElement, name, value);
//   });
// };

// /**
//  * 组件属性
//  * @param nodePath
//  * @param relPath
//  * @returns
//  */
// const componentsTransform = (nodePath: any, relPath: string) => {
//   componentsNodeTransform(nodePath, relPath);
//   componentEventTransform(nodePath, relPath);
// };

// /**
//  * 数据追踪加载器
//  * @param this
//  * @param source
//  * @returns
//  */
// export default function dataTrackLoader(
//   this: LoaderContext<{ root?: string }>,
//   source: string
// ) {
//   const options = this.getOptions();
//   const root = options?.root || process.cwd();
//   const relPath = path.relative(root, (this as any).resourcePath);
//   const ast = parse(source, {
//     sourceType: "module",
//     plugins: ["jsx", "typescript"],
//   });
//   traverse(ast, {
//     JSXElement(nodePath: any) {
//       componentsTransform(nodePath, relPath);
//     },
//     CallExpression(nodePath) {
//       userEffectNodeTransform(nodePath, relPath);
//       userStateNodeTransform(nodePath, relPath);
//     },
//     ClassDeclaration(nodePath: any) {
//       modelsTransform(nodePath, relPath);
//     },
//     AssignmentExpression(nodePath) {},
//     ArrowFunctionExpression(nodePath) {
//       propsTransform(nodePath, relPath);
//       // functionTransform(nodePath, relPath);
//     },
//     FunctionDeclaration(nodePath, state) {
//       propsTransform(nodePath, relPath);
//       functionTransform(nodePath, relPath);
//     },
//   });
//   const output = generate(ast, { sourceMaps: true, filename: relPath }, source);
//   return output.code;
// }












