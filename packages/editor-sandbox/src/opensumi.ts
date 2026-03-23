export interface OpenSumiEditorBridgeHandle {
  dispose: () => void;
  setValue: (value: string) => void;
}

export interface OpenSumiEditorBridge {
  mount: (options: {
    container: HTMLElement;
    value: string;
    language: string;
    readOnly?: boolean;
    onChange: (value: string) => void;
  }) => OpenSumiEditorBridgeHandle;
}

declare global {
  var __CODIGO_OPENSUMI_BRIDGE__: OpenSumiEditorBridge | undefined;
}

export function resolveOpenSumiBridge() {
  return globalThis.__CODIGO_OPENSUMI_BRIDGE__;
}
