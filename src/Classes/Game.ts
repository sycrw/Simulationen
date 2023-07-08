import { Player } from "./Player";

export class Game{
    Players: Player[] = [];
    constructor(playersAmount: number,){
        for(let i = 0; i < playersAmount; i++){
            this.Players.push(new Player(()=>{console.log("taktik")}));
        }
    }
}