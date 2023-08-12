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
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ return checkForForcingCards(playerCards,LayedCards,requirements); } //TODO: handle colors
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
/**
 * card counting: 
 * see how many cards of each color have been layed and play the color with the least cards, therefor increasing the chance of the players to have to draw cards
 * if there are no cards of a color, play a wild card
 * if there are no wild cards, play a draw four
 * if there are no draw fours, play a card that matches the color
 * if there are no cards that match the color, play a card that matches the value
 * else draw a card
    */
export const cardCounting = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex:number|null = null;
    //calculate the amount of cards of each color that have been layed
    let colorAmounts:{[key:string]:number} = {
        "red":0,
        "blue":0,
        "green":0,
        "yellow":0
    };
    for(let i = 0; i < LayedCards.length; i++){
        if(LayedCards[i].color != Color.Any){
            colorAmounts[LayedCards[i].color!] += 1;
        }
    }
    //sort the object by the amount of cards
    const sortedColors = Object.keys(colorAmounts).sort((a,b) => colorAmounts[b] - colorAmounts[a]);
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ 
        cardIndex = checkForForcingCards(playerCards,LayedCards,requirements);
        //handle color if it is any
        if(playerCards[cardIndex!].color == Color.Any){
            playerCards[cardIndex!].color = sortedColors[0] as Color;
        }
    }
    else{ //if no forcing card, play a card that matches the color with the least cards
        //loop over the four colors incase the player doesnt have the first color
        //find all the cards that match the color with the least cards and save the indexes in an array
       for(let i = 0; i < sortedColors.length; i++){
            let matchingCards:number[] = [];
            for(let j = 0; j < playerCards.length; j++){
                if(playerCards[j].color == sortedColors[i]){
                    matchingCards.push(j);
                }
            }
            //if there are matching cards, play the first one
            if(matchingCards.length > 0){
                cardIndex = matchingCards[0];
                break;
            }
            //if it still is the first color being checked, play a wild card or draw four
            if(i == 0){
                for(let j = 0; j < playerCards.length; j++){
                    if(playerCards[j].action == Action.Wild || playerCards[j].action == Action.DrawFour){
                        cardIndex = j;
                        //choose color with most cards
                        let color = sortedColors[0];
                        playerCards[cardIndex!].color = color as Color;
                        break;
                    }
                }
            }
            //if no card is found go to the next color
        }
        //if no card is found, play the first card that fits
        if(cardIndex == null){
            for(let i = 0; i < playerCards.length; i++){
                if(playerCards[i].color == LayedCards[LayedCards.length-1].color || playerCards[i].value == LayedCards[LayedCards.length-1].value){
                    cardIndex = i;
                    break;
                }
            }
        }
        else if(cardIndex == null){
            return null;
        }   
    }
    //if color is still any, throw error
    if(cardIndex != null && playerCards[cardIndex!].color == Color.Any){
        throw new Error("Color is still any");
    }
    return cardIndex;
}


export const keepManyActionCards = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex = null;
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ return checkForForcingCards(playerCards,LayedCards,requirements); }
    //make a new array with indexes of possible cards
    let possibleCards:number[] = playerCards.map((card,index) => {
        if(!card.action){
            return index;
        }
    }).filter((card) => card != undefined) as number[];
    //if there are no possible cards, return null
    //console.log("Cards that can be played: ")
    //possibleCards.forEach((card) => console.log(playerCards[card]));

    if(possibleCards.length == 0){
        //pick the first card that matches the color or value
        for(let i = 0; i < playerCards.length; i++){
            if(playerCards[i].color == LayedCards[LayedCards.length-1].color || playerCards[i].value == LayedCards[LayedCards.length-1].value){
                cardIndex = i;
                break;
            }
        }
    }
    else{
        //pick the first card that matches the color or value
        for(let i = 0; i < possibleCards.length; i++){
            if(playerCards[possibleCards[i]].color == LayedCards[LayedCards.length-1].color || playerCards[possibleCards[i]].value == LayedCards[LayedCards.length-1].value){
                cardIndex = possibleCards[i];
                break;
            }
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

    return cardIndex;
}

export const playAllActionCards = (playerCards:Card[],LayedCards:Card[],requirements:string[]):number|null => {
    let cardIndex = null;
    if(checkForForcingCards(playerCards,LayedCards,requirements)){ return checkForForcingCards(playerCards,LayedCards,requirements); }
    //make a new array with indexes of possible cards
    let possibleCards:number[] = playerCards.map((card,index) => {
        if(card.action){
            return index;
        }
    }).filter((card) => card != undefined) as number[];
    //if there are possible cards play the first one
    if(possibleCards.length > 0){
        cardIndex = possibleCards[0];
    }
    else{
        //pick the first card that matches the color or value
        for(let i = 0; i < playerCards.length; i++){
            if(playerCards[i].color == LayedCards[LayedCards.length-1].color || playerCards[i].value == LayedCards[LayedCards.length-1].value){
                cardIndex = i;
                break;
            }
        }
    }
    if(cardIndex == null){
        return null;
    }
    //handle action cards
    if(playerCards[cardIndex!].action){
        let colorIndex = Math.floor(Math.random()*4);
        playerCards[cardIndex!].color = numToColor(colorIndex);
    }
    return cardIndex;
}