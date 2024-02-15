import { BoundarySide, ClickMode, EffectType, EmitterPosition, HoverMode, MoveDirection, MoveNoisePathType, MovePathType, MovePredefinedPathType, ParticleBehavior, ParticleCustoms, ParticleShapes, ParticleType, RotationDirection } from "./particleEnums";

export interface IParticleConfiguration {
    fpsLimit?: number;
    interactivity?: IInteractivity;
    colorThemes?: IColorTheme[];
    particles?: IParticles;
    emitters?: IParticleEmitter[];
    overrideDefaultStyle?: IOverrideStyle;
    responsive?: IParticleResponsiveConfig;
}

export interface IOverrideStyle {
    override: boolean;
    position?: ICanvasPosition;
    size?: ICanvasSize;
    general?: ICanvasGeneralStyle;
}

export interface ICanvasPosition {
    position: 'absolute' | 'fixed' | 'relative' | 'static';
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export interface ICanvasSize {
    width: string;
    height: string;
    maxWidth?: string;
    maxHeight?: string;
}

export interface ICanvasGeneralStyle {
    zIndex?: string;
    margin?: string;
    padding?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    backgroundColor?: string;
    opacity?: string;
    cursor?: 'pointer' | 'default' | 'move' | 'wait';
    visibility?: 'visible' | 'hidden' | 'collapse';
    display?: 'block' | 'inline-block' | 'flex' | 'none';
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    userSelect?: 'none' | 'auto' | 'text' | 'contain' | 'all';
    transform?: string;
    transition?: string;
    filter?: string;
    pointerEvents?: 'auto' | 'none';
}

export interface IInteractivity {
    scrollOnTouch?: boolean;
    events?: {
        onClick?: { enabled: boolean; mode: ClickMode };
        onHover?: { enabled: boolean; mode: HoverMode };
    };
    eventTypes?: {
        bubble?: { popDistance: number; duration: number; speed: number; };
        push?: { quantity: number };
        repulse?: { distance: number; duration: number; speed: number; };
        connect?: {
            distance: number;
            radius: number
            links: {
                opacity: number; width: number; linkToPointer?: boolean;
                linkToPointerOffset?: { top?: number; bottom?: number; right?: number; left?: number; }
            };
        };
    };
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IMouse extends IPoint {
    isDown: boolean;
}

export interface IColorTheme {
    name: string;
    themeSelected: boolean;
    background: { color: string };
    particles: {
        color: string | string[];
        effects?: {
            type: EffectType;
            config: IEffectTypeConfig[keyof IEffectTypeConfig];
        };
    };
}

export interface IParticles {
    particleType?: {
        type: ParticleType,
        config: IParticleTypeConfig[keyof IParticleTypeConfig];
    };
    totalQuantity?: number;
    color?: string | string[];
    size?: {
        min: number;
        max: number;
        lineWidth?: number;
    };
    opacity?: number;
    movement?: {
        speed: { min: number; max: number; };
        direction: MoveDirection;
        gravity?: { enabled: boolean; acceleration: number; inverse: boolean; }
        velocityFactor?: number;
        defaultBoundaryBehavior?: ParticleBehavior;
        boundary?: IBoundaryConfig;
        path?: IMovePath;
    };
    rotation?: IParticleRotation
    tilt?: {
        min: number;
        max: number;
        animation?: {
            direction: RotationDirection;
            speed: { min: number; max: number };
        };
    };
    effects?: {
        type: EffectType
        config: IEffectTypeConfig[keyof IEffectTypeConfig];
    }[];
}

export interface IParticleRotation {
    minAngle: number;
    maxAngle: number;
    animation?: {
        direction: RotationDirection;
        speed: { min: number; max: number };
    };
}

export interface IBoundaryConfig {
    size?: IBoundarySize;
    config: Array<{ side: BoundarySide, behavior: ParticleBehavior }>;
}

export interface IBoundarySize {
    width: string;
    height: string;
}

export interface IParticleTypeConfig {
    [particleType: string]: {
        shape?: {
            value: ParticleShapes | ParticleShapes.POLYGON,
            vertices?: number;
        };
        emoji?: string;
        image?: {
            src?: string;
            width?: number;
            height?: number;
        };
        custom?: {
            value: ParticleCustoms | ParticleCustoms.BUBBLE,
            canPop?: boolean;
        };
    };
}

export interface IEffectTypeConfig {
    [effectType: string]: {
        links?: {
            color?: string | string[];
            distance?: number;
            solid?: boolean;
            opacity?: number;
            width?: number;
        };
        trails?: {
            fade?: boolean;
            length?: {
                min: number;
                max: number;
            };
        };
    };
}

export interface IParticleEmitter {
    enabled: boolean;
    position: IPoint | EmitterPosition;
    particles: IParticles;
    allowInteraction?: boolean;
    emitterSize: {
        width: number;
        height: number;
    };
    particleRate: {
        delay: number;
        quantity: number;
    };
    particleLife: {
        duration: number;
        destroyFade: number;
    };
    animation: {
        playState: '' | 'play' | 'pause' | 'stop';
        animateLength: number;
        replay?: boolean
    };
    // onParticleSpawn?: (particle: IParticle) => void; // Callback when a particle is spawned
    // onParticleDestroy?: (particle: IParticle) => void; // Callback when a particle is destroyed
}



export interface IParticleResponsiveConfig {
    enabled: boolean;
    breakpoints: IResponsiveSetting[];
}

export interface IResponsiveSetting {
    minWidth: number;
    maxWidth?: number;
    config: Partial<IParticleConfiguration>
}

export interface IMovePath {
    enabled: boolean;
    type: MovePathType // to differentiate between noise-generated paths and predefined paths
    config: INoisePathConfig | IPredefinedPathConfig;
}

export interface INoisePathConfig {
    generator: MoveNoisePathType // specify the type of noise
    scale: number; // how zoomed in/out the noise is
    speed: number; // how fast the particle follows the noise path
}

export interface IPredefinedPathConfig {
    pathType: MovePredefinedPathType // type of predefined path or custom for user-defined function
    details: IPathDetails; // details specific to the path type
    increment: number;
}

export interface IPathDetails {
    // For 'circle'
    radius?: number;

    // For 'sine'
    amplitude?: number;
    frequency?: number;

    // For 'custom'
    customFunction?: (x: number, y: number, t: number) => { x: number; y: number }; // a function defining the path
}