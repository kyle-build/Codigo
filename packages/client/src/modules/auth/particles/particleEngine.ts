import { Particle } from "./particle";
export class ParticleEngine {
  particles: Particle[] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private count = 40
  ) {
    this.init();
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push(new Particle(this.width, this.height));
    }
  }

  update() {
    this.particles.forEach((p) => {
      p.update(this.width, this.height);
    });
  }

  draw() {
    this.particles.forEach((p) => p.draw(this.ctx));
  }
}












