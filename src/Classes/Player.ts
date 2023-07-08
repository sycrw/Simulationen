import { Card } from "./Card";

export class Player {
    calculateMove: () => void;
    // a function that the player uses to calculate their next move
    Cards: Card[] = [];

    constructor(calculateMove: () => void){
        this.calculateMove = calculateMove;
        console.log("Player created");
    }
}