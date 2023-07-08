export class Player {
    calculateMove: () => void;
    // a function that the player uses to calculate their next move

    constructor(calculateMove: () => void){
        this.calculateMove = calculateMove;
        console.log("Player created");
    }
}