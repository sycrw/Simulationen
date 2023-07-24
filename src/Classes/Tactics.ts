import { Action, Color, numToColor } from "../types"

import { Card } from "./Card"
import { Game } from "./Game"
import { Player } from "./Player"

//if there is a draw four or draw two in the requirements, play a draw four or draw two if there is one
const checkForForcingCards = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex:number|null = null;

    if(requirements.includes(Action.DrawFour)){ //if the first card is a draw four

        for(let i = 0; i < playerCards.length; i++){
            const card:Card = playerCards[i];
            if(card.action == Action.DrawFour){
                return i;
            }
        }
    }
    else if(requirements[0] == Action.DrawTwo){ //if the first card is a draw two
       for(let i = 0; i < playerCards.length; i++){
            const card:Card = playerCards[i];
            if(card.action == Action.DrawTwo){
                return i;
            }
        }
    }
    return cardIndex;
}
//handle action cards
const handleActionCards = (playerCards:Card[],cardIndex:number,requirements:string[]):void => {
    if(playerCards[cardIndex].action){
        if(playerCards[cardIndex].action == Action.DrawFour){
            let colorIndex = Math.floor(Math.random()*4);
            playerCards[cardIndex].color = numToColor(colorIndex);
        }else if(playerCards[cardIndex].action == Action.Wild){
            let colorIndex = Math.floor(Math.random()*4);
            playerCards[cardIndex].color = numToColor(colorIndex);
        }
    }
    if(playerCards[cardIndex].color == Color.Any){
        throw new Error("Color is still any");
    }
}

export const firstCard = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex:number|null = null;
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ return checkForForcingCards(playerCards,LayedCards,requirements); }
    // first card that matches the color
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i]?.color == LayedCards[LayedCards.length-1].color || playerCards[i]?.value == LayedCards[LayedCards.length-1].value || playerCards[i]?.color == Color.Any){
            //if value = -1 any action card can be played on any action card so there the color has to be the same
            if(playerCards[i]?.value == -1 ){
                if(playerCards[i]?.color == LayedCards[LayedCards.length-1].color || playerCards[i]?.color == Color.Any){
                    cardIndex = i;
                    break;
                }
                else{
                    continue;
                }
            }
            
            cardIndex = i;
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

export const keepManyColors = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex:number|null = null;
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ return checkForForcingCards(playerCards,LayedCards,requirements); }
    //get amount of each color and save in an object
    let colorAmounts:{[key:string]:number} = {
        "red":0,
        "blue":0,
        "green":0,
        "yellow":0
    };
    //get the color with the most cards
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i].color != Color.Any){
            colorAmounts[playerCards[i].color!] += 1;
        }
    }
    //sort the object by the amount of cards
    let sortedColors = Object.keys(colorAmounts).sort((a,b) => colorAmounts[b] - colorAmounts[a]);
    //get the first card that matches the color and it matches to the layed card else go to the next color
    for(let i = 0; i < sortedColors.length; i++){
        for(let j = 0; j < playerCards.length; j++){
            if(playerCards[j].color == sortedColors[i] && (playerCards[j].color == LayedCards[LayedCards.length-1].color || playerCards[j].value == LayedCards[LayedCards.length-1].value)){
                return j;
            }
        }
    }
    //if no card matches the color, play a wild card
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i].action == Action.Wild){
            cardIndex = i;
            //choose color with most cards
            let color = sortedColors[0];
            playerCards[cardIndex!].color = color as Color;
            return cardIndex;
        }
    }
    //if no wild card, play a draw four
    for(let i = 0; i < playerCards.length; i++){
        if(playerCards[i].action == Action.DrawFour){
            cardIndex = i;
            //choose color with most cards
            let color = sortedColors[0];
            playerCards[cardIndex!].color = color as Color;
            return cardIndex;
        }
    }
    if(cardIndex == null){
        return null;
    }
    //handle action cards
    if(playerCards[cardIndex!].action){
        if(playerCards[cardIndex!].action == Action.DrawFour){
            //choose color with most cards
            let color = sortedColors[0];
            playerCards[cardIndex!].color = color as Color;
        }else if(playerCards[cardIndex!].action == Action.Wild){
            //choose color with most cards
            let color = sortedColors[0];
            playerCards[cardIndex!].color = color as Color;
        }
    }
    //if color is still any, throw error
    if(playerCards[cardIndex!].color == Color.Any){
        throw new Error("Color is still any");
    }

    return cardIndex;
}

export const alwaysDraw = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    return null;
}