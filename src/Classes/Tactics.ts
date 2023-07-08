import { Action, Color } from "../types"

import { Card } from "./Card"
import { Game } from "./Game"
import { Player } from "./Player"

export const randomTactic = (playerCards:Card[],LayedCards:Card[]):number|null => {
    let cardIndex:number|null = null;
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i]?.color == LayedCards[LayedCards.length-1].color || playerCards[i]?.value == LayedCards[LayedCards.length-1].value){
            if(playerCards[i].action == null){
                cardIndex = i;
                break;
            }
        }
    }
    return cardIndex;
}

    