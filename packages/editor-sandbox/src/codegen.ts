import type { SandboxFramework } from "./types";

export function renderCode(framework: SandboxFramework, schemaText: string) {
  if (framework === "vue") {
    return `<script setup lang="ts">
import LowCodeRenderer from "./LowCodeRenderer.vue";
const pageSchema = ${schemaText};
</script>

<template>
  <div class="codigo-page" style="height: 100%; min-height: 100vh; position: relative;">
    <LowCodeRenderer
      v-for="component in pageSchema"
      :key="component.id"
      :component="component"
    />
  </div>
</template>
`;
  }

  return `import React from "react";
import { LowCodeRenderer } from "./LowCodeRenderer";

const pageSchema = ${schemaText};

export default function Page() {
  return (
    <div className="codigo-page" style={{ height: '100%', minHeight: '100vh', position: 'relative' }}>
      {pageSchema.map((component) => (
        <LowCodeRenderer key={component.id} component={component} />
      ))}
    </div>
  );
}
`;
}

export function createSandboxFiles(
  framework: SandboxFramework,
  generatedCode: string,
) {
  if (framework === "vue") {
    return {
      "/src/App.vue": generatedCode,
      "/src/LowCodeRenderer.vue": `
<script setup>
defineProps({ component: Object })
</script>
<template>
  <div :style="[component.styles, { border: '1px dashed #ccc', padding: '8px', margin: '4px', borderRadius: '4px', position: component.styles?.position || 'relative', left: component.styles?.left, top: component.styles?.top }]">
    <div style="font-size: 14px; margin-bottom: 4px; color: #10b981"><strong>{{ component.type }}</strong></div>
    <div style="font-size: 12px; color: #666; background: #f8fafc; padding: 4px; border-radius: 4px;">
      {{ JSON.stringify(component.props) }}
    </div>
  </div>
</template>
      `,
    };
  }

  return {
    "/App.js": generatedCode,
    "/LowCodeRenderer.js": `
export function LowCodeRenderer({ component }) {
  const { type, props, styles } = component;
  
  return (
    <div style={{ ...styles, border: '1px dashed #ccc', padding: '8px', margin: '4px', borderRadius: '4px', position: styles?.position || 'relative', left: styles?.left, top: styles?.top }}>
      <div style={{ fontSize: '14px', marginBottom: '4px', color: '#10b981' }}><strong>{type}</strong></div>
      <div style={{ fontSize: '12px', color: '#666', background: '#f8fafc', padding: '4px', borderRadius: '4px' }}>
        {JSON.stringify(props)}
      </div>
    </div>
  );
}
      `,
  };
}
