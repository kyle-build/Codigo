export * from "@codigo/runtime-core";

export function renderCode(schemaText: string) {
  return `import React from "react";
import { LowCodeRenderer } from "./LowCodeRenderer";

const pageSchema = ${schemaText};

export default function Page() {
  return (
    <div className="codigo-page">
      {pageSchema.map((component) => (
        <LowCodeRenderer key={component.id} component={component} />
      ))}
    </div>
  );
}
`;
}
