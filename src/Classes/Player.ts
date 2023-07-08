import { Card } from "./Card";
import { Tactic } from "../types";

export class Player {
    calculateMove: Tactic;
    // a function that the player uses to calculate their next move
    Cards: Card[] = [];

    constructor(calculateMove: Tactic){
        this.calculateMove = calculateMove;
    }
}