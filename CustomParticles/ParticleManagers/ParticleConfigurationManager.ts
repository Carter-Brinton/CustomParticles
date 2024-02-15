import { IParticleConfiguration } from "../particleInterfaces";
import { ParticleSystem } from "../particleSystem";

export class ParticleConfigurationManager {
    private particleSystem: ParticleSystem;

    constructor(particleSystem: ParticleSystem) {
        this.particleSystem = particleSystem;
    }

    getResponsiveConfig(): void {
        let newConfig = { ...this.particleSystem.particleConfiguration };

        if (this.particleSystem.particleConfiguration.responsive && this.particleSystem.particleConfiguration.responsive.enabled) {
            const screenWidth = window.innerWidth;
            const applicableSetting = this.particleSystem.particleConfiguration.responsive.breakpoints.find(setting => {
                return screenWidth >= setting.minWidth && (!setting.maxWidth || screenWidth <= setting.maxWidth);
            });

            if (applicableSetting) {
                newConfig = this.deepMerge(newConfig, applicableSetting.config);
            }
        }

        this.particleSystem.particleConfiguration = newConfig;
    }

    deepMerge(target: any, source: any) {
        Object.keys(source).forEach((key) => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                // If the source array is not empty, replace the target array with the source array.
                // Otherwise, keep the target array.
                target[key] = sourceValue.length > 0 ? sourceValue : targetValue;
            } else if (typeof targetValue === 'object' && typeof sourceValue === 'object') {
                target[key] = this.deepMerge({ ...targetValue }, sourceValue);
            } else {
                target[key] = sourceValue;
            }
        });

        return target;
    }

    cycleTheme(): IParticleConfiguration {
        const currentThemeIndex = this.particleSystem.particleConfiguration.colorThemes!.findIndex(t => t.themeSelected);
        const nextThemeIndex = (currentThemeIndex + 1) % this.particleSystem.particleConfiguration.colorThemes!.length;

        this.particleSystem.particleConfiguration.colorThemes![currentThemeIndex].themeSelected = false;
        this.particleSystem.particleConfiguration.colorThemes![nextThemeIndex].themeSelected = true;
        this.particleSystem.destroyExistingParticleSystem(this.particleSystem.canvasID);

        return this.particleSystem.particleConfiguration;
    }

    applyConfiguration(): void {
        const theme = this.particleSystem.particleConfiguration.colorThemes?.find(t => t.themeSelected);
        if (theme) {
            this.particleSystem.canvas!.style.background = theme.background.color;
        }
    }
}