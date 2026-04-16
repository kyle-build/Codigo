import type { IPageSchema } from "@codigo/schema";
import schema from "./schema.json";
import { SchemaRenderer } from "./runtime/SchemaRenderer";

/**
 * 模板工作区入口：直接消费 workspace 中的 schema.json，确保 IDE 保存后可立即看到运行时结构。
 */
export default function App() {
  return <SchemaRenderer schema={schema as IPageSchema} />;
}
