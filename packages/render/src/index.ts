export * from "@codigo/runtime-core";

export function renderCode(schemaText: string) {
  return `import React, { useEffect, useMemo, useState } from "react";
import { LowCodeRenderer } from "./LowCodeRenderer";

const pageSchema = ${schemaText};

export default function Page() {
  const initialPageState = useMemo(() => {
    const nextState = {};
    const getClickActions = (node) => {
      const configuredActions = Array.isArray(node.events?.onClick)
        ? node.events.onClick
        : [];
      const props = node.props ?? {};
      const legacyActions = [];

      if (
        props.actionType === "set-state" &&
        typeof props.stateKey === "string" &&
        props.stateKey &&
        props.stateValue !== undefined
      ) {
        legacyActions.push({
          type: "setState",
          key: props.stateKey,
          value: props.stateValue,
        });
      }

      return [...configuredActions, ...legacyActions];
    };

    const visitNodes = (nodes) => {
      nodes.forEach((node) => {
        getClickActions(node).forEach((action) => {
          if (
            action.type === "setState" &&
            action.key &&
            nextState[action.key] === undefined
          ) {
            nextState[action.key] = action.value;
          }
        });

        if (node.children?.length) {
          visitNodes(node.children);
        }
      });
    };

    visitNodes(pageSchema);
    return nextState;
  }, []);
  const [pageState, setPageState] = useState(initialPageState);

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  return (
    <div className="codigo-page">
      {pageSchema.map((component) => (
        <LowCodeRenderer
          key={component.id}
          component={component}
          runtime={{
            pageState,
            onAction: async (action) => {
              if (action.type === "set-state" || action.type === "setState") {
                setPageState((prev) => ({
                  ...prev,
                  [action.key]: action.value,
                }));
                return;
              }

              if (action.type === "navigate") {
                window.location.assign(action.path);
                return;
              }

              if (action.type === "openUrl") {
                window.open(
                  action.url,
                  action.target ?? "_blank",
                  "noopener,noreferrer",
                );
                return;
              }

              if (action.type === "toast") {
                window.alert(action.message);
                return;
              }

              if (action.type === "confirm") {
                const ok = window.confirm(action.message);
                if (!ok) return;
              }

              if (action.type === "when") {
                const op = action.op ?? "truthy";
                const stateValue = (pageState ?? {})[action.key];
                const passed =
                  op === "eq"
                    ? stateValue === action.value
                    : op === "ne"
                      ? stateValue !== action.value
                      : op === "falsy"
                        ? !stateValue
                        : !!stateValue;
                if (!passed) return;
              }

              if (action.type === "request") {
                const method = (action.method ?? "GET").toUpperCase();
                const headers = { ...(action.headers ?? {}) };
                const hasContentType = Object.keys(headers).some(
                  (key) => key.toLowerCase() === "content-type",
                );
                let body;
                if (
                  method !== "GET" &&
                  method !== "HEAD" &&
                  action.body !== undefined
                ) {
                  if (typeof action.body === "string") {
                    try {
                      const parsed = JSON.parse(action.body);
                      body = JSON.stringify(parsed);
                      if (!hasContentType) {
                        headers["Content-Type"] = "application/json";
                      }
                    } catch {
                      body = action.body;
                      if (!hasContentType) {
                        headers["Content-Type"] = "text/plain;charset=UTF-8";
                      }
                    }
                  } else {
                    body = JSON.stringify(action.body);
                    if (!hasContentType) {
                      headers["Content-Type"] = "application/json";
                    }
                  }
                }

                const resp = await fetch(action.url, {
                  method,
                  headers,
                  body,
                  credentials: "include",
                });
                const contentType = resp.headers.get("content-type") ?? "";
                const data = contentType.includes("application/json")
                  ? await resp.json()
                  : await resp.text();
                if (resp.ok && action.saveToStateKey) {
                  setPageState((prev) => ({
                    ...prev,
                    [action.saveToStateKey]: data,
                  }));
                }
                return;
              }

              const targetElement = document.getElementById(action.targetId);
              targetElement?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            },
          }}
        />
      ))}
    </div>
  );
}
`;
}
