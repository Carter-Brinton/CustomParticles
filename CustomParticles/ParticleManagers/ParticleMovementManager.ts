import { BasicNoise, SimplexNoise } from "../../NoiseGenerator/noiseGenerator";
import { Particle } from "../particle";
import { MoveDirection, MoveNoisePathType, MovePathType, MovePredefinedPathType, ParticleBehavior } from "../particleEnums";
import { INoisePathConfig, IParticles, IPredefinedPathConfig } from "../particleInterfaces";

export class ParticleMovementManager {
    private particle: Particle;
    public movementBehavior: IParticles['movement'];

    constructor(particle: Particle, direction: MoveDirection, speedRange: { min: number; max: number }) {
        this.particle = particle;
        this.setInitialDirection(direction, speedRange);
    }

    applyMovementBehavior(): void {
        // Determine path movement or standard movement
        if (this.movementBehavior?.path && this.movementBehavior.path.enabled) {
            const pathConfig = this.movementBehavior.path.config;
            if (this.movementBehavior.path.type === MovePathType.NOISE) {
                // Apply noise path
                this.applyNoisePath(pathConfig as INoisePathConfig);
            } else if (this.movementBehavior.path.type === MovePathType.PREDEFINED) {
                // Apply predefined path
                this.applyPredefinedPath(pathConfig);
            }
        } else {
            // Apply standard movement
            this.applyStandardMovement();
        }
    }

    setInitialDirection(direction: MoveDirection, speedRange: { min: number; max: number }) {
        let angle;
        let speed = 0;

        if (direction !== MoveDirection.NONE) {
            speed = Math.random() * (speedRange.max - speedRange.min) + speedRange.min;

            switch (direction) {
                case MoveDirection.UP:
                    angle = -Math.PI / 2;
                    break;
                case MoveDirection.DOWN:
                    angle = Math.PI / 2;
                    break;
                case MoveDirection.LEFT:
                    angle = Math.PI;
                    break;
                case MoveDirection.RIGHT:
                    angle = 0;
                    break;
                case MoveDirection.UP_LEFT:
                    angle = -3 * Math.PI / 4;
                    break;
                case MoveDirection.UP_RIGHT:
                    angle = -Math.PI / 4;
                    break;
                case MoveDirection.DOWN_LEFT:
                    angle = 3 * Math.PI / 4;
                    break;
                case MoveDirection.DOWN_RIGHT:
                    angle = Math.PI / 4;
                    break;
                case MoveDirection.RANDOM:
                    angle = Math.random() * 2 * Math.PI;
                    break;
                default:
                    angle = Math.random() * 2 * Math.PI;
                    break;
            }

            this.particle.speedX = Math.cos(angle) * speed;
            this.particle.speedY = Math.sin(angle) * speed;

        } else {
            // If direction is NONE, keep speeds at 0
            this.particle.speedX = 0;
            this.particle.speedY = 0;
        }
    }

    applyStandardMovement(): void {
        this.particle.x += this.particle.speedX;
        this.particle.y += this.particle.speedY;

        this.particle.particleBoundaryManager.handleBoundaryInteractions();
    }

    applyNoisePath(config: INoisePathConfig): void {
        // Ensure the configuration is for noise path
        if (config.generator && (config.generator === MoveNoisePathType.PERLIN || config.generator === MoveNoisePathType.SIMPLEX)) {
            const noiseValueX = this.getNoiseValue(this.particle.x * config.scale, this.particle.y * config.scale, config.generator);
            const noiseValueY = this.getNoiseValue(this.particle.y * config.scale, this.particle.x * config.scale, config.generator);
            this.particle.x += Math.cos(noiseValueX * 2 * Math.PI) * config.speed;
            this.particle.y += Math.sin(noiseValueY * 2 * Math.PI) * config.speed;
        }
    }

    applyPredefinedPath(config: any): void {
        switch (config.generator) {
            case MovePredefinedPathType.CIRCLE:
                this.moveInCircle(config);
                break;
            case MovePredefinedPathType.TRIANGLE:
            case MovePredefinedPathType.SQUARE:
            case MovePredefinedPathType.POLYGON:
                // Add logic for polygonal path
                break;
            case MovePredefinedPathType.SINE:
                // Add logic for sine wave path
                break;
            // Add more predefined paths as needed
            default:
                this.applyStandardMovement();
                break;
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

    private moveInCircle(config: any): void {
        // Example logic for a circular path
        const angle = (this.particle.movementBehavior?.path?.config as IPredefinedPathConfig).increment * this.particle.particleSystem.frameCount();
        this.particle.x = config.centerX + config.radius * Math.cos(angle);
        this.particle.y = config.centerY + config.radius * Math.sin(angle);
    }

    // Reset position based on path direction
    resetPositionAlongPath(): void {
        if (this.particle.movementBehavior?.path?.type === MovePathType.NOISE) {
            // Reset position for noise path
            // For example, reset to a position on the edge of the canvas based on the noise direction
            const edgePosition = this.calculateNoiseEdgePosition();
            this.particle.x = edgePosition.x;
            this.particle.y = edgePosition.y;
        } else if (this.particle.movementBehavior?.path?.type === MovePathType.PREDEFINED) {
            // Reset position for predefined path
            // Example for a simple upward movement
            const predefinedPathConfig = this.particle.movementBehavior.path.config as IPredefinedPathConfig; // Type assertion
            if (predefinedPathConfig.pathType === MovePredefinedPathType.CIRCLE) {
                // Reset to a position at the bottom of the canvas, aligned with the circle's radius
                const radius = predefinedPathConfig.details.radius || 100;
                const angle = Math.random() * 2 * Math.PI; // Random angle for variety
                this.particle.x = this.particle.canvas.width / 2 + radius * Math.cos(angle); // Align with the circle's radius
                this.particle.y = this.particle.canvas.height + this.particle.size; // Start from below the canvas
            }
            // Add other predefined path types here
        } else {
            // Default reset (e.g., random position at the bottom for upward movement)
            this.particle.x = Math.random() * this.particle.canvas.width;
            this.particle.y = this.particle.canvas.height + this.particle.size;
        }

        if (this.particle.particleUtilityManager.isOffScreen() && (this.particle.movementBehavior!.defaultBoundaryBehavior === ParticleBehavior.DESTROY || this.particle.movementBehavior!.defaultBoundaryBehavior === ParticleBehavior.PASS_THROUGH_DESTROY)) {
            this.particle.destroy();
        }
    }

    // Example helper method for calculating an edge position based on noise
    calculateNoiseEdgePosition(): { x: number; y: number } {
        // Placeholder logic: Adjust based on your noise and movement specifics
        const noise = new BasicNoise(); // Assuming you have a noise class
        const noiseValue = noise.getValue(this.particle.x, this.particle.y); // Get noise value at current position

        // Determine a direction based on noise
        let angle = noiseValue * Math.PI * 2; // Convert noise value to an angle

        // Calculate a new position on the edge of the canvas based on the angle
        let x, y;
        if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
            // Move horizontally
            x = Math.cos(angle) > 0 ? 0 : this.particle.canvas.width; // Move to left or right edge
            y = Math.random() * this.particle.canvas.height; // Random y position
        } else {
            // Move vertically
            x = Math.random() * this.particle.canvas.width; // Random x position
            y = Math.sin(angle) > 0 ? 0 : this.particle.canvas.height; // Move to top or bottom edge
        }

        return { x, y };
    }
}