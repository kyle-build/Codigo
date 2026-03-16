import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function useEChart(option: any) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current);
    }

    chartRef.current.setOption(option);

    const resize = () => chartRef.current?.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [option]);

  return ref;
}
