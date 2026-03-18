import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function useEChart(option: any) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current, undefined, {
        renderer: "canvas",
      });
    }

    chartRef.current.setOption(option, true);
    chartRef.current.resize();

    const resize = () => chartRef.current?.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [option]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return ref;
}
