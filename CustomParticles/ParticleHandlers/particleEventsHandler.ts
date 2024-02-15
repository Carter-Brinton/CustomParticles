import { BubbleParticles } from "../ParticlePresets/BubbleParticles/bubbleParticles";
import { ParticleColorService } from "../ParticleServices/particleColorService";
import { Particle } from "../particle";
import { IParticleConfiguration, IParticleEmitter } from "../particleInterfaces";
import { ParticleSystem } from "../particleSystem";

export class ParticleEventsHandler {
  private particles: Particle[];
  private particleSystem: ParticleSystem;
  private particleEmitter: IParticleEmitter | undefined;
  private canvas: HTMLCanvasElement | null = null;
  

  constructor(particles: Particle[], particleEmitter: IParticleEmitter, particleSystem: ParticleSystem, canvasId: string) {
    this.particles = particles;
    this.particleEmitter = particleEmitter;
    this.particleSystem = particleSystem;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  }

  destroy(): void {
    this.particles = [];
    this.canvas = null;
  }

  applyRepulsion(event: MouseEvent): void {
    if (!this.canvas) return;
    if (this.particleEmitter?.allowInteraction === false) return;

    const isRepulsionEnabled =
      this.particleSystem.particleConfiguration.interactivity?.eventTypes?.repulse ||
      this.particleSystem.particleEmittersHandler.particleEmitters.some(emitter => emitter.allowInteraction);
    if (!isRepulsionEnabled) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);

    // Apply repulsion for each particle
    this.particles.forEach(particle => {
      const dx = particle.x - x;
      const dy = particle.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.particleSystem.particleConfiguration.interactivity!.eventTypes!.repulse!.distance * 1.5) {
        const angle = Math.atan2(dy, dx);

        // Calculate the repulsion speed components
        const repulseSpeed = this.particleSystem.particleConfiguration.interactivity!.eventTypes!.repulse!.speed;
        const repulseSpeedX = Math.cos(angle) * repulseSpeed;
        const repulseSpeedY = Math.sin(angle) * repulseSpeed;

        // Store the original speed values
        const originalSpeedX = particle.speedX;
        const originalSpeedY = particle.speedY;

        // Apply the repulsion force
        particle.speedX = repulseSpeedX;
        particle.speedY = repulseSpeedY;

        setTimeout(() => {
          // Reset the particle's speed back to its original values
          particle.speedX = originalSpeedX;
          particle.speedY = originalSpeedY;
        }, this.particleSystem.particleConfiguration.interactivity!.eventTypes!.repulse!.duration * 1000);
      }
    });
  }

  popBubble(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
    let bubbleParticles = new BubbleParticles(this.particles, this.particleEmitter, this.particleSystem, this.canvas);
    bubbleParticles.popBubble(event, ctx);
  }
}