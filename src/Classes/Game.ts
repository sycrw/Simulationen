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
        this.Deck = shuffle(this.Deck);
        this.Players = initializePlayers(playersAmount, this.Deck);
        this.LayedCards.push(this.Deck.pop()!);
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
    for(let i = 0; i < 4; i++){
        cards.push(new Card(null, 13, Action.Wild));
        cards.push(new Card(null, 14, Action.DrawFour));
    }
    return cards;
}

const shuffle = (array: Card[]): Card[] => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const initializePlayers = (playersAmount: number,Deck: Card[]): Player[] => {
    let players: Player[] = [];
    if(playersAmount < 2 || playersAmount > Deck.length/7){
        throw new Error("Invalid amount of players");
    }
    for(let i = 0; i < playersAmount; i++){
        players.push(new Player(()=>{console.log("taktik")}));
        // give players cards
        for(let j = 0; j < 7; j++){
            players[i].Cards.push(Deck.pop()!);
        }
    }
    return players;
}