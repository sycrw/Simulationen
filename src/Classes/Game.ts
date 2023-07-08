import { Action } from "../types";
import { Card } from "./Card";
import { Color } from "../types";
import { Player } from "./Player";

export class Game{
    Players: Player[] = [];
    LayedCards: Card[] = [];
    Deck: Card[] = [];
    
    constructor(playersAmount: number,){
        for(let i = 0; i < playersAmount; i++){
            this.Players.push(new Player(()=>{console.log("taktik")}));
        }
        this.Deck = initializeCards();
        console.log(this.Deck.length);
    }
}


const initializeCards = ():Card[] => {
    let cards: Card[] = [];
    for(let i = 0; i < 4; i++){
        const CardColor = Object.values(Color)[i];
        cards.push(new Card(CardColor, 0, null));
        for(let j = 1; j < 10; j++){
            cards.push(new Card(CardColor, j, null));
            cards.push(new Card(CardColor, j, null));
        }
        cards.push(new Card(CardColor, 10, Action.Skip));
        cards.push(new Card(CardColor, 10, Action.Skip));
        cards.push(new Card(CardColor, 11, Action.Reverse));
        cards.push(new Card(CardColor, 11, Action.Reverse));
        cards.push(new Card(CardColor, 12, Action.DrawTwo));
        cards.push(new Card(CardColor, 12, Action.DrawTwo));
    }
    return cards;
}
