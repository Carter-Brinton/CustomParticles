import { ParticleColorService } from "../../ParticleServices/particleColorService";
import { Particle } from "../../particle";
import { IParticleEmitter } from "../../particleInterfaces";
import { ParticleSystem } from "../../particleSystem";

export interface IBubblePopLines {
  x: number;
  y: number;
  angle: number;
  angleIndex: number;
  lineLength: number;
  growing: boolean;
  startTime: number;
  rgbaColor: { r: number; g: number; b: number; a: number };
}

export class BubbleParticles {

  private particles: Particle[];
  private particleSystem: ParticleSystem;
  private particleEmitter: IParticleEmitter | undefined;
  private canvas: HTMLCanvasElement | null;
  private lineAnimations: IBubblePopLines[] = [];

  constructor(particles: Particle[], particleEmitter: IParticleEmitter | undefined, particleSystem: ParticleSystem, canvas: HTMLCanvasElement | null) {
    this.particles = particles;
    this.particleEmitter = particleEmitter;
    this.particleSystem = particleSystem;
    this.canvas = canvas;
  }


  popBubble(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
    if (!this.canvas || this.particleEmitter?.allowInteraction === false) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    const popLines = 6;
    const angleIncrement = 2 * Math.PI / popLines;

    // Consider initializing this outside of this method if it doesn't maintain state
    const particleColorService = new ParticleColorService();

    for (const particle of this.particles) {
      const deltaX = mouseX - particle.x;
      const deltaY = mouseY - particle.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < particle.size) {
        for (let i = 0; i < popLines; i++) {
          const angle = angleIncrement * i;
          this.createLineAnimation(particle, angle, i, particleColorService);
        }
        particle.destroy();
        if (this.lineAnimations.length > 0) {
          this.animateLines(ctx, particle);
        }
      }
    }
  }

  createLineAnimation(particle: Particle, angle: number, angleIndex: number, particleColorService: ParticleColorService) {
    // Determine the rgbaColor based on the type of particle.color
    let rgbaColor: { r: number; g: number; b: number; a: number };

    if (typeof particle.color === 'string') {
      // If particle.color is a string, use it directly
      rgbaColor = particleColorService.colorToRGBA(particle.color);
    } else if (Array.isArray(particle.color) && particle.color.length > 0) {
      // If particle.color is an array, select a random color from the array
      const randomColor = particle.color[Math.floor(Math.random() * particle.color.length)];
      rgbaColor = particleColorService.colorToRGBA(randomColor);
    } else {
      // Default to a fallback color (you can customize this)
      rgbaColor = { r: 255, g: 255, b: 255, a: 1 }; // Change this to your desired default color
    }

    this.lineAnimations.push({
      x: particle.x,
      y: particle.y,
      angle,
      angleIndex,
      lineLength: 0,
      growing: true,
      startTime: performance.now(),
      rgbaColor,
    });
  }


  animateLines(ctx: CanvasRenderingContext2D, particle: Particle) {
    const currentTime = performance.now();
    const animationDuration = 500;
    const maxPopDistance = particle.size;
    const initialOffset = 10;

    let animationInProgress = false;

    for (const line of this.lineAnimations) {
      const elapsedTime = currentTime - line.startTime;
      const lineLifetime = elapsedTime / animationDuration;

      if (lineLifetime < 1) {
        animationInProgress = true;
        this.updateLine(line, lineLifetime, initialOffset, maxPopDistance);
        this.drawLine(ctx, line, initialOffset);
      }
    }

    if (animationInProgress) {
      requestAnimationFrame(() => this.animateLines(ctx, particle));
    } else {
      this.lineAnimations = []; // Clear finished animations
    }
  }

  updateLine(line: IBubblePopLines, lineLifetime: number, initialOffset: number, maxPopDistance: number) {
    const easedProgress = 1 - Math.pow(1 - lineLifetime, 3);
    line.lineLength = initialOffset + (maxPopDistance - initialOffset) * easedProgress;
  }

  drawLine(ctx: CanvasRenderingContext2D, line: IBubblePopLines, initialOffset: number) {
    const lineLifetime = (performance.now() - line.startTime) / 500;
    const startX = line.x + line.lineLength * Math.cos(line.angle);
    const startY = line.y + line.lineLength * Math.sin(line.angle);
    const endX = startX + initialOffset * (1 - lineLifetime) * Math.cos(line.angle);
    const endY = startY + initialOffset * (1 - lineLifetime) * Math.sin(line.angle);

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${line.rgbaColor.r}, ${line.rgbaColor.g}, ${line.rgbaColor.b}, ${1 - lineLifetime})`;
    ctx.lineWidth = 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // popBubble(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
  //   if (!this.canvas || this.particleEmitter?.allowInteraction === false) return;

  //   const rect = this.canvas.getBoundingClientRect();
  //   const mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
  //   const mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
  //   const popLines = 6; // Number of lines in the popping effect

  //   const particleColorService = new ParticleColorService();

  //   this.particles.forEach((particle) => {
  //     const dx = mouseX - particle.x;
  //     const dy = mouseY - particle.y;
  //     const distance = Math.sqrt(dx * dx + dy * dy);

  //     if (distance < particle.size) {
  //       Array.from({ length: popLines }).forEach((_, i) => {
  //         const angle = (2 * Math.PI / popLines) * i;
  //         this.lineAnimations.push({
  //           x: particle.x,
  //           y: particle.y,
  //           angle,
  //           angleIndex: i, // Assuming 'i' is the angle index
  //           lineLength: 0,
  //           growing: true,
  //           startTime: performance.now(),
  //           popDistance: 0,
  //           popDistanceReturn: 0,
  //           inversePop: false,
  //           rgbaColor: particleColorService.colorToRGBA(particle.color),
  //         });

  //       });

  //       particle.destroy();
  //       if (this.lineAnimations.length > 0) {
  //         this.animateLines(ctx, particle);
  //       }
  //     }
  //   });
  // }

  // animateLines(ctx: CanvasRenderingContext2D, particle: Particle) {
  //   const currentTime = performance.now();
  //   const animationDuration = 500; // Shorter duration for a quick burst effect
  //   const maxPopDistance = particle.size; // Maximum distance for line animation
  //   const initialOffset = 10; // Initial offset from the center

  //   this.lineAnimations = this.lineAnimations.filter(line => {
  //     const elapsedTime = currentTime - line.startTime;
  //     const lineLifetime = elapsedTime / animationDuration;

  //     if (lineLifetime < 1) {
  //       const easedProgress = 1 - Math.pow(1 - lineLifetime, 3); // Cubic easing
  //       line.lineLength = initialOffset + (maxPopDistance - initialOffset) * easedProgress; // Increase line length
  //     } else {
  //       return false; // Remove the line after the animation is complete
  //     }

  //     // Calculate the end points of the line
  //     const angle = line.angle;
  //     let startX = line.x; // Keep the start point unchanged
  //     let startY = line.y; // Keep the start point unchanged
  //     const endX = startX + line.lineLength * Math.cos(angle); // Calculate the end point
  //     const endY = startY + line.lineLength * Math.sin(angle); // Calculate the end point

  //     // Set the start point of the line closer to the initial point for outward shrinking
  //     const shrinkFactor = 1 - lineLifetime;
  //     startX = endX - initialOffset * shrinkFactor * Math.cos(angle);
  //     startY = endY - initialOffset * shrinkFactor * Math.sin(angle);

  //     // Draw the line with a fading effect
  //     ctx.beginPath();
  //     ctx.strokeStyle = `rgba(${line.rgbaColor.r}, ${line.rgbaColor.g}, ${line.rgbaColor.b}, ${1 - lineLifetime})`;
  //     ctx.lineWidth = 2;
  //     ctx.moveTo(startX, startY);
  //     ctx.lineTo(endX, endY);
  //     ctx.stroke();

  //     return true;
  //   });

  //   if (this.lineAnimations.length > 0) {
  //     requestAnimationFrame(() => this.animateLines(ctx, particle));
  //   }
  // }

  //   animateLines(ctx: CanvasRenderingContext2D) {
  //     const currentTime = performance.now();
  //     const animationDuration = 500; // Shorter duration for a quick burst effect
  //     const maxPopDistance = 60; // Maximum distance for line animation
  //     const initialOffset = 10; // Initial offset from the center

  //     this.lineAnimations = this.lineAnimations.filter(line => {
  //         const elapsedTime = currentTime - line.startTime;
  //         const lineLifetime = elapsedTime / animationDuration;

  //         // Determine the length of the line based on the elapsed time and a smooth easing function
  //         if (lineLifetime < 1) {
  //             const easedProgress = 1 - Math.pow(1 - lineLifetime, 3); // Cubic easing
  //             line.lineLength = initialOffset + (maxPopDistance - initialOffset) * easedProgress;
  //         } else {
  //             return false; // Remove the line after the animation is complete
  //         }

  //         // Calculate the start and end points of the line
  //         const angle = line.angle;
  //         const startX = line.x + initialOffset * Math.cos(angle);
  //         const startY = line.y + initialOffset * Math.sin(angle);

  //         // Calculate the position of the end of the line based on the inverse pop effect
  //         const inversePopFactor = 1 - lineLifetime;
  //         const inversePopLength = line.lineLength * inversePopFactor;
  //         const inverseEndX = startX + inversePopLength * Math.cos(angle);
  //         const inverseEndY = startY + inversePopLength * Math.sin(angle);

  //         // Draw the line with a fading effect
  //         ctx.beginPath();
  //         ctx.strokeStyle = `rgba(139, 201, 238, ${1 - lineLifetime})`; // Fading effect
  //         ctx.lineWidth = 2;
  //         ctx.moveTo(startX, startY);
  //         ctx.lineTo(inverseEndX, inverseEndY);
  //         ctx.stroke();

  //         return true;
  //     });

  //     if (this.lineAnimations.length > 0) {
  //         requestAnimationFrame(() => this.animateLines(ctx));
  //     }
  // }
}