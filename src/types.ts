import { Card } from "./Classes/Card";

export enum Color {
    Red = "Red",
    Green = "Green",
    Blue = "Blue",
    Yellow = "Yellow"
}
 
export enum Action {
    Skip = "Skip",
    Reverse = "Reverse",
    DrawTwo = "DrawTwo",
    DrawFour = "DrawFour",
    Wild = "Wild"
}

export type Tactic = (playerCards:Card[],LayedCards:Card[]) => number|null;