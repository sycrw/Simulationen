import { Card } from "./Classes/Card";

export enum Color {
    Red = "Red",
    Green = "Green",
    Blue = "Blue",
    Yellow = "Yellow",
    Any = "Any"
}
export const numToColor = (num:number):Color => {
    switch(num){
        case 0:
            return Color.Red;
        case 1:
            return Color.Green;
        case 2:
            return Color.Blue;
        case 3:
            return Color.Yellow;
        case 4:
            return Color.Any;
        default:
            throw new Error("Invalid color number");
    }
}

 
export enum Action {
    Skip = "Skip",
    Reverse = "Reverse",
    DrawTwo = "DrawTwo",
    DrawFour = "DrawFour",
    Wild = "Wild"
}

export type Tactic = (playerCards:Card[],LayedCards:Card[],requirements:string[]) => number|null;