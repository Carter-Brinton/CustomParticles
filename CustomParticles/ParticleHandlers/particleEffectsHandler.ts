import { Particle } from "../particle";
import { IParticleConfiguration, IEffectTypeConfig, IMouse, IParticleEmitter } from "../particleInterfaces";
import { EffectType, ParticleCustoms, RotationDirection } from "../particleEnums";
import { ParticleColorService } from "../ParticleServices/particleColorService";
import { ParticleSystem } from "../particleSystem";

export class ParticleEffectsHandler {
  private particles: Particle[];
  private ctx: CanvasRenderingContext2D | null = null;
  private particleSystem: ParticleSystem;
  private particleEmitter: IParticleEmitter | undefined;
  private mouse: IMouse | null = null;
  private particleColorService: ParticleColorService = new ParticleColorService;
  private linkColors: Map<string, string> = new Map(); // Store link colors by particle pair for multi color links

  constructor(particles: Particle[], particleEmitter: IParticleEmitter, particleSystem: ParticleSystem, ctx: CanvasRenderingContext2D,) {
    this.particles = particles;
    this.particleEmitter = particleEmitter;
    this.ctx = ctx;
    this.particleSystem = particleSystem;
    this.mouse = { x: 0, y: 0, isDown: false };
  }

  private getLinkColor(particleA: Particle, particleB: Particle, linkColor: string | string[]): string {
    // Generate a unique key for the particle pair
    const key = `${particleA.ID}-${particleB.ID}`;

    // Check if a color is already assigned for this pair
    if (this.linkColors.has(key)) {
      return this.linkColors.get(key)!;
    }

    // If no color is assigned, generate a random color and store it
    const randomColor = Array.isArray(linkColor)
      ? linkColor[Math.floor(Math.random() * linkColor.length)]
      : linkColor;

    this.linkColors.set(key, randomColor);
    return randomColor;
  }

  applyEffects(): void {
    // Iterate through each emitter and its associated particles
    this.particleSystem.particleEmittersHandler.particlesByEmitter.forEach((particles, emitter) => {
      const effects = emitter.particles.effects;
      if (effects) {
        effects.forEach(effect => {
          switch (effect.type) {
            case EffectType.LINKS:
              this.drawLinks(effect.config, particles);
              break;
            case EffectType.TRAILS:
              this.drawTrails(effect.config, particles);
              break;
            // Add more effect cases here as needed
          }
        });
      }
    });
  }

  applyRotation(): void {
    this.particleSystem.particleEmittersHandler.particlesByEmitter.forEach((particles, emitter) => {
      const customParticles = emitter.particles.particleType?.config.custom;
      if (customParticles) {
        if (customParticles.value === ParticleCustoms.BUBBLE) {
          this.rotateBubble(particles, emitter);
        }
      }
    });
  }

  rotateBubble(particles: Particle[], emitter: IParticleEmitter): void {
    const rotationConfig = emitter.particles.rotation;
    const timeToChangeDirection = 1000; // Time in milliseconds to change direction for RANDOM

    if (rotationConfig && rotationConfig.animation) {
      const { minAngle, maxAngle, animation } = rotationConfig;

      particles.forEach(particle => {
        const currentTime = Date.now();

        // Initialize particle's rotation properties if not already set
        if (particle.currentRotationAngle === undefined) {
          particle.currentRotationAngle = minAngle;
        }
        if (particle.currentRotationDirection === undefined) {
          particle.currentRotationDirection = animation.direction;
        }
        if (particle.rotationChangeThreshold === undefined) {
          particle.rotationChangeThreshold = currentTime;
        }

        // Calculate a random speed within the min and max range
        const rotationSpeed = animation.speed.min + Math.random() * (animation.speed.max - animation.speed.min);

        // Check if it's time to change direction for RANDOM
        if (particle.currentRotationDirection === RotationDirection.RANDOM && currentTime - particle.rotationChangeThreshold > timeToChangeDirection) {
          particle.currentRotationDirection = (Math.random() < 0.5) ? RotationDirection.CLOCKWISE : RotationDirection.COUNTERCLOCKWISE;
          particle.rotationChangeThreshold = currentTime;
        }

        // Apply the rotation speed based on the current direction
        if (particle.currentRotationDirection === RotationDirection.CLOCKWISE) {
          particle.currentRotationAngle += rotationSpeed;
          if (particle.currentRotationAngle > maxAngle) {
            particle.currentRotationAngle = maxAngle;
            particle.currentRotationDirection = RotationDirection.COUNTERCLOCKWISE;
          }
        } else if (particle.currentRotationDirection === RotationDirection.COUNTERCLOCKWISE) {
          particle.currentRotationAngle -= rotationSpeed;
          if (particle.currentRotationAngle < minAngle) {
            particle.currentRotationAngle = minAngle;
            particle.currentRotationDirection = RotationDirection.CLOCKWISE;
          }
        }

        // Normalize the rotation angle within the 0-360 range
        particle.currentRotationAngle = particle.currentRotationAngle % 360;
      });
    }
  }


  destroy(): void {
    // this.particles = [];
    this.ctx = null;
    this.mouse = null;
  }

  private drawLinks(config: IEffectTypeConfig[EffectType.LINKS], particles: Particle[]): void {
    const theme = this.particleSystem.particleConfiguration.colorThemes?.find(t => t.themeSelected);
    const themeLinkConfig = theme?.particles.effects?.config.links;
    const defaultLinkConfig = Array.isArray(this.particleSystem.particleConfiguration.particles!.effects)
      ? this.particleSystem.particleConfiguration.particles!.effects.find(effect => effect.type === EffectType.LINKS)?.config.links
      : undefined;
    const linkColor = themeLinkConfig?.color || defaultLinkConfig?.color;

    for (let i = 0; i < particles.length - 1; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared < config!.links?.distance! * config!.links?.distance!) {
          let opacity = config!.links?.solid ? 1 : (config!.links?.opacity ? config!.links?.opacity : 0) * (1 - Math.sqrt(distSquared) / config!.links?.distance!);
          let lineWidth = config!.links?.width!;

          // Get the link color for this pair of particles
          const linkColorForPair = this.getLinkColor(particles[i], particles[j], (linkColor || "white"));

          const rgba = this.particleColorService.colorToRGBA(linkColorForPair || "white");
          this.ctx!.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${opacity})`;
          this.ctx!.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${opacity})`;
          this.ctx!.lineWidth = lineWidth;

          this.ctx!.beginPath();
          this.ctx!.moveTo(particles[i].x, particles[i].y);
          this.ctx!.lineTo(particles[j].x, particles[j].y);
          this.ctx!.stroke();
        }
      }
    }
  }


  private drawTrails(config: IEffectTypeConfig[EffectType.TRAILS], particles: Particle[]): void {
    // Implement logic to draw particle trails based on the configuration
    // You can use a similar approach as your existing drawLines method
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  updateLinks(mouse: IMouse) {
    if (this.particleEmitter?.allowInteraction === false) return;
    const linksEffect = this.particleEmitter?.particles.effects?.find(effect => effect.type === EffectType.LINKS) || this.particleSystem.particleConfiguration.particles?.effects?.find(effect => effect.type === EffectType.LINKS);
    if (!linksEffect) return;

    const mouseX = mouse.x;
    const mouseY = mouse.y;

    if (this.particleSystem.particleConfiguration.interactivity?.eventTypes?.connect) {
      const connectRadius = this.particleSystem.particleConfiguration.interactivity.eventTypes.connect.radius * 1.5;
      const linkToPointer = this.particleSystem.particleConfiguration.interactivity.eventTypes.connect.links.linkToPointer;
      const linkToPointerOffset = this.particleSystem.particleConfiguration.interactivity.eventTypes.connect.links.linkToPointerOffset || {};
      const theme = this.particleSystem.particleConfiguration.colorThemes?.find(t => t.themeSelected);
      const themeLinkConfig = theme?.particles.effects?.config.links;
      const defaultLinkConfig = Array.isArray(this.particleSystem.particleConfiguration.particles!.effects)
        ? this.particleSystem.particleConfiguration.particles!.effects.find(effect => effect.type === EffectType.LINKS)?.config.links
        : undefined;
      const linkColor = themeLinkConfig?.color || defaultLinkConfig?.color;

      for (let i = 0; i < this.particles.length - 1; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distSquared = dx * dx + dy * dy;

          if (distSquared < connectRadius * connectRadius) {

            const distToMouse = Math.sqrt(
              Math.pow(this.particles[i].x - mouseX, 2) + Math.pow(this.particles[i].y - mouseY, 2)
            );
            let linkOpacity = 1;
            let linkWidth = this.particleSystem.particleConfiguration.interactivity.eventTypes.connect.links.width * 1.2;

            // Use the getLinkColor method to get the link color
            const linkColorForParticles = this.getLinkColor(this.particles[i], this.particles[j], (linkColor || "white"));

            const rgba = this.particleColorService.colorToRGBA(linkColorForParticles || "white");
            this.ctx!.strokeStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${linkOpacity})`;
            this.ctx!.lineWidth = linkWidth;

            if (linkToPointer && distToMouse < connectRadius) {
              this.ctx!.beginPath();
              this.ctx!.moveTo(this.particles[i].x, this.particles[i].y);

              // Apply optional offsets to the mouse pointer position
              const offsetXRight = linkToPointerOffset.right || 0;
              const offsetXLeft = linkToPointerOffset.left || 0;
              const offsetYBottom = linkToPointerOffset.bottom || 0;
              const offsetYTop = linkToPointerOffset.top || 0;

              // Adjust the mouse position based on offsets
              const adjustedMouseX = mouseX + offsetXRight - offsetXLeft;
              const adjustedMouseY = mouseY + offsetYBottom - offsetYTop;

              this.ctx!.lineTo(adjustedMouseX, adjustedMouseY); // Draw a line to the mouse pointer with offset
              this.ctx!.stroke();

            }

            if (distToMouse < connectRadius) {
              this.ctx!.beginPath();
              this.ctx!.moveTo(this.particles[i].x, this.particles[i].y);
              this.ctx!.lineTo(this.particles[j].x, this.particles[j].y);
              this.ctx!.stroke();
            }
          }
        }
      }
    }
  }

}
