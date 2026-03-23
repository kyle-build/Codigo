import type { SandboxRuntimeEnvelope, SandboxTarget } from "./types";

export const SANDBOX_CHANNEL = "codigo:sandbox";
export const SANDBOX_EVENT_SCHEMA_UPDATE = "schema:update";
export const SANDBOX_EVENT_LOGIC_RESULT = "logic:result";
export const SANDBOX_EVENT_UI_READY = "ui:ready";

export function createRuntimeEnvelope<TPayload>(
  target: SandboxTarget,
  event: string,
  payload: TPayload,
): SandboxRuntimeEnvelope<TPayload> {
  return {
    channel: SANDBOX_CHANNEL,
    target,
    event,
    payload,
  };
}

export function isRuntimeEnvelope(
  value: unknown,
): value is SandboxRuntimeEnvelope {
  if (!value || typeof value !== "object") return false;
  const parsed = value as Partial<SandboxRuntimeEnvelope>;
  return (
    parsed.channel === SANDBOX_CHANNEL &&
    typeof parsed.target === "string" &&
    typeof parsed.event === "string"
  );
}

export function createIframeSandboxSrcdoc() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; }
      #root { padding: 12px; display: grid; gap: 8px; }
      .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
      .type { color: #10b981; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
      .props { color: #64748b; font-size: 11px; white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const channel = "${SANDBOX_CHANNEL}";
      const uiReady = "${SANDBOX_EVENT_UI_READY}";
      const schemaUpdate = "${SANDBOX_EVENT_SCHEMA_UPDATE}";

      const root = document.getElementById("root");

      function renderSchema(schema) {
        root.innerHTML = "";
        if (!Array.isArray(schema) || schema.length === 0) {
          const empty = document.createElement("div");
          empty.className = "card";
          empty.textContent = "暂无组件";
          root.appendChild(empty);
          return;
        }
        for (const node of schema) {
          const card = document.createElement("div");
          card.className = "card";
          if (node && node.styles && typeof node.styles === "object") {
            Object.assign(card.style, node.styles);
          }
          const type = document.createElement("div");
          type.className = "type";
          type.textContent = String(node && node.type ? node.type : "unknown");
          const props = document.createElement("div");
          props.className = "props";
          props.textContent = JSON.stringify((node && node.props) || {}, null, 2);
          card.appendChild(type);
          card.appendChild(props);
          root.appendChild(card);
        }
      }

      window.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || data.channel !== channel || data.target !== "iframe-ui") return;
        if (data.event === schemaUpdate) {
          renderSchema(data.payload);
        }
      });

      parent.postMessage(
        { channel, target: "iframe-ui", event: uiReady, payload: null },
        "*"
      );
    </script>
  </body>
</html>`;
}

export function createWorkerSandboxScript() {
  return `
const channel = "${SANDBOX_CHANNEL}";
const schemaUpdate = "${SANDBOX_EVENT_SCHEMA_UPDATE}";
const logicResult = "${SANDBOX_EVENT_LOGIC_RESULT}";

self.onmessage = (event) => {
  const data = event.data;
  if (!data || data.channel !== channel || data.target !== "worker-logic") return;
  if (data.event !== schemaUpdate) return;

  const schema = data.payload;
  const list = Array.isArray(schema) ? schema : [];
  const result = {
    componentCount: list.length,
    types: [...new Set(list.map((item) => item && item.type).filter(Boolean))],
    timestamp: Date.now()
  };

  self.postMessage({
    channel,
    target: "worker-logic",
    event: logicResult,
    payload: result
  });
};
`;
}
