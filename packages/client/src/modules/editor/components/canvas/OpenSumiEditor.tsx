import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "antd";
import {
  resolveOpenSumiBridge,
  type OpenSumiEditorBridgeHandle,
} from "@codigo/editor-sandbox";

interface Props {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function OpenSumiEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
}: Props) {
  const bridge = useMemo(() => resolveOpenSumiBridge(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OpenSumiEditorBridgeHandle | null>(null);
  const [useFallback, setUseFallback] = useState(!bridge);

  useEffect(() => {
    if (!bridge || !containerRef.current) return;
    const handle = bridge.mount({
      container: containerRef.current,
      value,
      language,
      readOnly,
      onChange,
    });
    handleRef.current = handle;
    setUseFallback(false);

    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [bridge, language, onChange, readOnly]);

  useEffect(() => {
    if (!bridge || !handleRef.current) return;
    handleRef.current.setValue(value);
  }, [bridge, value]);

  if (useFallback) {
    return (
      <Input.TextArea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        autoSize={false}
        className="font-mono text-xs flex-1 h-full rounded-none border-0"
      />
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
