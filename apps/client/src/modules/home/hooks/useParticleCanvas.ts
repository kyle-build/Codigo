import { useEffect } from "react";
import type { RefObject } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

const particleCount = 60;
const connectionDistance = 150;
const mouseDistance = 200;
const gridSize = 50;

/** 管理首页粒子背景的画布动画。 */
export function useParticleCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let particles: Particle[] = [];

    const createParticle = (): Particle => ({
      size: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    });

    const resetParticles = () => {
      particles = Array.from({ length: particleCount }, createParticle);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      resetParticles();
    };

    const drawGrid = () => {
      context.strokeStyle = "rgba(100, 116, 139, 0.05)";
      context.lineWidth = 1;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    };

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (distance < mouseDistance) {
          const force = (mouseDistance - distance) / mouseDistance;
          particle.x -= (dx / distance) * force * 0.5;
          particle.y -= (dy / distance) * force * 0.5;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = "rgba(16, 185, 129, 0.4)";
        context.fill();
      });

      for (let index = 0; index < particles.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const dx = particles[index].x - particles[nextIndex].x;
          const dy = particles[index].y - particles[nextIndex].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            context.beginPath();
            context.strokeStyle = `rgba(16, 185, 129, ${(1 - distance / connectionDistance) * 0.4})`;
            context.lineWidth = 1;
            context.moveTo(particles[index].x, particles[index].y);
            context.lineTo(particles[nextIndex].x, particles[nextIndex].y);
            context.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvasRef]);
}
