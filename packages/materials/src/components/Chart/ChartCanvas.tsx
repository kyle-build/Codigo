import React, { useCallback, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
interface ChartCanvasProps {
  option: Record<string, unknown>;
  theme?: string;
  hasRuntimeHeight: boolean;
}

interface ChartInstanceLike {
  resize: () => void;
}

/**
 * 统一承接图表物料的渲染与尺寸监听，避免编辑器拖拽缩放后 ECharts 仍按旧尺寸绘制。
 */
export default function ChartCanvas({
  option,
  theme,
  hasRuntimeHeight,
}: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstanceLike | null>(null);
  const resizeFrameRef = useRef<number | null>(null);

  /**
   * 将连续的尺寸变更合并到下一帧，避免拖拽过程中频繁触发图表重排。
   */
  const scheduleResize = useCallback(() => {
    if (resizeFrameRef.current !== null) {
      return;
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      chartRef.current?.resize();
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    scheduleResize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      scheduleResize();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [scheduleResize]);

  useEffect(() => {
    scheduleResize();
  }, [option, scheduleResize]);

  useEffect(() => {
    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: hasRuntimeHeight ? "100%" : "300px",
        minHeight: hasRuntimeHeight ? undefined : "300px",
        backgroundColor: "#fff",
      }}
    >
      <ReactECharts
        option={option}
        theme={theme}
        style={{ height: "100%", width: "100%" }}
        onChartReady={(chart) => {
          chartRef.current = chart;
          scheduleResize();
        }}
      />
    </div>
  );
}
