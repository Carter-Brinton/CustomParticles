import { EffectType } from "../particleEnums";
import { IParticleConfiguration, IParticles } from "../particleInterfaces";

export class ParticleColorService {

    private colorCache: { [color: string]: { r: number, g: number, b: number, a: number } };

    constructor() {
        this.colorCache = {};
    }

    colorToRGBA(color: string) {
        // Convert color to RGBA
        if (typeof color === 'string' && this.colorCache[color]) {
            return this.colorCache[color];
        }

        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        let ctx = canvas.getContext("2d");

        ctx!.fillStyle = color;
        ctx!.fillRect(0, 0, 1, 1);

        const data = ctx!.getImageData(0, 0, 1, 1).data;

        // Cache and return the RGBA values as an object (significantly improves performance)
        const rgba = {
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3] / 255
        };
        this.colorCache[color] = rgba;
        return rgba;
    }

    getParticleColor(particleConfiguration: IParticleConfiguration, defaultColor: string | string[] = "#FFFFFF"): string | string[] {
        const theme = particleConfiguration.colorThemes?.find(t => t.themeSelected);
        return theme?.particles.color || particleConfiguration.particles!.color || defaultColor;
    }

    getLinkColor(particleConfiguration: IParticleConfiguration, defaultColor: string | string[] = "#FFFFFF"): string | string[] {
        const theme = particleConfiguration.colorThemes?.find(t => t.themeSelected);
        const linkColor = theme?.particles.effects?.config.links?.color || particleConfiguration.particles!.effects?.find(e => e.type === EffectType.LINKS)?.config.links?.color;
        return linkColor || defaultColor;
    }

    updateParticleOpacity(color: string, newOpacity: number): string {
        const rgba = this.colorToRGBA(color);
        newOpacity = Math.max(0, Math.min(newOpacity, 1));
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${newOpacity})`;
    }
}