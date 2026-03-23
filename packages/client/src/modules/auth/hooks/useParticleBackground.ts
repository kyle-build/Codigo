import { useEffect } from "react";
import type { RefObject } from "react";
import { ParticleEngine } from "../particles/particleEngine";

export function useParticleBackground(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new ParticleEngine(ctx, canvas.width, canvas.height);

    let frame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      engine.update();
      engine.draw();
      frame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frame);
  }, []);
}












