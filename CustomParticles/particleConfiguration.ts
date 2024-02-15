import { ThemingService } from "../../services/theming.service";
import { BoundarySide, ClickMode, EffectType, EmitterPosition, HoverMode, MoveDirection, ParticleBehavior, ParticleCustoms, ParticleShapes, ParticleType, RotationDirection } from "./particleEnums";
import { IParticleConfiguration } from "./particleInterfaces";

export class ParticleConfiguration {
    themeSelected: boolean = true;
    selectedTheme: string = "";

    constructor(private themeService: ThemingService) {
        this.themeService.initTheme(() => {
            this.initThemeSelected();
        });
    }

    async initThemeSelected() {
        this.selectedTheme = await this.themeService.getSelectedTheme();
    }

    createDashboardParticles(): IParticleConfiguration {
        return this.DashboardParticles;
    }

    createHomeParticles(): IParticleConfiguration {
        return this.HomeParticles;
    }

    DashboardParticles: IParticleConfiguration = {
        fpsLimit: 0,
        overrideDefaultStyle: {
            override: false
        },
        interactivity: {
            scrollOnTouch: true,
            events: {
                onClick: { enabled: true, mode: ClickMode.repulse },
                onHover: { enabled: true, mode: HoverMode.connect },
            },
            eventTypes: {
                repulse: {
                    distance: 75,
                    duration: .4,
                    speed: 4,
                },
                connect: {
                    distance: 100,
                    radius: 75,
                    links: {
                        opacity: 1,
                        width: 1,
                        linkToPointer: true,
                    }
                }
            },
        },
        colorThemes: [
            {
                name: "dark",
                themeSelected: this.themeService.getSelectedTheme() === "dark",
                background: {
                    color: "rgb(40, 40, 40)",
                },
                particles: {
                    color: "#fff",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#fff",
                            },
                        },
                    },
                },
            },
            {
                name: "light",
                themeSelected: this.themeService.getSelectedTheme() === "light",
                background: {
                    color: "rgb(250, 250, 250)",
                },
                particles: {
                    color: "#000",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#000",
                            },
                        },
                    },
                },
            },
        ],
        particles: {
            particleType: {
                type: ParticleType.SHAPE,
                config: {
                    shape: {
                        value: ParticleShapes.CIRCLE
                    },
                },
            },
            totalQuantity: 300,
            color: "", // Using Theme Color
            size: { min: 0.5, max: 1 },
            opacity: 0.5,
            movement: {
                direction: MoveDirection.RANDOM,
                speed: {
                    min: 0.1,
                    max: 0.3
                },
                defaultBoundaryBehavior: ParticleBehavior.BOUNCE,
                // boundary: {
                // size: { width: '50%', height: '50%' },
                // config: [
                //     { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                //     { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                // ]
                // },
            },
            effects: [
                {
                    type: EffectType.LINKS,
                    config: {
                        links: {
                            color: "", // Using Theme Color
                            distance: 125,
                            solid: false,
                            opacity: 1,
                            width: .5,
                        },
                    },
                },
            ],
        },
        responsive: {
            enabled: true,
            breakpoints: [
                {
                    minWidth: 0,
                    maxWidth: 768,
                    config: {
                        fpsLimit: 0,
                        particles: {
                            totalQuantity: 200,
                            size: { min: .5, max: 1.5 },
                            opacity: 0.5,
                            movement: {
                                direction: MoveDirection.RANDOM,
                                speed: {
                                    min: 0.1,
                                    max: 0.5
                                }
                            },
                            effects: [
                                {
                                    type: EffectType.LINKS,
                                    config: {
                                        links: {
                                            color: "", // Using Theme Color
                                            distance: 125,
                                            solid: false,
                                            opacity: 1,
                                            width: .8,
                                        },
                                    },
                                },
                            ],
                        },
                        interactivity: {
                            eventTypes: {
                                repulse: {
                                    distance: 75,
                                    duration: .4,
                                    speed: 4,
                                },
                                connect: {
                                    distance: 150,
                                    radius: 100,
                                    links: {
                                        opacity: 1,
                                        width: 1,
                                        linkToPointer: true,
                                        linkToPointerOffset: { top: 150, bottom: 0, right: 0, left: 0 }
                                    }
                                }
                            },
                        },
                    },
                },
                {
                    minWidth: 769,
                    maxWidth: 1024,
                    config: {},
                },
                {
                    minWidth: 1025,
                    config: {},
                },
            ],
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    HomeParticles: IParticleConfiguration = {
        fpsLimit: 0,
        overrideDefaultStyle: {
            override: true,
            // position: {
            //     position: 'fixed',
            //     top: '25%',
            //     left: '25%',
            // },
            size: {
                width: '100%',
                height: '100%',
            },
            general: {
                zIndex: '-1',
                // margin: 'auto',
                // border: "solid red 1px",
                // borderRadius: "30px"
            },
        },
        interactivity: {
            scrollOnTouch: true,
            events: {
                onClick: { enabled: true, mode: ClickMode.repulse },
                onHover: { enabled: true, mode: HoverMode.connect },
            },
            eventTypes: {
                repulse: {
                    distance: 75,
                    duration: .4,
                    speed: 4,
                },
                connect: {
                    distance: 100,
                    radius: 75,
                    links: {
                        opacity: 1,
                        width: 1,
                        linkToPointer: true,
                    }
                }
            },
        },
        colorThemes: [
            {
                name: "dark",
                themeSelected: this.themeService.getSelectedTheme() === "dark",
                background: {
                    color: "rgb(40, 40, 40)",
                },
                particles: {
                    color: [
                        "#FF6B6B", //Pastel Red
                        "#6B88FF", //Pastel Blue
                        "#FFD166", //Pastel Yellow
                        "#76E8B7", //Pastel Green
                        "#C879E3", //Pastel Purple
                    ],
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#fff",
                            },
                        },
                    },
                },
            },
            {
                name: "light",
                themeSelected: this.themeService.getSelectedTheme() === "light",
                background: {
                    color: "rgb(250, 250, 250)",
                },
                particles: {
                    color: [
                        "#FF6B6B", //Pastel Red
                        "#6B88FF", //Pastel Blue
                        "#FFD166", //Pastel Yellow
                        "#76E8B7", //Pastel Green
                        "#C879E3", //Pastel Purple
                    ],
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#000",
                            },
                        },
                    },
                },
            },
        ],
        particles: {
            particleType: {
                //If Type is of Emoji or Shape, need the option to have multiple of each
                type: ParticleType.SHAPE,
                config: {
                    shape: {
                        value: ParticleShapes.CIRCLE
                    },
                },
            },
            totalQuantity: 300,
            color: "", // Using Theme Color
            size: { min: 3, max: 6 },
            opacity: 0.5,
            movement: {
                direction: MoveDirection.RANDOM,
                speed: {
                    min: 0.1,
                    max: 0.3
                },
                defaultBoundaryBehavior: ParticleBehavior.BOUNCE,
                // boundary: {
                // size: { width: '50%', height: '50%' },
                // config: [
                //     { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                //     { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                // ]
                // },
            },
            effects: [
                {
                    type: EffectType.LINKS,
                    config: {
                        links: {
                            color: "", // Using Theme Color
                            distance: 125,
                            solid: false,
                            opacity: 1,
                            width: .5,
                        },
                    },
                },
            ],
        },
        responsive: {
            enabled: true,
            breakpoints: [
                {
                    minWidth: 0,
                    maxWidth: 768,
                    config: {
                        fpsLimit: 0,
                        particles: {
                            totalQuantity: 200,
                            // size: { min: .5, max: 1.5 },
                            opacity: 0.5,
                            movement: {
                                direction: MoveDirection.RANDOM,
                                speed: {
                                    min: 0.1,
                                    max: 0.5
                                }
                            },
                            effects: [
                                {
                                    type: EffectType.LINKS,
                                    config: {
                                        links: {
                                            color: "", // Using Theme Color
                                            distance: 125,
                                            solid: false,
                                            opacity: 1,
                                            width: .8,
                                        },
                                    },
                                },
                            ],
                        },
                        interactivity: {
                            eventTypes: {
                                repulse: {
                                    distance: 75,
                                    duration: .4,
                                    speed: 4,
                                },
                                connect: {
                                    distance: 150,
                                    radius: 100,
                                    links: {
                                        opacity: 1,
                                        width: 1,
                                        // linkToPointer: false,
                                        // linkToPointerOffset: { top: 150, bottom: 0, right: 0, left: 0 }
                                    }
                                }
                            },
                        },
                    },
                },
                {
                    minWidth: 769,
                    maxWidth: 1024,
                    config: {},
                },
                {
                    minWidth: 1025,
                    config: {},
                },
            ],
        }
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    SizedParticles: IParticleConfiguration = {
        fpsLimit: 0,
        overrideDefaultStyle: {
            override: false,
            position: {
                position: 'fixed',
                top: '25%',
                left: '25%',
            },
            size: {
                width: '50%',
                height: '50%',
            },
            general: {
                zIndex: '-1',
                margin: 'auto',
                border: "solid red 1px",
                borderRadius: "30px"
            },
        },
        interactivity: {
            events: {
                onClick: { enabled: true, mode: ClickMode.repulse },
                onHover: { enabled: true, mode: HoverMode.connect },
            },
            eventTypes: {
                repulse: {
                    distance: 75,
                    duration: .4,
                    speed: 4,
                },
                connect: {
                    distance: 100,
                    links: {
                        opacity: 1,
                        width: 1.2,
                    },
                    radius: 75
                }
            },
        },
        colorThemes: [
            {
                name: "dark",
                themeSelected: this.themeService.getSelectedTheme() === "dark",
                background: {
                    color: "rgb(40, 40, 40)",
                },
                particles: {
                    color: "#fff",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#fff",
                            },
                        },
                    },
                },
            },
            {
                name: "light",
                themeSelected: this.themeService.getSelectedTheme() === "light",
                background: {
                    color: "rgb(250, 250, 250)",
                },
                particles: {
                    color: "#000",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#000",
                            },
                        },
                    },
                },
            },
        ],
        particles: {
            particleType: {
                type: ParticleType.SHAPE,
                config: {
                    shape: {
                        value: ParticleShapes.CIRCLE
                    },
                },
            },
            totalQuantity: 100,
            color: "", // Using Theme Color
            size: { min: 1, max: 1.5 },
            opacity: 0.8,
            movement: {
                direction: MoveDirection.RANDOM,
                speed: {
                    min: 0.1,
                    max: 0.3
                },
                velocityFactor: 1,
                gravity: {
                    enabled: false,
                    acceleration: 0.1,
                    inverse: false
                },
                defaultBoundaryBehavior: ParticleBehavior.BOUNCE,
                boundary: {
                    config: [
                        // { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                        // { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                    ]
                },
            },
            effects: [
                {
                    type: EffectType.LINKS,
                    config: {
                        links: {
                            color: "", // Using Theme Color
                            distance: 125,
                            solid: false,
                            opacity: .5,
                            width: 0.8,
                        },
                    },
                },
            ],
        },
        emitters: [
            {
                enabled: true,
                position: EmitterPosition.RIGHT_CENTER,
                emitterSize: {
                    width: 0,
                    height: 100
                },
                particleRate: {
                    delay: .5,
                    quantity: 1
                },
                particleLife: {
                    duration: 10,
                    destroyFade: 1
                },
                animation: {
                    playState: 'play',
                    animateLength: 15,
                    replay: false
                },
                allowInteraction: false,
                particles: {
                    particleType: {
                        type: ParticleType.SHAPE,
                        config: {
                            shape: {
                                value: ParticleShapes.CIRCLE
                            },
                        },
                    },
                    totalQuantity: 100,
                    color: "red",
                    size: { min: 5, max: 10 },
                    opacity: 0.5,
                    movement: {
                        direction: MoveDirection.LEFT,
                        speed: {
                            min: 0.1,
                            max: 0.3
                        },
                        velocityFactor: 1,
                        gravity: {
                            enabled: false,
                            acceleration: 0.1,
                            inverse: false
                        },
                        defaultBoundaryBehavior: ParticleBehavior.DESTROY,
                        boundary: {
                            config: [
                                // { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                                // { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                            ]
                        },

                    },
                }
            },
            {
                enabled: true,
                position: EmitterPosition.TOP_CENTER,
                emitterSize: {
                    width: 100,
                    height: 0
                },
                particleRate: {
                    delay: 1,
                    quantity: 1
                },
                particleLife: {
                    duration: 10,
                    destroyFade: 0.1
                },
                animation: {
                    playState: 'play',
                    animateLength: 15,
                    replay: false
                },
                allowInteraction: true,
                particles: {
                    particleType: {
                        type: ParticleType.SHAPE,
                        config: {
                            shape: {
                                value: ParticleShapes.CIRCLE
                            },
                        },
                    },
                    totalQuantity: 100,
                    color: "",
                    size: { min: 5, max: 10 },
                    opacity: 0.5,
                    movement: {
                        direction: MoveDirection.DOWN,
                        speed: {
                            min: 0.1,
                            max: 0.3
                        },
                        velocityFactor: 1,
                        gravity: {
                            enabled: false,
                            acceleration: 0.1,
                            inverse: false
                        },
                        defaultBoundaryBehavior: ParticleBehavior.BOUNCE,
                        boundary: {
                            config: [
                                // { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                                // { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                            ]
                        },

                    },
                }
            },
        ],

        responsive: {
            enabled: true,
            breakpoints: [
                {
                    minWidth: 0,
                    maxWidth: 768,
                    config: {
                        fpsLimit: 0,
                        particles: {
                            totalQuantity: 100,
                            size: { min: .5, max: 1 },
                            opacity: 0.5,
                            movement: {
                                direction: MoveDirection.RANDOM,
                                speed: {
                                    min: 0.1,
                                    max: 0.5
                                }
                            },
                        },
                        interactivity: {
                            eventTypes: {
                                repulse: {
                                    distance: 75,
                                    duration: .4,
                                    speed: 2,
                                },
                            },
                        },
                    },
                },
                {
                    minWidth: 769,
                    maxWidth: 1024,
                    config: {},
                },
                {
                    minWidth: 1025,
                    config: {},
                },
            ],
        }
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    BubbleParticles: IParticleConfiguration = {
        fpsLimit: 0,
        colorThemes: [
            {
                name: "dark",
                themeSelected: this.themeService.getSelectedTheme() === "dark",
                background: {
                    color: "rgb(40, 40, 40)",
                },
                particles: {
                    color: "#fff",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#fff",
                            },
                        },
                    },
                },
            },
            {
                name: "light",
                themeSelected: this.themeService.getSelectedTheme() === "light",
                background: {
                    color: "rgb(250, 250, 250)",
                },
                particles: {
                    color: "#000",
                    effects: {
                        type: EffectType.LINKS,
                        config: {
                            links: {
                                color: "#000",
                            },
                        },
                    },
                },
            },
        ],
        interactivity: {
            events: {
                onClick: { enabled: true, mode: ClickMode.popBubble },
                // onHover: { enabled: true, mode: HoverMode.connect },
            },
            eventTypes: {
                bubble: {
                    popDistance: 150,
                    duration: .4,
                    speed: 1,
                },
                // connect: {
                //     distance: 100,
                //     links: {
                //         opacity: 1,
                //         width: 1,
                //     },
                //     radius: 75
                // }
            },
        },
        emitters: [
            {
                enabled: true,
                position: EmitterPosition.BOTTOM_CENTER,
                emitterSize: {
                    width: 100,
                    height: 0
                },
                particleRate: {
                    delay: 1.5,
                    quantity: 2
                },
                particleLife: {
                    duration: 9999,
                    destroyFade: 1
                },
                animation: {
                    playState: 'play',
                    animateLength: 99999,
                    replay: false
                },
                allowInteraction: true,
                particles: {
                    particleType: {
                        type: ParticleType.CUSTOM,
                        config: {
                            custom: {
                                value: ParticleCustoms.BUBBLE,
                                canPop: true
                            }
                        },
                    },
                    rotation: {
                        minAngle: 0,
                        maxAngle: 180,
                        animation: {
                            direction: RotationDirection.CLOCKWISE,
                            speed: { min: .2, max: 1 }
                        }
                    },
                    totalQuantity: 200,
                    color: "",
                    size: { min: 50, max: 100, lineWidth: 1 },
                    opacity: 0.5,
                    movement: {
                        direction: MoveDirection.UP,
                        speed: {
                            min: 1,
                            max: 2
                        },
                        velocityFactor: 1,
                        gravity: {
                            enabled: false,
                            acceleration: 0.1,
                            inverse: false
                        },
                        defaultBoundaryBehavior: ParticleBehavior.PASS_THROUGH_DESTROY,
                        boundary: {
                            config: [
                                // { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                                // { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                            ]
                        },

                    },
                }
            }
        ],

        responsive: {
            enabled: false,
            breakpoints: [
                {
                    minWidth: 0,
                    maxWidth: 768,
                    config: {
                        fpsLimit: 0,
                        emitters: [
                            {
                                enabled: true,
                                position: EmitterPosition.BOTTOM_CENTER,
                                emitterSize: {
                                    width: 100,
                                    height: 0
                                },
                                particleRate: {
                                    delay: 1.5,
                                    quantity: 2
                                },
                                particleLife: {
                                    duration: 9999,
                                    destroyFade: 1
                                },
                                animation: {
                                    playState: 'play',
                                    animateLength: 99999,
                                    replay: false
                                },
                                allowInteraction: false,
                                particles: {
                                    particleType: {
                                        type: ParticleType.SHAPE,
                                        config: {
                                            shape: {
                                                value: ParticleShapes.CIRCLE
                                            },
                                        },
                                    },
                                    totalQuantity: 200,
                                    color: "red",
                                    size: { min: 25, max: 50 },
                                    opacity: 0.5,
                                    movement: {
                                        direction: MoveDirection.UP,
                                        speed: {
                                            min: 0.5,
                                            max: 1
                                        },
                                        velocityFactor: 1,
                                        gravity: {
                                            enabled: false,
                                            acceleration: 0.1,
                                            inverse: false
                                        },
                                        defaultBoundaryBehavior: ParticleBehavior.DESTROY,
                                        boundary: {
                                            config: [
                                                // { side: BoundarySide.TOP, behavior: ParticleBehavior.DESTROY },
                                                // { side: BoundarySide.BOTTOM, behavior: ParticleBehavior.DESTROY }
                                            ]
                                        },

                                    },
                                }
                            }
                        ],
                        // particles: {
                        //     totalQuantity: 100,
                        //     size: { min: .5, max: 1 },
                        //     opacity: 0.5,
                        //     movement: {
                        //         direction: MoveDirection.RANDOM,
                        //         speed: {
                        //             min: 0.1,
                        //             max: 0.5
                        //         }
                        //     },
                        // },
                        // interactivity: {
                        //     eventTypes: {
                        //         repulse: {
                        //             distance: 75,
                        //             duration: .4,
                        //             speed: 2,
                        //         },
                        //     },
                        // },
                    },
                },
                {
                    minWidth: 769,
                    maxWidth: 1024,
                    config: {},
                },
                {
                    minWidth: 1025,
                    config: {},
                },
            ],
        }
    };

}
