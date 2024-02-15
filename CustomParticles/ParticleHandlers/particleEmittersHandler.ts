import { emit } from "process";
import { Particle } from "../particle";
import { EmitterPosition, MoveDirection } from "../particleEnums";
import { IPoint, IParticleEmitter, IParticles } from "../particleInterfaces";
import { ParticleSystem } from "../particleSystem";
import { ParticleColorService } from "../ParticleServices/particleColorService";
export class ParticleEmittersHandler {
    private _particleEmitters: IParticleEmitter[] = [];
    private _particleSystem: ParticleSystem;
    private _particlesByEmitter: Map<IParticleEmitter, Particle[]>;
    private _emissionTimer?: number;
    private _emitterStartTimes: Map<IParticleEmitter, number>;
    private particlePool: Particle[] = [];

    constructor(particleSystem: ParticleSystem) {
        this._particleSystem = particleSystem;
        this._particlesByEmitter = new Map();
        this._emitterStartTimes = new Map();
    }

    start(): void {
        for (const emitter of this.particleEmitters) {
            this.particlesByEmitter.set(emitter, []);

            if (emitter.animation.playState === 'play') {
                this.setupEmission(emitter);
            }

            // For default emitter, emit all particles at once
            if (this.isDefaultEmitter(emitter)) {
                this.createDefaultParticles(emitter);
            }
        }
    }

    private isDefaultEmitter(emitter: IParticleEmitter): boolean {
        const {
            emitterSize,
            particleRate,
            particleLife,
            animation,
        } = emitter;

        const isEmmitterSizeDefault = emitterSize.width === this.particleSystem.canvas?.width && emitterSize.height === this.particleSystem.canvas?.height;
        const isParticleRateDefault = particleRate.delay === -1 && particleRate.quantity === -1;
        const isParticleLifeDefault = particleLife.duration === -1 && particleLife.destroyFade === -1;
        const isAnimationDefault = animation.playState === "" && animation.animateLength === -1;

        return isEmmitterSizeDefault && isParticleRateDefault && isParticleLifeDefault && isAnimationDefault;
    }

    private createDefaultParticles(emitter: IParticleEmitter): void {
        const numParticles = emitter.particles.totalQuantity;
        for (let i = 0; i < numParticles!; i++) {
            this.createParticleFromPool(emitter);
        }
    }

    //Need to look into performant improvements for creating particle this way or from pool below
    private createParticle(emitter: IParticleEmitter): void {
        const { x, y } = this.calculateParticlePosition(emitter);
        const size = this.calculateParticleSize(emitter.particles);
        const color = this.calculateParticleColor(emitter.particles);
        const particle = new Particle(x, y, size, color, this.particleSystem.canvas!, this.particleSystem, emitter);

        if (this._particlesByEmitter.has(emitter)) {
            this._particlesByEmitter.get(emitter)?.push(particle);
        } else {
            // console.warn(`Emitter ${emitter.emitterSize.height} not found in particlesByEmitter map`);
            this._particlesByEmitter.set(emitter, [particle]);
        }
    }

    //Need to look into performant improvements for creating particle from pool vs above
    private createParticleFromPool(emitter: IParticleEmitter): void {
        let particle: Particle;

        // Borrow a particle from the pool if available
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop()!;
        } else {
            // If the pool is empty, create a new particle instance
            const { x, y } = this.calculateParticlePosition(emitter);
            const size = this.calculateParticleSize(emitter.particles);
            const color = this.calculateParticleColor(emitter.particles);
            particle = new Particle(x, y, size, color, this.particleSystem.canvas!, this.particleSystem, emitter);
        }

        const particlesArray = this._particlesByEmitter.get(emitter) || [];
        particlesArray.push(particle);
        this._particlesByEmitter.set(emitter, particlesArray);
    }

    //Pool logic isn't complete....
    private returnParticleToPool(particle: Particle): void {
        // Reset the particle properties as needed
        particle.reset();

        // Mark the particle as inactive and return it to the pool
        this.particlePool.push(particle);
    }

    private setupEmission(emitter: IParticleEmitter): void {
        // Check if the emitter is enabled
        if (!emitter.enabled) return;

        // Check if the emitter has expired
        if (this.isEmitterExpired(emitter)) {
            if (emitter.animation.replay) {
                this.resetEmitter(emitter); // Reset and restart the emitter if 'repeat' is true
            } else {
                return; // Emitter is expired and not set to repeat
            }
        }

        // Check if total particles have exceeded the total quantity
        const particlesArray = this._particlesByEmitter.get(emitter) || [];
        if (emitter.particles.totalQuantity && particlesArray.length >= emitter.particles.totalQuantity) return;

        // Emit particles at a defined rate
        this.emitParticles(emitter);
        if (!this.emitterStartTimes.has(emitter)) {
            this.emitterStartTimes.set(emitter, Date.now());
        }

        // Schedule the next emission based on the delay
        if (!emitter.animation.animateLength || this.calculateEmitterTime(emitter) < emitter.animation.animateLength) {
            this.emissionTimer = setTimeout(() => this.setupEmission(emitter), emitter.particleRate.delay * 1000) as unknown as number;
        }
    }
    private isEmitterExpired(emitter: IParticleEmitter): boolean {
        if (!emitter.animation.animateLength) return false;
        const particlesArray = this._particlesByEmitter.get(emitter) || [];
        const elapsedTime = particlesArray.length * emitter.particleRate.delay;
        return elapsedTime >= emitter.animation.animateLength;
    }

    private resetEmitter(emitter: IParticleEmitter): void {
        const particlesArray = this._particlesByEmitter.get(emitter) || [];

        // Check if the last particle has completed its lifecycle
        if (particlesArray.length > 0) {
            const lastParticle = particlesArray[particlesArray.length - 1];
            if (lastParticle.age < (emitter.particleLife.duration || 0)) {
                // If the last particle is still alive, postpone the reset
                setTimeout(() => this.resetEmitter(emitter), (emitter.particleLife.duration - lastParticle.age) * 1000);
                return;
            }
        }

        // If all particles have completed their lifecycle, reset the emitter
        this._particlesByEmitter.set(emitter, []);

        // Restart the emission if the emitter is set to repeat
        if (emitter.animation.replay) {
            this.setupEmission(emitter);
        }
    }

    private calculateEmitterTime(emitter: IParticleEmitter): number {
        // Use the current time and the emitter's start time to calculate elapsed time
        const startTime = this.emitterStartTimes.get(emitter) || Date.now();
        return (Date.now() - startTime) / 1000; // convert milliseconds to seconds
    }

    private emitParticles(emitter: IParticleEmitter): void {
        const particlesArray = this._particlesByEmitter.get(emitter) || [];
        for (let i = 0; i < emitter.particleRate.quantity; i++) {
            if (!emitter.particles.totalQuantity || particlesArray.length < emitter.particles.totalQuantity) {
                this.createParticleFromPool(emitter);
            }
        }
    }

    private calculateParticlePosition(emitter: IParticleEmitter): { x: number; y: number } {
        const canvasWidth = this._particleSystem.canvas?.width ?? 0;
        const canvasHeight = this._particleSystem.canvas?.height ?? 0;
        const { width, height } = emitter.emitterSize;

        let x = 0, y = 0;

        switch (emitter.position) {
            case EmitterPosition.FILL:
                x = Math.random() * canvasWidth;
                y = Math.random() * canvasHeight;
                break;
            case EmitterPosition.CENTER:
                x = (canvasWidth - width) / 2 + Math.random() * width;
                y = (canvasHeight - height) / 2 + Math.random() * height;
                break;
            default:
                // Calculate X and Y based on emitter position
                x = this.calculateXPosition(emitter.position as EmitterPosition, canvasWidth, width);
                y = this.calculateYPosition(emitter.position as EmitterPosition, canvasHeight, height);
                break;
        }

        return { x, y };
    }

    private calculateXPosition(position: EmitterPosition, canvasWidth: number, width: number): number {
        const widthPercentage = canvasWidth * (width / 100);

        switch (position) {
            case EmitterPosition.BOTTOM_LEFT:
            case EmitterPosition.TOP_LEFT:
            case EmitterPosition.LEFT_CENTER:
                return Math.random() * widthPercentage; // Starts from left, spans up to width%

            case EmitterPosition.BOTTOM_RIGHT:
            case EmitterPosition.TOP_RIGHT:
            case EmitterPosition.RIGHT_CENTER:
                return canvasWidth - widthPercentage + Math.random() * widthPercentage; // Starts from right, spans left to width%

            case EmitterPosition.BOTTOM_CENTER:
            case EmitterPosition.TOP_CENTER:
                return (canvasWidth - widthPercentage) / 2 + Math.random() * widthPercentage; // Centered horizontally

            default:
                return Math.random() * canvasWidth; // Default fallback for FILL and other cases
        }
    }

    private calculateYPosition(position: EmitterPosition, canvasHeight: number, height: number): number {
        const heightPercentage = canvasHeight * (height / 100);

        switch (position) {
            case EmitterPosition.BOTTOM_LEFT:
            case EmitterPosition.BOTTOM_RIGHT:
            case EmitterPosition.BOTTOM_CENTER:
                return canvasHeight - heightPercentage + Math.random() * heightPercentage; // Starts from bottom, spans up to height%

            case EmitterPosition.TOP_LEFT:
            case EmitterPosition.TOP_RIGHT:
            case EmitterPosition.TOP_CENTER:
                return Math.random() * heightPercentage; // Starts from top, spans down to height%

            case EmitterPosition.LEFT_CENTER:
            case EmitterPosition.RIGHT_CENTER:
                return (canvasHeight - heightPercentage) / 2 + Math.random() * heightPercentage; // Centered vertically

            default:
                return Math.random() * canvasHeight; // Default fallback for FILL and other cases
        }
    }



    private calculateParticleSize(emitterParticles?: IParticles): number {
        const sizeConfig = emitterParticles?.size;
        if (!sizeConfig) throw new Error("Size configuration is missing");
        return Math.random() * (sizeConfig.max - sizeConfig.min) + sizeConfig.min;
    }

    private calculateParticleColor(emitterParticles?: IParticles): string | string[] {
        if (emitterParticles?.color) {
            if (Array.isArray(emitterParticles.color) && emitterParticles.color.length > 0) {
                // If emitterParticles.color is an array, select a random color from the array
                const randomColor = emitterParticles.color[Math.floor(Math.random() * emitterParticles.color.length)];
                return randomColor;
            } else {
                // Use the single color specified in emitterParticles.color
                return emitterParticles.color;
            }
        } else {
            const colorService = new ParticleColorService();
            const particleColor = colorService.getParticleColor(this.particleSystem.particleConfiguration);

            return particleColor;
        }
    }


    // Getters and Setters
    public get particleEmitters(): IParticleEmitter[] {
        return this._particleEmitters;
    }
    public set particleEmitters(value: IParticleEmitter[]) {
        this._particleEmitters = value;
    }

    public get particlesByEmitter(): Map<IParticleEmitter, Particle[]> {
        return this._particlesByEmitter;
    }
    public set particlesByEmitter(value: Map<IParticleEmitter, Particle[]>) {
        this._particlesByEmitter = value;
    }

    get particleSystem(): ParticleSystem {
        return this._particleSystem;
    }
    set particleSystem(value: ParticleSystem) {
        this._particleSystem = value;
    }

    get emissionTimer(): number | undefined {
        return this._emissionTimer;
    }
    set emissionTimer(value: number | undefined) {
        this._emissionTimer = value;
    }

    public get emitterStartTimes(): Map<IParticleEmitter, number> {
        return this._emitterStartTimes;
    }
    public set emitterStartTimes(value: Map<IParticleEmitter, number>) {
        this._emitterStartTimes = value;
    }

}