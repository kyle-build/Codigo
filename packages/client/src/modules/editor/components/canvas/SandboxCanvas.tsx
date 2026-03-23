import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import {
  useStoreComponents,
  useStorePage,
  useStorePermission,
} from "@/shared/hooks";
import { Typography } from "antd";
import * as esbuild from "esbuild-wasm";
import esbuildWasmUrl from "esbuild-wasm/esbuild.wasm?url";
import {
  createBundleEntrySource,
  createIframeSandboxSrcdoc,
  createRuntimeEnvelope,
  createWorkerSandboxScript,
  enforceImportWhitelist,
  isRuntimeEnvelope,
  parseSchemaFromCode,
  renderCode,
  SANDBOX_EVENT_BUNDLE_UPDATE,
  SANDBOX_EVENT_LOGIC_RESULT,
  SANDBOX_EVENT_RUNTIME_ERROR,
  SANDBOX_EVENT_SCHEMA_UPDATE,
  SANDBOX_EVENT_UI_READY,
  type SandboxSchemaNode,
} from "@codigo/editor-sandbox";
import OpenSumiEditor from "./OpenSumiEditor";

let esbuildInitPromise: Promise<void> | null = null;

function ensureEsbuildInitialized() {
  if (!esbuildInitPromise) {
    esbuildInitPromise = esbuild.initialize({
      wasmURL: esbuildWasmUrl,
      worker: true,
    });
  }
  return esbuildInitPromise;
}

async function bundleSchema(
  schema: SandboxSchemaNode[],
  dependencyWhitelist: string[],
) {
  await ensureEsbuildInitialized();
  const source = createBundleEntrySource(schema);
  enforceImportWhitelist(source, dependencyWhitelist);
  const result = await esbuild.build({
    stdin: {
      contents: source,
      sourcefile: "entry.ts",
      loader: "ts",
      resolveDir: "/",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    logLevel: "silent",
  });
  return result.outputFiles?.[0]?.text || "";
}

const { Text } = Typography;

export const SandboxCanvas = observer(() => {
  const { store, getComponentById, replaceByCode } = useStoreComponents();
  const { store: pageStore } = useStorePage();
  const { can, ensurePermission, addOperationLog } = useStorePermission();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const latestSchemaRef = useRef<SandboxSchemaNode[]>([]);
  const bundleVersionRef = useRef(0);
  const lastBundleAuditRef = useRef("");
  const canEditStructure = can("edit_structure");
  const [code, setCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [logicSummary, setLogicSummary] = useState("等待逻辑沙箱结果");
  const [bundleSummary, setBundleSummary] = useState("等待 esbuild 编译");
  const sandboxDependencyWhitelist = useMemo<string[]>(() => [], []);

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

  const pushSchemaToRuntime = useCallback(
    async (schema: SandboxSchemaNode[]) => {
      latestSchemaRef.current = schema;
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
      const currentVersion = ++bundleVersionRef.current;
      try {
        const bundle = await bundleSchema(schema, sandboxDependencyWhitelist);
        if (currentVersion !== bundleVersionRef.current) return;
        iframeRef.current?.contentWindow?.postMessage(
          createRuntimeEnvelope("iframe-ui", SANDBOX_EVENT_BUNDLE_UPDATE, bundle),
          "*",
        );
        setBundleSummary(`esbuild bundle 已更新 v${currentVersion}`);
        const auditKey = `${schema.length}:${schema.map((item) => item.type).join(",")}`;
        if (auditKey !== lastBundleAuditRef.current) {
          lastBundleAuditRef.current = auditKey;
          addOperationLog("sandbox_bundle", `v${currentVersion}`);
        }
      } catch (error) {
        const message = (error as Error).message;
        setBundleSummary("esbuild 编译失败");
        setErrorText(message);
        addOperationLog("sandbox_runtime_error", message);
        throw error;
      }
    },
    [addOperationLog, sandboxDependencyWhitelist],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      if (!isRuntimeEnvelope(event.data)) return;
      if (event.data.event === SANDBOX_EVENT_UI_READY) {
        void pushSchemaToRuntime(latestSchemaRef.current);
        return;
      }
      if (event.data.event === SANDBOX_EVENT_RUNTIME_ERROR) {
        const payload = event.data.payload as { message?: string };
        const message = payload?.message || "iframe 运行异常";
        setErrorText(message);
        addOperationLog("sandbox_runtime_error", message);
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [addOperationLog, pushSchemaToRuntime]);

  useEffect(() => {
    const workerScript = createWorkerSandboxScript();
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!isRuntimeEnvelope(event.data)) return;
      if (event.data.event === SANDBOX_EVENT_LOGIC_RESULT) {
        const payload = event.data.payload as {
          componentCount?: number;
          types?: string[];
        };
        const count = payload.componentCount ?? 0;
        const types = payload.types?.join(", ") || "-";
        setLogicSummary(`逻辑沙箱：${count} 个组件，类型 ${types}`);
        return;
      }
      if (event.data.event === SANDBOX_EVENT_RUNTIME_ERROR) {
        const payload = event.data.payload as { message?: string };
        const message = payload?.message || "Worker 运行异常";
        setErrorText(message);
        addOperationLog("sandbox_runtime_error", message);
      }
    };
    worker.onerror = (event) => {
      const message = event.message || "Worker 运行异常";
      setErrorText(message);
      addOperationLog("sandbox_runtime_error", message);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      URL.revokeObjectURL(workerUrl);
    };
  }, [addOperationLog]);

  useEffect(() => {
    setCode(generatedCode);
    setErrorText("");
    void (async () => {
      try {
        const parsed = parseSchemaFromCode(generatedCode);
        await pushSchemaToRuntime(parsed);
      } catch (error) {
        setErrorText((error as Error).message);
      }
    })();
  }, [generatedCode, pushSchemaToRuntime]);

  useEffect(() => {
    if (!code || code === generatedCode) return;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          if (
            !ensurePermission("edit_structure", "当前角色不能通过源码修改组件")
          ) {
            setErrorText("当前角色不能通过源码修改组件");
            return;
          }
          const parsedValue = parseSchemaFromCode(code);
          replaceByCode(parsedValue);
          await pushSchemaToRuntime(parsedValue);
          setErrorText("");
          addOperationLog("sandbox_sync", `共 ${parsedValue.length} 个组件`);
        } catch (error) {
          setErrorText((error as Error).message);
        }
      })();
    }, 600);

    return () => clearTimeout(timer);
  }, [
    addOperationLog,
    code,
    ensurePermission,
    generatedCode,
    pushSchemaToRuntime,
    replaceByCode,
  ]);

  return (
    <div className="w-full h-full bg-white grid grid-cols-2 gap-0">
      <div className="h-full border-r border-slate-200 flex flex-col">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
          <Text className="text-xs text-slate-600">OpenSumi 编辑适配层（Code JSON）</Text>
        </div>
        <OpenSumiEditor
          value={code}
          onChange={setCode}
          language="typescript"
          readOnly={!canEditStructure}
        />
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
          {errorText ? (
            <Text type="danger" className="text-xs">
              {errorText}
            </Text>
          ) : !canEditStructure ? (
            <Text className="text-xs text-amber-600">
              当前角色只读，无法通过源码修改组件
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
          <Text className="text-xs text-slate-500">{bundleSummary}</Text>
        </div>
        <iframe
          ref={iframeRef}
          title="codigo-ui-sandbox"
          srcDoc={iframeSrcdoc}
          sandbox="allow-scripts"
          className="w-full h-full border-0 bg-slate-50"
          onLoad={() => {
            const source = code || generatedCode;
            void (async () => {
              try {
                const parsed = parseSchemaFromCode(source);
                await pushSchemaToRuntime(parsed);
              } catch {
                return;
              }
            })();
          }}
        />
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
          <Text className="text-xs text-slate-500">{logicSummary}</Text>
        </div>
      </div>
    </div>
  );
});
