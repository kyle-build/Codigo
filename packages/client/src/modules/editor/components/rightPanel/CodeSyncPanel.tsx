import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Segmented, Typography } from "antd";
import { toJS } from "mobx";
import { useStoreComponents, useStorePage } from "@/shared/hooks";
import type { TComponentTypes } from "@codigo/schema";

type CodeFramework = "react" | "vue";

const { Text } = Typography;
const supportedTypes: TComponentTypes[] = [
  "video",
  "swiper",
  "qrcode",
  "card",
  "list",
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

function extractSchemaText(source: string) {
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

function renderCode(framework: CodeFramework, schemaText: string) {
  if (framework === "vue") {
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

  return `import React from "react";

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

export default observer(function CodeSyncPanel() {
  const { store, getComponentById, replaceByCode } = useStoreComponents();
  const { store: pageStore, setCodeFramework } = useStorePage();
  const [code, setCode] = useState("");
  const [errorText, setErrorText] = useState("");

  const schemaText = useMemo(() => {
    const serializableComponents = store.sortableCompConfig
      .map((id) => getComponentById(id))
      .filter(Boolean)
      .map((item) => {
        return {
          id: item.id,
          type: item.type,
          props: toJS(item.props || {}),
          styles: toJS(
            (item as { styles?: Record<string, unknown> }).styles || {},
          ),
        };
      });

    return JSON.stringify(serializableComponents, null, 2);
  }, [getComponentById, store.sortableCompConfig, store.compConfigs]);

  const generatedCode = useMemo(() => {
    return renderCode(pageStore.codeFramework, schemaText);
  }, [pageStore.codeFramework, schemaText]);

  useEffect(() => {
    setCode(generatedCode);
    setErrorText("");
  }, [generatedCode]);

  function handleApplyToCanvas(nextCode?: string) {
    const source = nextCode ?? code;
    const schemaSource = extractSchemaText(source);
    const parsedValue = JSON.parse(schemaSource) as Array<{
      id?: string;
      type: string;
      props?: Record<string, unknown>;
      styles?: Record<string, unknown>;
    }>;

    if (!Array.isArray(parsedValue)) {
      throw new Error("pageSchema 必须是数组");
    }

    const invalidType = parsedValue.find(
      (item) => !supportedTypes.includes(item.type as TComponentTypes),
    );
    if (invalidType) {
      throw new Error(`不支持的组件类型: ${invalidType.type}`);
    }

    replaceByCode(parsedValue);
  }

  useEffect(() => {
    if (code === generatedCode) return;

    const timer = window.setTimeout(() => {
      try {
        handleApplyToCanvas(code);
        setErrorText("");
      } catch (error) {
        setErrorText((error as Error).message);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [code, generatedCode]);

  return (
    <div className="space-y-3">
      <Segmented
        block
        value={pageStore.codeFramework}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
        ]}
        onChange={(value) => setCodeFramework(value as CodeFramework)}
      />
      <Input.TextArea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoSize={{ minRows: 20, maxRows: 26 }}
        className="font-mono text-xs"
      />
      {errorText ? <Text type="danger">{errorText}</Text> : null}
      <Button
        type="primary"
        block
        onClick={() => {
          try {
            handleApplyToCanvas();
            setErrorText("");
          } catch (error) {
            setErrorText((error as Error).message);
          }
        }}
      >
        立即同步到画布
      </Button>
    </div>
  );
});












