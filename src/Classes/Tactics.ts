import { Action, Color, numToColor } from "../types"

import { Card } from "./Card"
import { Game } from "./Game"
import { Player } from "./Player"
import { exit } from "node:process"

export const randomTactic = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex:number|null = null;

    if(requirements.includes(Action.DrawFour)){

        for(let i = 0; i < playerCards.length; i++){
            const card:Card = playerCards[i];
            
            if(card.action == Action.DrawFour){

                return i;
            }
        }
    }
    else if(requirements[0] == Action.DrawTwo){
       for(let i = 0; i < playerCards.length; i++){
            const card:Card = playerCards[i];
            if(card.action == Action.DrawTwo){
                return i;
            }
        }
    }
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i]?.color == LayedCards[LayedCards.length-1].color || playerCards[i]?.value == LayedCards[LayedCards.length-1].value || playerCards[i]?.color == Color.Any){
            return i;
        }
    }
    if(cardIndex == null){
        return null;
    }
    //handle action cards
    if(playerCards[cardIndex!].action){
        if(playerCards[cardIndex!].action == Action.DrawFour){
            let colorIndex = Math.floor(Math.random()*4);
            playerCards[cardIndex!].color = numToColor(colorIndex);
        }else if(playerCards[cardIndex!].action == Action.Wild){
            let colorIndex = Math.floor(Math.random()*4);
            playerCards[cardIndex!].color = numToColor(colorIndex);
        }
    }
    if(playerCards[cardIndex!].color == Color.Any){
        throw new Error("Color is still any");
    }

    return cardIndex;
}









