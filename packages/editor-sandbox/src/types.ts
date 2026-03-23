import type { TComponentTypes } from "@codigo/schema";

export type SandboxFramework = "react" | "vue";

export interface SandboxSchemaNode {
  id?: string;
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

export type SandboxTarget = "iframe-ui" | "worker-logic";

export interface SandboxRuntimeEnvelope<TPayload = unknown> {
  channel: "codigo:sandbox";
  target: SandboxTarget;
  event: string;
  payload: TPayload;
}
