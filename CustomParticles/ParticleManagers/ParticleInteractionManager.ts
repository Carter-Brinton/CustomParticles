import { ClickMode } from "../particleEnums";
import { ParticleSystem } from "../particleSystem";

export class ParticleInteractionManager {
    private particleSystem: ParticleSystem;

    constructor(particleSystem: ParticleSystem) {
        this.particleSystem = particleSystem;
    }

    initMouseEvents() {
        // Initialize mouse events
        document.addEventListener('mouseenter', this.handleMouseEnter);
        document.addEventListener('mouseleave', this.handleMouseLeave);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);

        document.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('touchmove', this.handleTouchMove, {
            passive: this.particleSystem.particleConfiguration.interactivity?.scrollOnTouch ? true : false
        });

        if (!(/Mobi|Android/i.test(navigator.userAgent)) && window.innerWidth >= 768) {
            // Add the resize event listener if not on a mobile device and screen width is at least 768px
            window.addEventListener('resize', this.handleWindowResize);
        }

    }

    destroyMouseEvents() {
        // Destroy mouse events
        document.removeEventListener('mouseenter', this.handleMouseEnter);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);

        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchmove', this.handleTouchMove);

        window.removeEventListener('resize', this.handleWindowResize);
    }

    handleWindowResize = (event: UIEvent) => {
        this.particleSystem.particleCanvasManager.setupCanvas();
    };


    handleMouseEnter = (event: MouseEvent) => {
        this.particleSystem.mouseIsOverCanvas = true;
    };

    handleMouseLeave = (event: MouseEvent) => {
        this.particleSystem.mouseIsOverCanvas = false;
    };

    private handleMouseMove = (event: MouseEvent) => {
        const rect = this.particleSystem.canvas!.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        const x = (event.clientX - rect.left) * pixelRatio;
        const y = (event.clientY - rect.top) * pixelRatio;

        if (x >= 0 && x <= this.particleSystem.canvas!.width && y >= 0 && y <= this.particleSystem.canvas!.height) {
            this.particleSystem.mouse!.x = x;
            this.particleSystem.mouse!.y = y;
            this.particleSystem.mouseIsOverCanvas = true;
        } else {
            this.particleSystem.mouseIsOverCanvas = false;
        }
    };

    private handleTouchMove = (event: TouchEvent) => {
        event.preventDefault();

        const touch = event.touches[0];
        const rect = this.particleSystem.canvas!.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        const x = (touch.clientX - rect.left) * pixelRatio;
        const y = (touch.clientY - rect.top) * pixelRatio;

        if (x >= 0 && x <= this.particleSystem.canvas!.width && y >= 0 && y <= this.particleSystem.canvas!.height) {
            this.particleSystem.mouse!.x = x;
            this.particleSystem.mouse!.y = y;
            this.particleSystem.mouseIsOverCanvas = true;
        } else {
            this.particleSystem.mouseIsOverCanvas = false;
        }
    };

    handleMouseDown = (event: MouseEvent) => {
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        if (!elemBelow || !['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(elemBelow.tagName)) {
            this.particleSystem.isMousePressed = true;
            if (this.particleSystem.particleConfiguration.interactivity?.events?.onClick?.enabled) {
                const onClickMode = this.particleSystem.particleConfiguration.interactivity.events.onClick?.mode;

                switch (onClickMode) {
                    case ClickMode.repulse:
                        if (this.particleSystem.eventsHandler) {
                            for (const handler of this.particleSystem.eventsHandler) {
                                handler.applyRepulsion(event);
                            }
                        }
                        break;
                    case ClickMode.popBubble:
                        if (this.particleSystem.eventsHandler) {
                            for (const handler of this.particleSystem.eventsHandler) {
                                handler.popBubble(event, this.particleSystem.ctx!);
                            }
                        }
                        break;
                    default:
                        // Handle the default case or do nothing
                        break;
                }
            }
        }
    };

    handleMouseUp = (event: MouseEvent) => {
        this.particleSystem.isMousePressed = false;

        setTimeout(() => {
            this.particleSystem.mouseIsOverCanvas = false;
        }, 100);
    };

    handleTouchEnd = (event: TouchEvent) => {
        this.particleSystem.isMousePressed = false;

        setTimeout(() => {
            this.particleSystem.mouseIsOverCanvas = false;
        }, 100);
    };

}