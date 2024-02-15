export enum MoveDirection {
    NONE = 'none',
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
    UP_LEFT = 'up_left',
    UP_RIGHT = 'up_right',
    DOWN_LEFT = 'down_left',
    DOWN_RIGHT = 'down_right',
    RANDOM = 'random'
}

export enum RotationDirection {
    CLOCKWISE = 'clockwise',
    COUNTERCLOCKWISE = 'counterclockwise',
    RANDOM = 'random'
}

export enum TiltDirection {
    LEFT = 'left',
    RIGHT = 'right',
    FORWARD = 'forward', 
    BACKWARD = 'backward',
    RANDOM = 'random'
}


export enum HoverMode {
    connect = 'connect',
}

export enum ClickMode {
    repulse = 'repulse',
    popBubble = 'popBubble',
}

export enum ParticleType {
    SHAPE = 'shape',
    EMOJI = 'emoji',
    IMAGE = 'image',
    CUSTOM = 'custom',
}

export enum ParticleShapes {
    CIRCLE = 'circle',
    TRIANGLE = 'triangle',
    SQUARE = 'square',
    POLYGON = "polygon"
}

export enum ParticleCustoms {
    BUBBLE = 'bubble',
}

export enum EffectType {
    LINKS = 'links',
    TRAILS = 'trails',
}

export enum EmitterPosition {
    FILL = 'fill',
    CENTER = 'center',
    TOP_CENTER = 'top-center',
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    BOTTOM_CENTER = 'bottom-center',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    RIGHT_CENTER = 'right-center',
    LEFT_CENTER = 'left-center',
}

export enum BoundarySide {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    ALL = 'all'
}

export enum ParticleBehavior {
    BOUNCE = 'bounce',
    SPLIT = 'split',
    DESTROY = 'destroy',
    PASS_THROUGH_DESTROY = 'pass-through-DESTORY',
}

export enum MovePathType {
    NOISE = 'noise',
    PREDEFINED = 'predefined',
}

export enum MoveNoisePathType {
    PERLIN = 'perlin',
    SIMPLEX = 'simplex',
}

export enum MovePredefinedPathType {
    CIRCLE = 'circle',
    TRIANGLE = 'triangle',
    SQUARE = 'square',
    POLYGON = 'polygon',
    SINE = 'sine',
}