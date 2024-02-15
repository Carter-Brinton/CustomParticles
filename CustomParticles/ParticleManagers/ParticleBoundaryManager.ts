import { Particle } from "../particle";
import { BoundarySide, ParticleBehavior } from "../particleEnums";
import { IBoundaryConfig } from "../particleInterfaces";

export class ParticleBoundaryManager {
  private particle: Particle;
  private boundaryConfig: IBoundaryConfig | undefined;

  constructor(particle: Particle) {
    this.particle = particle;
  }

  handleBoundaryInteractions(): void {
    const boundaryEdges = this.getBoundaryEdges();
    this.boundaryConfig = this.particle.movementBehavior!.boundary;
    const defaultBehavior = this.particle.movementBehavior!.defaultBoundaryBehavior || ParticleBehavior.PASS_THROUGH_DESTROY;

    boundaryEdges.forEach((edge) => {
      const specificConfig = this.boundaryConfig?.config.find(config => config.side === edge || config.side === BoundarySide.ALL);
      if (specificConfig) {
        this.applyBehavior([edge], specificConfig.behavior);
      } else {
        this.applyBehavior([edge], defaultBehavior);
      }
    });
  }

  applyBehavior(boundaryEdges: BoundarySide[], behavior: ParticleBehavior): void {
    switch (behavior) {
      case ParticleBehavior.BOUNCE:
        this.applyBounceBehavior(boundaryEdges);
        break;
      case ParticleBehavior.DESTROY:
        this.particle.destroy();
        break;
      case ParticleBehavior.PASS_THROUGH_DESTROY:
        this.particle.passThroughDestroy();
        break;
      default:
        this.particle.passThroughDestroy();
        break;
    }
  }

  applyBounceBehavior(boundaryEdges: BoundarySide[]): void {
    if (boundaryEdges.includes(BoundarySide.LEFT) || boundaryEdges.includes(BoundarySide.RIGHT)) {
      this.particle.speedX *= -1;
      // Ensure particle is within bounds to avoid sticking to the edge
      // this.particle.x = Math.max(0, Math.min(this.particle.canvas.width, this.particle.x));
    }

    if (boundaryEdges.includes(BoundarySide.TOP) || boundaryEdges.includes(BoundarySide.BOTTOM)) {
      this.particle.speedY *= -1;
      // Ensure particle is within bounds to avoid sticking to the edge
      // this.particle.y = Math.max(0, Math.min(this.particle.canvas.height, this.particle.y));
    }
  }

  getBoundaryEdges(): BoundarySide[] {
    if (this.particle.canvas) {
      let leftBound = 0, rightBound = this.particle.canvas.width, topBound = 0, bottomBound = this.particle.canvas.height;

      if (this.boundaryConfig?.size) {
        leftBound += this.particle.particleSystem.particleCanvasManager.parseSize(this.boundaryConfig.size.width, this.particle.canvas.width) / 2;
        rightBound -= this.particle.particleSystem.particleCanvasManager.parseSize(this.boundaryConfig.size.width, this.particle.canvas.width) / 2;
        topBound += this.particle.particleSystem.particleCanvasManager.parseSize(this.boundaryConfig.size.height, this.particle.canvas.height) / 2;
        bottomBound -= this.particle.particleSystem.particleCanvasManager.parseSize(this.boundaryConfig.size.height, this.particle.canvas.height) / 2;
      }

      const edges: BoundarySide[] = [];
      if (this.particle.x < leftBound) edges.push(BoundarySide.LEFT);
      if (this.particle.x > rightBound) edges.push(BoundarySide.RIGHT);
      if (this.particle.y < topBound) edges.push(BoundarySide.TOP);
      if (this.particle.y > bottomBound) edges.push(BoundarySide.BOTTOM);
      return edges;
    }
    return [];
  }

  isInsideCanvas(): boolean {
    return (
      this.particle.x >= 0 &&
      this.particle.x <= this.particle.canvas.width &&
      this.particle.y >= 0 &&
      this.particle.y <= this.particle.canvas.height
    );
  }
}
