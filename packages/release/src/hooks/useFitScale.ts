import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFitScaleOptions {
  contentWidth: number;
  contentHeight: number;
  padding?: number;
  minScale?: number;
  maxScale?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useFitScale({
  contentWidth,
  contentHeight,
  padding = 0,
  minScale = 0.1,
  maxScale = 3,
}: UseFitScaleOptions) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((el: HTMLDivElement | null) => {
    setContainerEl(el);
  }, []);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerEl) {
      return;
    }

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const rect = entry.contentRect;
      setContainerSize({ width: rect.width, height: rect.height });
    });

    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  return useMemo(() => {
    const safeWidth = Number.isFinite(contentWidth) ? contentWidth : 0;
    const safeHeight = Number.isFinite(contentHeight) ? contentHeight : 0;
    const targetWidth = Math.max(1, safeWidth);
    const targetHeight = Math.max(1, safeHeight);

    const availableWidth = Math.max(0, containerSize.width - padding * 2);
    const availableHeight = Math.max(0, containerSize.height - padding * 2);

    const rawScale =
      availableWidth > 0 && availableHeight > 0
        ? Math.min(availableWidth / targetWidth, availableHeight / targetHeight)
        : 1;

    const scale = clamp(rawScale, minScale, maxScale);

    return {
      containerRef,
      scale,
      scaledWidth: targetWidth * scale,
      scaledHeight: targetHeight * scale,
    };
  }, [
    containerSize.height,
    containerSize.width,
    contentHeight,
    contentWidth,
    maxScale,
    minScale,
    padding,
  ]);
}

