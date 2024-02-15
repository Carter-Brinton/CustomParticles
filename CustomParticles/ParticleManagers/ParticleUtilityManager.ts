import { BasicNoise, SimplexNoise } from "../../NoiseGenerator/noiseGenerator";
import { Particle } from "../particle";
import { MoveNoisePathType } from "../particleEnums";

export class ParticleUtilityManager {
    private particle: Particle;

    constructor(particle: Particle) {
        this.particle = particle;
    }

    applyGravityAndDecay(): void {
        if (this.particle.gravity.enabled) {
            this.particle.speedY += (this.particle.gravity.inverse ? -1 : 1) * this.particle.gravity.acceleration;
        }

        if (this.particle.velocityFactor && this.particle.velocityFactor !== 1) {
            const targetSpeedX = this.particle.speedX * this.particle.velocityFactor;
            const targetSpeedY = this.particle.speedY * this.particle.velocityFactor;

            const diffSpeedX = targetSpeedX - this.particle.speedX;
            const diffSpeedY = targetSpeedY - this.particle.speedY;

            const adjustmentFactor = 0.01; // Adjust to make more or less gradual
            this.particle.speedX += diffSpeedX * adjustmentFactor;
            this.particle.speedY += diffSpeedY * adjustmentFactor;
        }

    }

    getNoiseValue(x: number, y: number, noiseType: MoveNoisePathType): number {
        switch (noiseType) {
            case MoveNoisePathType.PERLIN:
                // Implement or import a Perlin noise function
                return new BasicNoise().getValue(x, y); // Placeholder for actual Perlin noise
            case MoveNoisePathType.SIMPLEX:
                const simplex = new SimplexNoise();
                return simplex.noise(x, y); // Using 2D noise for 2D movement
            default:
                return new BasicNoise().getValue(x, y); // Fallback to basic noise
        }
    }

    isOffScreen(): boolean {
        return (this.particle.x < -this.particle.size || this.particle.x > this.particle.canvas.width + this.particle.size || this.particle.y < -this.particle.size || this.particle.y > this.particle.canvas.height + this.particle.size);
    }
}