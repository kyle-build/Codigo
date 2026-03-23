import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { useStoreComponents, useStorePage } from "@/shared/hooks";
import { Input, Typography } from "antd";
import {
  createIframeSandboxSrcdoc,
  createRuntimeEnvelope,
  createWorkerSandboxScript,
  isRuntimeEnvelope,
  parseSchemaFromCode,
  renderCode,
  SANDBOX_EVENT_LOGIC_RESULT,
  SANDBOX_EVENT_SCHEMA_UPDATE,
  type SandboxSchemaNode,
} from "@codigo/editor-sandbox";

const { Text } = Typography;

export const SandboxCanvas = observer(() => {
  const { store, getComponentById, replaceByCode } = useStoreComponents();
  const { store: pageStore } = useStorePage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [code, setCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [logicSummary, setLogicSummary] = useState("等待逻辑沙箱结果");

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

  const iframeSrcdoc = useMemo(() => createIframeSandboxSrcdoc(), []);

  const pushSchemaToRuntime = useCallback((schema: SandboxSchemaNode[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      createRuntimeEnvelope("iframe-ui", SANDBOX_EVENT_SCHEMA_UPDATE, schema),
      "*",
    );
    workerRef.current?.postMessage(
      createRuntimeEnvelope(
        "worker-logic",
        SANDBOX_EVENT_SCHEMA_UPDATE,
        schema,
      ),
    );
  }, []);

  useEffect(() => {
    const workerScript = createWorkerSandboxScript();
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!isRuntimeEnvelope(event.data)) return;
      if (event.data.event !== SANDBOX_EVENT_LOGIC_RESULT) return;
      const payload = event.data.payload as {
        componentCount?: number;
        types?: string[];
      };
      const count = payload.componentCount ?? 0;
      const types = payload.types?.join(", ") || "-";
      setLogicSummary(`逻辑沙箱：${count} 个组件，类型 ${types}`);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  useEffect(() => {
    setCode(generatedCode);
    setErrorText("");
    try {
      const parsed = parseSchemaFromCode(generatedCode);
      pushSchemaToRuntime(parsed);
    } catch (error) {
      setErrorText((error as Error).message);
    }
  }, [generatedCode, pushSchemaToRuntime]);

  useEffect(() => {
    if (!code || code === generatedCode) return;

    const timer = window.setTimeout(() => {
      try {
        const parsedValue = parseSchemaFromCode(code);
        replaceByCode(parsedValue);
        pushSchemaToRuntime(parsedValue);
        setErrorText("");
      } catch (error) {
        setErrorText((error as Error).message);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [code, generatedCode, pushSchemaToRuntime, replaceByCode]);

  return (
    <div className="w-full h-full bg-white grid grid-cols-2 gap-0">
      <div className="h-full border-r border-slate-200 flex flex-col">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
          <Text className="text-xs text-slate-600">Code JSON 编辑态</Text>
        </div>
        <Input.TextArea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoSize={false}
          className="font-mono text-xs flex-1 h-full rounded-none border-0"
        />
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
          {errorText ? (
            <Text type="danger" className="text-xs">
              {errorText}
            </Text>
          ) : (
            <Text className="text-xs text-emerald-600">
              语法合法，已自动同步
            </Text>
          )}
        </div>
      </div>
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <Text className="text-xs text-slate-600">iframe UI sandbox</Text>
          <Text className="text-xs text-slate-500">{logicSummary}</Text>
        </div>
        <iframe
          ref={iframeRef}
          title="codigo-ui-sandbox"
          srcDoc={iframeSrcdoc}
          sandbox="allow-scripts"
          className="w-full h-full border-0 bg-slate-50"
          onLoad={() => {
            try {
              const parsed = parseSchemaFromCode(code || generatedCode);
              pushSchemaToRuntime(parsed);
            } catch {
              return;
            }
          }}
        />
      </div>
    </div>
  );
});
