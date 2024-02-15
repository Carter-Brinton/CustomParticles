import { IParticleConfiguration } from "./particleInterfaces";
import { ParticleSystem } from "./particleSystem";

export class CustomParticles {
    private particleSystem: ParticleSystem | null;
    private canvasID: string;
    private particleConfiguration: IParticleConfiguration;

    constructor(particleConfiguration: IParticleConfiguration, canvasID: string) {
        this.particleConfiguration = particleConfiguration;
        this.canvasID = canvasID;
        this.particleSystem = new ParticleSystem(particleConfiguration, canvasID);
    }

    cycleTheme() {
        if (this.particleSystem) {
            const newConfig = this.particleSystem.particleConfigurationManager.cycleTheme();
            this.particleSystem = null;
            this.particleSystem = new ParticleSystem(newConfig, this.canvasID);
        }
    }

    getExistingParticleSystem() {
        return this.particleSystem;
    }

    destroyExistingParticleSystem(canvasID: string) {
        this.particleSystem?.destroyExistingParticleSystem(canvasID);
    }
}
