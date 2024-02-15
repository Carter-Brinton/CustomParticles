import { HoverMode } from "../particleEnums";
import { ParticleSystem } from "../particleSystem";

export class ParticleAnimationManager {
    private particleSystem: ParticleSystem;
    private particleAge: number;
    private lastFrameTime: number;

    constructor(particleSystem: ParticleSystem) {
        this.particleSystem = particleSystem;
        this.particleAge = 0;
        this.lastFrameTime = Date.now();
    }

    animate(): void {
        const fpsLimit = this.particleSystem.particleConfiguration.fpsLimit || 0;
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        setTimeout(() => {
            this.particleSystem.animationFrameId = requestAnimationFrame(() => this.animate());
            if (this.particleSystem.ctx && this.particleSystem.canvas) {
                this.particleSystem.ctx.clearRect(0, 0, this.particleSystem.canvas.width, this.particleSystem.canvas.height);
            }

            // Iterate through each emitter's particles
            for (const [emitter, particles] of this.particleSystem.particleEmittersHandler.particlesByEmitter) {
                for (const particle of particles) {
                    particle.update(deltaTime);
                    particle.draw(this.particleSystem.ctx!);

                    if (particle.particleEmitter?.particleLife.duration !== -1) {
                        if (particle.shouldDestroy(particle.particleEmitter?.particleLife.duration)) {
                            particle.destroy();
                        }
                    }
                }

                if (this.particleSystem.effectsHandler && emitter.allowInteraction === true) {
                    // Handle hover effects
                    if (this.particleSystem.mouseIsOverCanvas && this.particleSystem.particleConfiguration.interactivity?.events?.onHover?.enabled) {
                        const onHoverMode = this.particleSystem.particleConfiguration.interactivity.events.onHover?.mode;
                        switch (onHoverMode) {
                            case HoverMode.connect:
                                for (const handler of this.particleSystem.effectsHandler) {
                                    handler.updateLinks(this.particleSystem.mouse!); // Update links for each handler
                                }
                                break;
                            // Other cases for hover modes
                            default:
                                // Handle the default case or do nothing
                                break;
                        }
                    }

                    // Apply effects for each effects handler
                    for (const handler of this.particleSystem.effectsHandler) {
                        handler.applyEffects();
                        handler.applyRotation();
                    }
                }

            }

            // Increment frame count
            this.particleSystem.frameCount++;
        }, 1000 / fpsLimit);
    }
}