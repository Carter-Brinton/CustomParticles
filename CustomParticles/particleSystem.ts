import { IMouse, IParticleConfiguration, IParticleEmitter } from "./particleInterfaces";
import { Particle } from "./particle";
import { ParticleEffectsHandler } from "./ParticleHandlers/particleEffectsHandler";
import { ParticleEventsHandler } from "./ParticleHandlers/particleEventsHandler";
import { ParticleCanvasManager } from "./ParticleManagers/ParticleCanvasManager";
import { ParticleConfigurationManager } from "./ParticleManagers/ParticleConfigurationManager";
import { ParticleInteractionManager } from "./ParticleManagers/ParticleInteractionManager";
import { ParticleAnimationManager } from "./ParticleManagers/ParticleAnimationManager";
import { ParticleEmittersHandler } from "./ParticleHandlers/particleEmittersHandler";
import { EmitterPosition } from "./particleEnums";

export class ParticleSystem {
  private _particleCanvasManager: ParticleCanvasManager;
  private _particleConfigurationManager: ParticleConfigurationManager;
  private _particleInteractionManager: ParticleInteractionManager;
  private _particleAnimationManager: ParticleAnimationManager;
  private _particleEmittersHandler: ParticleEmittersHandler;

  private _canvas: HTMLCanvasElement | null = null;
  private _canvasID: string;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _mouse: IMouse | null = null;
  private _particleConfiguration: IParticleConfiguration;
  private _isMousePressed: boolean = false;
  private _mouseIsOverCanvas: boolean = false;
  private _animationFrameId?: number;
  private _effectsHandler?: ParticleEffectsHandler[];
  private _eventsHandler?: ParticleEventsHandler[];
  private _frameCount: any;

  constructor(particleConfiguration: IParticleConfiguration, canvasID: string) {

    this._particleCanvasManager = new ParticleCanvasManager(this);
    this._particleConfigurationManager = new ParticleConfigurationManager(this);
    this._particleInteractionManager = new ParticleInteractionManager(this);
    this._particleAnimationManager = new ParticleAnimationManager(this);
    this._particleEmittersHandler = new ParticleEmittersHandler(this);

    this.destroyExistingParticleSystem(canvasID);
    this._particleConfiguration = particleConfiguration;
    this._canvasID = canvasID;

    this._particleConfigurationManager.getResponsiveConfig();
    this._particleCanvasManager.setupCanvas();

    // Call a separate method to create the defaultParticleEmitter
    this.createDefaultParticleEmitter();

    this.initializeEmitters();
    this._particleInteractionManager.initMouseEvents();
    this._particleConfigurationManager.applyConfiguration();
    this.initializeHandlers();
    requestAnimationFrame(() => this._particleAnimationManager.animate());
  }

  private createDefaultParticleEmitter() {
    if (this._particleConfiguration.particles) {
      const defaultParticleEmitter: IParticleEmitter = {
        enabled: true,
        position: EmitterPosition.FILL,
        allowInteraction: this.checkForInteraction(),
        particles: this._particleConfiguration.particles!,
        emitterSize: {
          width: this.canvas!.width,
          height: this.canvas!.height
        },
        particleRate: {
          delay: -1,
          quantity: -1
        },
        particleLife: {
          duration: -1,
          destroyFade: -1
        },
        animation: {
          playState: "",
          animateLength: -1
        }
      };

      this._particleEmittersHandler.particleEmitters.push(defaultParticleEmitter);
    }
  }


  checkForInteraction(): boolean | undefined {
    // Check if any emitter allows interaction
    const emittersAllowInteraction = this.particleConfiguration.emitters?.some(emitter => emitter.allowInteraction) ?? false;

    // Check if any event is enabled for interaction
    const events = this.particleConfiguration.interactivity?.events;
    const eventsAllowInteraction = events && Object.values(events).some(event => event.enabled);

    return emittersAllowInteraction || eventsAllowInteraction;
  }


  initializeEmitters(): void {
    // Check for additional emitters in the configuration
    const additionalEmitters = this._particleConfiguration.emitters || [];

    for (const emitterConfig of additionalEmitters) {
      this.particleEmittersHandler.particleEmitters.push(emitterConfig);
    }
    this.particleEmittersHandler.start()
  }

  initializeHandlers(): void {
    this.effectsHandler = [];
    this.eventsHandler = [];

    for (const [emitter, particles] of this.particleEmittersHandler.particlesByEmitter) {
      this.effectsHandler.push(new ParticleEffectsHandler(particles, emitter, this, this.ctx!));
      this.eventsHandler.push(new ParticleEventsHandler(particles, emitter, this, this.canvas!.id));
    }
  }

  destroyExistingParticleSystem(canvasID: string): void {
    this.stopAnimations();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    // Destroy mouse events
    this.particleInteractionManager.destroyMouseEvents();

    if (this.effectsHandler) {
      for (const handler of this.effectsHandler) {
        handler.destroy();
      }
    }

    if (this.eventsHandler) {
      for (const handler of this.eventsHandler) {
        handler.destroy();
      }
    }

    // Remove the existing canvas from the DOM
    const existingCanvas = document.getElementById(canvasID);
    if (existingCanvas) {
      existingCanvas.parentElement?.removeChild(existingCanvas);
    }

    // Reset particles and other properties
    this.particleEmittersHandler.particleEmitters = [];
    this.canvas = null;
    this.ctx = null;
    this.mouse = null;

    // Reset handlers
    this.effectsHandler = undefined;
    this.eventsHandler = undefined;
  }

  removeParticle(particle: Particle): void {
    const index = this.particleEmittersHandler.particlesByEmitter.get(particle.particleEmitter!)?.indexOf(particle);
    if (index !== undefined && index > -1) {
      this.particleEmittersHandler.particlesByEmitter.get(particle.particleEmitter!)?.splice(index, 1);
    }
  }

  stopAnimations() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }


  //Getters and Setters
  get particleCanvasManager(): ParticleCanvasManager {
    return this._particleCanvasManager;
  }
  set particleCanvasManager(value: ParticleCanvasManager) {
    this._particleCanvasManager = value;
  }

  get particleConfigurationManager(): ParticleConfigurationManager {
    return this._particleConfigurationManager;
  }
  set particleConfigurationManager(value: ParticleConfigurationManager) {
    this._particleConfigurationManager = value;
  }

  get particleInteractionManager(): ParticleInteractionManager {
    return this._particleInteractionManager;
  }
  set particleInteractionManager(value: ParticleInteractionManager) {
    this._particleInteractionManager = value;
  }

  get particleAnimationManager(): ParticleAnimationManager {
    return this._particleAnimationManager;
  }
  set particleAnimationManager(value: ParticleAnimationManager) {
    this._particleAnimationManager = value;
  }

  get particleEmittersHandler(): ParticleEmittersHandler {
    return this._particleEmittersHandler;
  }
  set particleEmittersHandler(value: ParticleEmittersHandler) {
    this._particleEmittersHandler = value;
  }

  // get particles(): Particle[] {
  //   return this._particles;
  // }
  // set particles(value: Particle[]) {
  //   this._particles = value;
  // }

  get canvas(): HTMLCanvasElement | null {
    return this._canvas;
  }
  set canvas(value: HTMLCanvasElement | null) {
    this._canvas = value;
  }

  get canvasID(): string {
    return this._canvasID;
  }
  set canvasID(value: string) {
    this._canvasID = value;
  }

  get ctx(): CanvasRenderingContext2D | null {
    return this._ctx;
  }
  set ctx(value: CanvasRenderingContext2D | null) {
    this._ctx = value;
  }

  get mouse(): IMouse | null {
    return this._mouse;
  }
  set mouse(value: IMouse | null) {
    this._mouse = value;
  }

  get particleConfiguration(): IParticleConfiguration {
    return this._particleConfiguration;
  }
  set particleConfiguration(value: IParticleConfiguration) {
    this._particleConfiguration = value;
  }

  get isMousePressed(): boolean {
    return this._isMousePressed;
  }
  set isMousePressed(value: boolean) {
    this._isMousePressed = value;
  }

  get mouseIsOverCanvas(): boolean {
    return this._mouseIsOverCanvas;
  }
  set mouseIsOverCanvas(value: boolean) {
    this._mouseIsOverCanvas = value;
  }

  get animationFrameId(): number | undefined {
    return this._animationFrameId;
  }
  set animationFrameId(value: number | undefined) {
    this._animationFrameId = value;
  }

  get effectsHandler(): ParticleEffectsHandler[] | undefined {
    return this._effectsHandler;
  }
  set effectsHandler(value: ParticleEffectsHandler[] | undefined) {
    this._effectsHandler = value;
  }

  get eventsHandler(): ParticleEventsHandler[] | undefined {
    return this._eventsHandler;
  }
  set eventsHandler(value: ParticleEventsHandler[] | undefined) {
    this._eventsHandler = value;
  }

  get frameCount(): any {
    return this._frameCount;
  }
  set frameCount(value: any) {
    this._frameCount = value;
  }
}
