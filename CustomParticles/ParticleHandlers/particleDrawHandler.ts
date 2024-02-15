import { ParticleColorService } from "../ParticleServices/particleColorService";
import { Particle } from "../particle";
import { ParticleCustoms, ParticleShapes, ParticleType } from "../particleEnums";

export class ParticleDrawHandler {
    private particle: Particle;
    private particleColors: Map<string, string> = new Map(); // Store link colors by particle pair for multi color links
    private emojiImage: HTMLImageElement | null;

    constructor(particle: Particle) {
        this.particle = particle;
        this.emojiImage = null;

        this.initializeParticle();
    }

    initializeParticle(): void {
        switch (this.particle.particleType) {
            case ParticleType.SHAPE:
                this.particle.particleShape = this.particle.particleEmitter?.particles!.particleType?.config.shape?.value || ParticleShapes.CIRCLE;
                break;
            case ParticleType.EMOJI:
                this.particle.emoji = this.particle.particleEmitter?.particles!.particleType?.config.emoji || "😀"; // Default emoji
                this.prepareEmoji();
                break;
            case ParticleType.IMAGE:
                if (this.particle.particleEmitter?.particles!.particleType?.config.image?.src) {
                    this.particle.image = new Image();
                    this.particle.image.src = this.particle.particleEmitter?.particles!.particleType.config.image.src;
                    this.particle.image.width = this.particle.particleEmitter?.particles!.particleType.config.image.width || this.particle.size;
                    this.particle.image.height = this.particle.particleEmitter?.particles!.particleType.config.image.height || this.particle.size;
                }
                break;
            case ParticleType.CUSTOM: //ADD MORE CUSTOMS LATER
                this.particle.particleCustom = this.particle.particleEmitter?.particles!.particleType?.config.custom?.value || ParticleCustoms.BUBBLE;
                break;
        }
    }

    private getParticleColor(particle: Particle, particleColor: string | string[]): string {
        // Generate a unique key for the particle
        const key = particle.ID;
    
        // Check if a color is already assigned for this particle
        if (this.particleColors.has(key)) {
            return this.particleColors.get(key)!;
        }
    
        // If no color is assigned, generate a random color and store it
        const randomColor = Array.isArray(particleColor)
            ? particleColor[Math.floor(Math.random() * particleColor.length)]
            : particleColor;
    
        this.particleColors.set(key, randomColor);
        return randomColor;
    }
    

    prepareEmoji(): void {
        // Create an image for the emoji
        const size = this.particle.size * 2;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;

        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx!.font = `${size}px Arial`;
        offscreenCtx!.textAlign = 'center';
        offscreenCtx!.textBaseline = 'middle';
        offscreenCtx!.fillText(this.particle.emoji!, size / 2, size / 2);

        // Convert the offscreen canvas to an image
        this.emojiImage = new Image();
        this.emojiImage.src = offscreenCanvas.toDataURL();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (ctx) {
            switch (this.particle.particleType) {
                case ParticleType.SHAPE:
                    this.drawShape(ctx);
                    break;
                case ParticleType.EMOJI:
                    this.drawEmoji(ctx);
                    break;
                case ParticleType.IMAGE:
                    this.drawImage(ctx);
                    break;
                case ParticleType.CUSTOM:
                    this.drawCustom(ctx);
                    break;
                default:
                    this.drawCircle(ctx);
                    break;
            }
        }
    }

    private drawShape(ctx: CanvasRenderingContext2D): void {
        switch (this.particle.particleShape) {
            case ParticleShapes.CIRCLE:
                this.drawCircle(ctx);
                break;
            case ParticleShapes.TRIANGLE:
                this.drawPolygon(ctx, 3);
                break;
            case ParticleShapes.SQUARE:
                this.drawPolygon(ctx, 4);
                break;
            case ParticleShapes.POLYGON:
                this.drawPolygon(ctx, this.particle.particleEmitter?.particles!.particleType!.config.shape?.vertices!);
                break;
            default:
                this.drawCircle(ctx);
        }
    }

    drawCircle(ctx: CanvasRenderingContext2D): void {
        const particleColor = this.getParticleColor(this.particle, this.particle.color);
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.particle.x, this.particle.y, this.particle.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawPolygon(ctx: CanvasRenderingContext2D, vertices: number): void {
        const angle = (2 * Math.PI) / vertices;
        const particleColor = this.getParticleColor(this.particle, this.particle.color);
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.moveTo(this.particle.x + this.particle.size * Math.cos(0), this.particle.y + this.particle.size * Math.sin(0));
        for (let i = 1; i < vertices; i++) {
            ctx.lineTo(this.particle.x + this.particle.size * Math.cos(i * angle), this.particle.y + this.particle.size * Math.sin(i * angle));
        }
        ctx.closePath();
        ctx.fill();
    }
    

    drawEmoji(ctx: CanvasRenderingContext2D): void {
        if (this.emojiImage) {
            ctx.drawImage(this.emojiImage, this.particle.x - this.particle.size, this.particle.y - this.particle.size, this.particle.size * 2, this.particle.size * 2);
        }
    }

    drawImage(ctx: CanvasRenderingContext2D): void {
        if (this.particle.image) {
            ctx.drawImage(this.particle.image, this.particle.x - this.particle.size, this.particle.y - this.particle.size, this.particle.size * 2, this.particle.size * 2);
        }
    }

    private drawCustom(ctx: CanvasRenderingContext2D): void {
        switch (this.particle.particleCustom) {
            case ParticleCustoms.BUBBLE:
                this.drawBubble(ctx);
                break;
            default:
                this.drawBubble(ctx);
        }
    }

    drawBubble(ctx: CanvasRenderingContext2D): void {
        if (this.particle.particleCustom) {
            const x = this.particle.x;
            const y = this.particle.y;
            const radius = this.particle.size;
            const color = this.particle.color;
            const lineWidth = this.particle.lineWidth;

            // Use the updated rotation angle from the particle
            const rotation = this.particle.currentRotationAngle;
            const bubblePopped = this.particle._bubblePopped; // Ensure this property exists and is updated as needed

            // Apply rotation
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);

            // Draw main bubble
            if (!bubblePopped) {
                const randomColor = Array.isArray(color)
                    ? color[Math.floor(Math.random() * color.length)]
                    : color;

                ctx.beginPath();
                ctx.strokeStyle = randomColor;
                ctx.lineWidth = lineWidth;
                ctx.arc(0, 0, radius - 8, -Math.PI / 2, 0, false);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
                ctx.stroke();
            }

            ctx.restore();

        }
    }
}
