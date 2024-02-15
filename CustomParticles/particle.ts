import { ParticleDrawHandler } from "./ParticleHandlers/particleDrawHandler";
import { ParticleBoundaryManager } from "./ParticleManagers/ParticleBoundaryManager";
import { ParticleMovementManager } from "./ParticleManagers/ParticleMovementManager";
import { ParticleUtilityManager } from "./ParticleManagers/ParticleUtilityManager";
import { ParticleColorService } from "./ParticleServices/particleColorService";
import { ParticleType, ParticleShapes, ParticleCustoms, RotationDirection, TiltDirection } from "./particleEnums";
import { IParticleConfiguration, IParticleEmitter, IParticles, IParticleRotation } from "./particleInterfaces";
import { ParticleSystem } from "./particleSystem";

export class Particle {
  private _ID: string;
  private _x: number;
  private _y: number;
  private _speedX: number;
  private _speedY: number;
  private _size: number;
  private _lineWidth: number;
  private _color: string | string[];
  private _age: number;
  private _currentRotationAngle: number;
  private _currentRotationDirection: RotationDirection | undefined;
  private _particleRotation: IParticleRotation | null;
  private _particleTilt: IParticleRotation | null;
  private _originalSize: number;
  private _opacity: number;
  private _canvas: HTMLCanvasElement;
  private _particleConfiguration: IParticleConfiguration;
  private _movementBehavior: IParticles['movement'];
  private _particleSystem: ParticleSystem;
  private _particleType: ParticleType;
  private _particleCustom: ParticleCustoms | null;
  private _particleShape: ParticleShapes | null;
  private _emoji: string | null;
  private _image: HTMLImageElement | null;
  private _gravity: { enabled: boolean; acceleration: number; inverse: boolean; };
  private _velocityFactor: number | null;
  private _particleUtilityManager: ParticleUtilityManager;
  private _particleMovementManager: ParticleMovementManager;
  private _particleBoundaryManager: ParticleBoundaryManager;
  private _drawHandler: ParticleDrawHandler;
  private _particleEmitter?: IParticleEmitter;
  public rotationChangeThreshold: number = 0;
  public _bubblePopped: boolean = false;

  constructor(x: number, y: number, size: number, color: string | string[], canvas: HTMLCanvasElement, particleSystem: ParticleSystem, particleEmitter?: IParticleEmitter) {
    const particlesConfig = particleEmitter ? particleEmitter.particles : particleSystem.particleConfiguration.particles;
    this._ID = this.generateUniqueId();
    this._x = x;
    this._y = y;
    this._speedX = 0;
    this._speedY = 0;
    this._size = size;
    this._lineWidth = particlesConfig?.size?.lineWidth || 1;
    this._color = color;
    this._particleEmitter = particleEmitter;
    this._age = 0;
    this._opacity = particlesConfig?.opacity || 1;
    this._originalSize = this._size;
    this._canvas = canvas;
    this._particleConfiguration = particleSystem.particleConfiguration;
    this._movementBehavior = particlesConfig?.movement;
    this._particleSystem = particleSystem;
    this._particleType = particlesConfig?.particleType?.type || ParticleType.SHAPE;
    this._particleShape = null;
    this._particleCustom = null;
    this._particleRotation = this.particleEmitter?.particles!.rotation || null;
    this._currentRotationAngle = this.particleRotation?.minAngle! + Math.random() * this.particleRotation?.maxAngle! - this.particleRotation?.minAngle!;
    this._particleTilt = null;
    this._emoji = null;
    this._image = null;
    this._gravity = particlesConfig?.movement?.gravity || { enabled: false, acceleration: 0, inverse: false };
    this._velocityFactor = particlesConfig?.movement?.velocityFactor || 0;
    this._particleUtilityManager = new ParticleUtilityManager(this);
    this._particleBoundaryManager = new ParticleBoundaryManager(this);
    this._particleMovementManager = new ParticleMovementManager(this, particlesConfig!.movement!.direction, particlesConfig!.movement!.speed);

    this._drawHandler = new ParticleDrawHandler(this);
  }

  generateUniqueId() {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000); // Add randomness to avoid collisions
    return `${timestamp}-${randomPart}`;
  }

  update(deltaTime: number): void {
    this.particleUtilityManager.applyGravityAndDecay();

    this.particleMovementManager.applyMovementBehavior();

    this.age += deltaTime;
    if (this.particleEmitter!.particleLife.destroyFade > 0) {
      this.updateOpacity();
    }
  }

  private updateOpacity(): void {
    const fadeStart = this.particleEmitter!.particleLife.duration - this.particleEmitter!.particleLife.destroyFade;
    if (this.age > fadeStart) {
      const fadeProgress = (this.age - fadeStart) / this.particleEmitter!.particleLife.destroyFade;
      this.opacity = Math.max(0, 1 - fadeProgress);

      const colorService = new ParticleColorService();

      if (typeof this.color === 'string') {
        // If this.color is a string, update it directly
        this.color = colorService.updateParticleOpacity(this.color, this.opacity);
      } else if (Array.isArray(this.color)) {
        // If this.color is an array, update each color in the array separately
        for (let i = 0; i < this.color.length; i++) {
          this.color[i] = colorService.updateParticleOpacity(this.color[i], this.opacity);
        }
      }
    }
  }


  draw(ctx: CanvasRenderingContext2D): void {
    this.drawHandler.draw(ctx);
  }

  reset(): void {
    //Reset Particle TODO
  }

  destroy() {
    this.particleSystem.removeParticle(this);
  }

  passThroughDestroy() {
    setTimeout(() => {
      this.destroy();
    }, 2000);
  }

  shouldDestroy(lifeDuration?: number) {
    if (lifeDuration) {
      return this.age > lifeDuration;
    }
    return undefined;
  }

  // Getters and setters for all properties

  public get ID(): string {
    return this._ID;
  }
  public set ID(value: string) {
    this._ID = value;
  }

  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = value;
  }

  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = value;
  }

  get speedX(): number {
    return this._speedX;
  }
  set speedX(value: number) {
    this._speedX = value;
  }

  get speedY(): number {
    return this._speedY;
  }
  set speedY(value: number) {
    this._speedY = value;
  }

  get size(): number {
    return this._size;
  }
  set size(value: number) {
    this._size = value;
  }

  public get lineWidth(): number {
    return this._lineWidth;
  }
  public set lineWidth(value: number) {
    this._lineWidth = value;
  }

  get color(): string | string[] {
    return this._color;
  }
  set color(value: string | string[]) {
    this._color = value;
  }

  public get opacity(): number {
    return this._opacity;
  }
  public set opacity(value: number) {
    this._opacity = value;
  }

  public get age(): number {
    return this._age;
  }
  public set age(value: number) {
    this._age = value;
  }

  get originalSize(): number {
    return this._originalSize;
  }
  set originalSize(value: number) {
    this._originalSize = value;
  }

  public get currentRotationAngle(): number {
    return this._currentRotationAngle;
  }
  public set currentRotationAngle(value: number) {
    this._currentRotationAngle = value;
  }

  public get currentRotationDirection(): RotationDirection | undefined {
    return this._currentRotationDirection;
  }
  public set currentRotationDirection(value: RotationDirection) {
    this._currentRotationDirection = value;
  }

  public get particleRotation(): IParticleRotation | null {
    return this._particleRotation;
  }
  public set particleRotation(value: IParticleRotation) {
    this._particleRotation = value;
  }

  public get particleTilt(): IParticleRotation | null {
    return this._particleTilt;
  }
  public set particleTilt(value: IParticleRotation) {
    this._particleTilt = value;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  set canvas(value: HTMLCanvasElement) {
    this._canvas = value;
  }

  get particleConfiguration(): IParticleConfiguration {
    return this._particleConfiguration;
  }
  set particleConfiguration(value: IParticleConfiguration) {
    this._particleConfiguration = value;
  }

  get movementBehavior(): IParticles['movement'] {
    return this._movementBehavior;
  }
  set movementBehavior(value: IParticles['movement']) {
    this._movementBehavior = value;
  }

  get particleSystem(): ParticleSystem {
    return this._particleSystem;
  }
  set particleSystem(value: ParticleSystem) {
    this._particleSystem = value;
  }

  get particleType(): ParticleType {
    return this._particleType;
  }
  set particleType(value: ParticleType) {
    this._particleType = value;
  }

  public get particleCustom(): ParticleCustoms | null {
    return this._particleCustom;
  }
  public set particleCustom(value: ParticleCustoms | null) {
    this._particleCustom = value;
  }

  get particleShape(): ParticleShapes | null {
    return this._particleShape;
  }
  set particleShape(value: ParticleShapes | null) {
    this._particleShape = value;
  }

  get emoji(): string | null {
    return this._emoji;
  }
  set emoji(value: string | null) {
    this._emoji = value;
  }

  get image(): HTMLImageElement | null {
    return this._image;
  }
  set image(value: HTMLImageElement | null) {
    this._image = value;
  }

  get gravity(): { enabled: boolean; acceleration: number; inverse: boolean; } {
    return this._gravity;
  }
  set gravity(value: { enabled: boolean; acceleration: number; inverse: boolean; }) {
    this._gravity = value;
  }

  get velocityFactor(): number | null {
    return this._velocityFactor;
  }
  set velocityFactor(value: number | null) {
    this._velocityFactor = value;
  }

  get particleUtilityManager(): ParticleUtilityManager {
    return this._particleUtilityManager;
  }
  set particleUtilityManager(value: ParticleUtilityManager) {
    this._particleUtilityManager = value;
  }

  get particleMovementManager(): ParticleMovementManager {
    return this._particleMovementManager;
  }
  set particleMovementManager(value: ParticleMovementManager) {
    this._particleMovementManager = value;
  }

  get particleBoundaryManager(): ParticleBoundaryManager {
    return this._particleBoundaryManager;
  }
  set particleBoundaryManager(value: ParticleBoundaryManager) {
    this._particleBoundaryManager = value;
  }

  public get particleEmitter(): IParticleEmitter | undefined {
    return this._particleEmitter;
  }
  public set particleEmitter(value: IParticleEmitter | undefined) {
    this._particleEmitter = value;
  }

  get drawHandler(): ParticleDrawHandler {
    return this._drawHandler;
  }
  set drawHandler(value: ParticleDrawHandler) {
    this._drawHandler = value;
  }
}