import type { SyncSchemaItem } from "@codigo/schema";

export function extractSchemaText(source: string) {
  const schemaKey = "const pageSchema =";
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

export function parseSchemaFromCode(source: string): SyncSchemaItem[] {
  const schemaSource = extractSchemaText(source);
  const parsedValue = JSON.parse(schemaSource) as SyncSchemaItem[];
  if (!Array.isArray(parsedValue)) {
    throw new Error("pageSchema 必须是数组");
  }
  return parsedValue;
}