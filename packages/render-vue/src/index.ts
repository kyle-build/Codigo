export * from "@codigo/runtime-core";

export function renderCode(schemaText: string) {
  return `<script setup lang="ts">
const pageSchema = ${schemaText};
</script>

<template>
  <div class="codigo-page">
    <LowCodeRenderer
      v-for="component in pageSchema"
      :key="component.id"
      :component="component"
    />
  </div>
</template>
`;
}
