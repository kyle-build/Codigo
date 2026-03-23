import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Segmented, Typography } from "antd";
import { toJS } from "mobx";
import { useStoreComponents, useStorePage } from "@/shared/hooks";
import {
  parseSchemaFromCode,
  renderCode,
  type SandboxFramework,
} from "@codigo/editor-sandbox";

const { Text } = Typography;

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
    const parsedValue = parseSchemaFromCode(source);
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
      <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100 mb-2">
        已进入源码沙箱模式，请在左侧主区域直接编辑并运行代码。
      </div>
      <Segmented
        block
        value={pageStore.codeFramework}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
        ]}
        onChange={(value) => setCodeFramework(value as SandboxFramework)}
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
