import type { TComponentTypes } from "@codigo/schema";
import type { SandboxSchemaNode } from "./types";

const schemaKey = "const pageSchema =";

export const supportedComponentTypes: TComponentTypes[] = [
  "button",
  "video",
  "swiper",
  "qrcode",
  "card",
  "list",
  "statistic",
  "table",
  "image",
  "titleText",
  "split",
  "richText",
  "input",
  "textArea",
  "radio",
  "checkbox",
  "empty",
  "alert",
];

export function extractSchemaText(source: string) {
  const keyIndex = source.indexOf(schemaKey);
  if (keyIndex < 0) {
    throw new Error("未找到 pageSchema，请保留 const pageSchema = [...]");
  }

  const schemaStart = source.indexOf("[", keyIndex);
  if (schemaStart < 0) {
    throw new Error("未找到 pageSchema 数组起始位置");
  }

  let depth = 0;
  let schemaEnd = -1;

  for (let i = schemaStart; i < source.length; i++) {
    const char = source[i];
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        schemaEnd = i;
        break;
      }
    }
  }

  if (schemaEnd < 0) {
    throw new Error("pageSchema 数组未正常闭合");
  }

  return source.slice(schemaStart, schemaEnd + 1);
}

export function serializeSchema(schema: SandboxSchemaNode[], space = 2) {
  return JSON.stringify(schema, null, space);
}

export function validateSchemaNodes(schema: SandboxSchemaNode[]) {
  const invalidType = schema.find(
    (item) => !supportedComponentTypes.includes(item.type as TComponentTypes),
  );
  if (invalidType) {
    throw new Error(`不支持的组件类型: ${invalidType.type}`);
  }
}

export function parseSchemaFromCode(source: string) {
  const schemaSource = extractSchemaText(source);
  const parsedValue = JSON.parse(schemaSource) as SandboxSchemaNode[];

  if (!Array.isArray(parsedValue)) {
    throw new Error("pageSchema 必须是数组");
  }

  validateSchemaNodes(parsedValue);
  return parsedValue;
}
