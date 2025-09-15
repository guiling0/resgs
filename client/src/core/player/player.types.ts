export type PlayerId = string;
export type PlayerName = string;

export const enum Phase {
    None = 0,
    Ready,
    Judge,
    Draw,
    Play,
    Drop,
    End,
}
