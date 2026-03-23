import { useRef } from "react";
import { useParticleBackground } from "../../hooks/useParticleBackground";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useParticleBackground(canvasRef as React.RefObject<HTMLCanvasElement>);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
  );
}












