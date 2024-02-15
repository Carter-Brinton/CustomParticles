import { ICanvasPosition, ICanvasSize, IMouse } from "../particleInterfaces";
import { ParticleSystem } from "../particleSystem";

export class ParticleCanvasManager {
    private particleSystem: ParticleSystem;

    constructor(particleSystem: ParticleSystem) {
        this.particleSystem = particleSystem
    }

    setupCanvas(): void {

        this.particleSystem.canvas = document.getElementById(this.particleSystem.canvasID) as HTMLCanvasElement
            || document.querySelector("." + this.particleSystem.canvasID) as HTMLCanvasElement;

        if (!this.particleSystem.canvas) {
            this.particleSystem.canvas = document.createElement('canvas');
            this.particleSystem.canvas.id = this.particleSystem.canvasID;
            document.body.appendChild(this.particleSystem.canvas);
        } else {
            this.particleSystem.canvas.id = this.particleSystem.canvasID;
            const ctx = this.particleSystem.canvas.getContext('2d'); //THIS and line below, doesn't seem to be working correctly
            ctx?.clearRect(0, 0, this.particleSystem.canvas.width, this.particleSystem.canvas.height);
        }

        this.particleSystem.ctx = this.particleSystem.canvas.getContext('2d', { willReadFrequently: true });
        this.particleSystem.mouse = { x: -10000, y: -10000, isDown: false };
        const pixelRatio = window.devicePixelRatio || 1;
        const overrideStyle = this.particleSystem.particleConfiguration.overrideDefaultStyle;

        if (overrideStyle && overrideStyle.override) {
            // Handle position styles
            if (overrideStyle.position) {
                const positionStyle = overrideStyle.position;
                this.particleSystem.canvas.style.position = positionStyle.position;
                (['top', 'bottom', 'left', 'right'] as (keyof ICanvasPosition)[]).forEach(prop => {
                    if (positionStyle[prop] !== undefined) {
                        this.particleSystem.canvas!.style[prop as any] = String(positionStyle[prop as keyof typeof positionStyle]);
                    }
                });
            }

            // Handle size styles
            if (overrideStyle.size) {
                const sizeStyle = overrideStyle.size;
                (['width', 'height', 'maxWidth', 'maxHeight'] as (keyof ICanvasSize)[]).forEach(prop => {
                    if (sizeStyle[prop] !== undefined) {
                        this.particleSystem.canvas!.style[prop as any] = String(sizeStyle[prop]);
                    }
                });
            }

            // Handle general styles
            if (overrideStyle.general) {
                const generalStyle = overrideStyle.general;
                Object.keys(generalStyle).forEach(key => {
                    const value = generalStyle[key as keyof typeof generalStyle];
                    if (value !== undefined) {
                        this.particleSystem.canvas!.style[key as any] = value;
                    }
                });
            }
            this.particleSystem.canvas.width = this.parseSize(overrideStyle?.size?.width || "100%", window.innerWidth) * pixelRatio;
            this.particleSystem.canvas.height = this.parseSize(overrideStyle?.size?.height || "100%", window.innerHeight) * pixelRatio;
        } else {
            this.particleSystem.canvas.style.position = 'fixed';
            this.particleSystem.canvas.style.top = '0';
            this.particleSystem.canvas.style.left = '0';
            this.particleSystem.canvas.style.zIndex = '-1';

            // Set canvas dimensions considering the pixel ratio
            this.particleSystem.canvas.width = window.innerWidth * pixelRatio;
            this.particleSystem.canvas.height = window.innerHeight * pixelRatio;

            // Set CSS size to match canvas dimensions
            this.particleSystem.canvas.style.width = window.innerWidth + 'px';
            this.particleSystem.canvas.style.height = window.innerHeight + 'px';
        }
    }

    parseSize(sizeStr: string, fullSize: number): number {
        if (sizeStr.endsWith("%")) {
            const percentage = parseFloat(sizeStr) / 100;
            return Math.round(fullSize * percentage);
        } else if (sizeStr.endsWith("px")) {
            return parseInt(sizeStr);
        }
        return fullSize; // Default to full size if format is unknown
    }
}