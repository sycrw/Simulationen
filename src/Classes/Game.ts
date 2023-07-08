import { Action, Tactic } from "../types";

import { Card } from "./Card";
import { Color } from "../types";
import { Player } from "./Player";

export class Game{
    Players: Player[] = [];
    LayedCards: Card[] = [];
    Deck: Card[] = [];
    winner: number|null = null;
    
    constructor(playersAmount: number, tactics: ((playerCards:Card[],LayedCards:Card[]) => number|null)[]){
        for(let i = 0; i < playersAmount; i++){
            this.Players.push(new Player(tactics[i]));
        }
        this.Deck = this.initializeCards();
        this.Deck = this.shuffle(this.Deck);
        this.Players = this.initializePlayers(playersAmount, this.Deck, tactics);
        while(this.Deck[this.Deck.length-1].action != null){
            this.Deck = this.shuffle(this.Deck);
        }
        this.LayedCards.push(this.Deck.pop()!);
        this.winner = this.playGame();
    }

    playGame(): number|null{
        let round = 0;
        while(!this.checkWin(this.Players)){
            for(let i = 0; i < this.Players.length; i++){
                const cardIndex = this.Players[i].calculateMove(this.Players[i].Cards, this.LayedCards);
                if(cardIndex == null){
                    this.Players[i].Cards.push(this.Deck.pop()!);
                } else {
                    this.LayedCards.push(this.Players[i].Cards[cardIndex]);
                    this.Players[i].Cards.splice(cardIndex, 1);
                }
                if(this.checkWin(this.Players)){
                    console.log("Player " + (i+1) + " won!");
                    return i;
                }
            }
            round++;
        }
        return null;
}



checkWin = (players: Player[]): boolean => {
    for(let i = 0; i < players.length; i++){
        if(players[i].Cards.length == 0){
            return true;
        }
    }
    return false;
}

initializeCards = ():Card[] => {
    let cards: Card[] = [];
    for(let i = 0; i < 4; i++){
        const CardColor = Object.values(Color)[i];
        cards.push(new Card(CardColor, 0, null));
        for(let j = 1; j < 10; j++){
            cards.push(new Card(CardColor, j, null));
            cards.push(new Card(CardColor, j, null));
        }
    //     cards.push(new Card(CardColor, 10, Action.Skip));
    //     cards.push(new Card(CardColor, 10, Action.Skip));
    //     cards.push(new Card(CardColor, 11, Action.Reverse));
    //     cards.push(new Card(CardColor, 11, Action.Reverse));
    //     cards.push(new Card(CardColor, 12, Action.DrawTwo));
    //     cards.push(new Card(CardColor, 12, Action.DrawTwo));
    // }
    // for(let i = 0; i < 4; i++){
    //     cards.push(new Card(null, 13, Action.Wild));
    //     cards.push(new Card(null, 14, Action.DrawFour));
    }
    return cards;
}

shuffle = (array: Card[]): Card[] => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

initializePlayers = (playersAmount: number,Deck: Card[],tactics:Tactic[]): Player[] => {
    let players: Player[] = [];
    if(playersAmount < 2 || playersAmount > Deck.length/7){
        throw new Error("Invalid amount of players");
    }
    for(let i = 0; i < playersAmount; i++){
        players.push(new Player(tactics[i]));
        // give players cards
        for(let j = 0; j < 7; j++){
            players[i].Cards.push(Deck.pop()!);
        }
    }
    return players;
}
}