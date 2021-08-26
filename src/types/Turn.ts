export enum Phase {
    Pregame = "pregame",
    Preround = "preround",
    Postgame = "postgame",
    Wait = "wait",
    Play = "play",
    Discard = "discard",
    Think = "think",
};

export interface Turn {
    player: number;
    phase: Phase;
};
