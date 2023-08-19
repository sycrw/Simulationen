import { Action, Color, numToColor } from "../types";

import { Card } from "./Card";

//if there is a draw four or draw two in the requirements, play a draw four or draw two if there is one
const checkForForcingCards = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex: number | null = null;

  if (requirements.includes(Action.DrawFour)) {
    //if the first card is a draw four

    for (let i = 0; i < playerCards.length; i++) {
      const card: Card = playerCards[i];
      if (card.action == Action.DrawFour) {
        return i;
      }
    }
  } else if (requirements[0] == Action.DrawTwo) {
    //if the first card is a draw two
    for (let i = 0; i < playerCards.length; i++) {
      const card: Card = playerCards[i];
      if (card.action == Action.DrawTwo) {
        return i;
      }
    }
  }
  return cardIndex;
};
export const firstCard = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex: number | null = null;
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    cardIndex = checkForForcingCards(playerCards, LayedCards, requirements);
    //handle color if it is any
    transformAnyColorCards(playerCards, cardIndex!);
    return cardIndex;
  }
  // first card that matches the color
  for (let i = 0; i < playerCards.length; i++) {
    if (
      playerCards[i]?.color == LayedCards[LayedCards.length - 1].color ||
      playerCards[i]?.value == LayedCards[LayedCards.length - 1].value ||
      playerCards[i]?.color == Color.Any
    ) {
      //if value = -1 any action card can be played on any action card so there the color has to be the same
      if (playerCards[i]?.value == -1) {
        if (
          playerCards[i]?.color == LayedCards[LayedCards.length - 1].color ||
          playerCards[i]?.color == Color.Any
        ) {
          cardIndex = i;
          break;
        } else {
          continue;
        }
      }
      cardIndex = i;
    }
  }
  if (cardIndex == null) {
    return null;
  }
  //handle action cards
  transformAnyColorCards(playerCards, cardIndex!);
  if (playerCards[cardIndex!].color == Color.Any) {
    throw new Error("Color is still any");
  }

  return cardIndex;
};

export const keepManyColors = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex: number | null = null;
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    const cardIndex = checkForForcingCards(
      playerCards,
      LayedCards,
      requirements
    );
    //handle color if it is any
    transformAnyColorCards(playerCards, cardIndex!);
    return cardIndex;
  }
  //get amount of each color and save in an object
  // prettier-ignore
  let colorAmounts: { [key: string]: number } = {
    "Red": 0,
    "Blue": 0,
    "Green": 0,
    "Yellow": 0
  };
  //get the color with the most cards
  for (let i = 0; i < playerCards.length; i++) {
    if (playerCards[i].color != Color.Any) {
      colorAmounts[playerCards[i].color!] += 1;
    }
  }
  //sort the object by the amount of cards
  let sortedColors = Object.keys(colorAmounts).sort(
    (a, b) => colorAmounts[b] - colorAmounts[a]
  );
  //get the first card that matches the color and it matches to the layed card else go to the next color
  for (let i = 0; i < sortedColors.length; i++) {
    for (let j = 0; j < playerCards.length; j++) {
      if (playerCards[j].color == sortedColors[i]) {
        if (
          playerCards[j].value == LayedCards[LayedCards.length - 1].value ||
          playerCards[j].color == LayedCards[LayedCards.length - 1].color
        ) {
          cardIndex = j;
          transformAnyColorCards(playerCards, cardIndex!);
          return cardIndex;
        }
      }
    }
  }
  //if no card matches the color, play a wild card
  for (let i = 0; i < playerCards.length; i++) {
    if (
      playerCards[i].action == Action.Wild ||
      playerCards[i].action == Action.DrawFour
    ) {
      cardIndex = i;
      //choose color with most cards
      let color = sortedColors[0];
      playerCards[cardIndex!].color = color as Color;
      return cardIndex;
    }
  }

  if (cardIndex == null) {
    return null;
  }
  //if color is still any, throw error
  if (playerCards[cardIndex!].color == Color.Any) {
    throw new Error("Color is still any");
  }
  return cardIndex;
};

export const alwaysDraw = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  return null;
};
/**
 * card counting:
 * see how many cards of each color have been layed and play the color with the least cards, therefor increasing the chance of the players to have to draw cards
 * if there are no cards of a color, play a wild card
 * if there are no wild cards, play a draw four
 * if there are no draw fours, play a card that matches the color
 * if there are no cards that match the color, play a card that matches the value
 * else draw a card
 */
export const cardCounting = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex: number | null = null;
  //calculate the amount of cards of each color that have been layed
  // prettier-ignore
  let colorAmounts: { [key: string]: number } = {
    "Red": 0,
    "Blue": 0,
    "Green": 0,
    "Yellow": 0
  };
  for (let i = 0; i < LayedCards.length; i++) {
    if (LayedCards[i].color != Color.Any) {
      colorAmounts[LayedCards[i].color!] += 1;
    }
  }
  //sort the object by the amount of cards
  const sortedColors = Object.keys(colorAmounts).sort(
    (a, b) => colorAmounts[b] - colorAmounts[a]
  );
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    cardIndex = checkForForcingCards(playerCards, LayedCards, requirements);
    //handle color if it is any
    if (playerCards[cardIndex!].color == Color.Any) {
      playerCards[cardIndex!].color = sortedColors[0] as Color;
    }
  } else {
    //if no forcing card, play a card that matches the color with the least cards
    //loop over the four colors incase the player doesnt have the first color
    //find all the cards that match the color with the least cards and save the indexes in an array
    for (let i = 0; i < sortedColors.length; i++) {
      let matchingCards: number[] = [];
      for (let j = 0; j < playerCards.length; j++) {
        if (playerCards[j].color == sortedColors[i]) {
          matchingCards.push(j);
        }
      }
      //if there are matching cards, play the first one that matches the top card
      if (matchingCards.length > 0) {
        for (let j = 0; j < matchingCards.length; j++) {
          if (
            playerCards[matchingCards[j]].value ==
              LayedCards[LayedCards.length - 1].value ||
            playerCards[matchingCards[j]].color ==
              LayedCards[LayedCards.length - 1].color
          ) {
            cardIndex = matchingCards[j];
            break;
          }
        }
      }
      for (let j = 0; j < playerCards.length; j++) {
        if (
          playerCards[j].action == Action.Wild ||
          playerCards[j].action == Action.DrawFour
        ) {
          cardIndex = j;
          //choose color with most cards
          let color = sortedColors[0];
          playerCards[cardIndex!].color = color as Color;
          break;
        }
      }
      //if no card is found go to the next color
    }
    //if no card is found, play the first card that fits
    if (cardIndex == null) {
      for (let i = 0; i < playerCards.length; i++) {
        if (
          playerCards[i].color == LayedCards[LayedCards.length - 1].color ||
          playerCards[i].value == LayedCards[LayedCards.length - 1].value
        ) {
          cardIndex = i;
          break;
        }
      }
    }
  }
  if (cardIndex == null) {
    return null;
  }
  if (playerCards[cardIndex!].color == Color.Any) {
    playerCards[cardIndex!].color = sortedColors[0] as Color;
  }
  return cardIndex;
};

export const keepManyActionCards = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex = null;
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    cardIndex = checkForForcingCards(playerCards, LayedCards, requirements);
    //handle color if it is any
    console.log(cardIndex + "checkForForcingCards");
    transformAnyColorCards(playerCards, cardIndex!);
    return cardIndex;
  }
  //make a new array with indexes of possible cards
  let possibleCards: number[] = playerCards
    .map((card, index) => {
      if (!card.action) {
        return index;
      }
    })
    .filter(card => card != undefined) as number[];
  //if there are no possible cards, return null
  //console.log("Cards that can be played: ")
  //possibleCards.forEach((card) => console.log(playerCards[card]));

  if (possibleCards.length == 0) {
    //pick the first card that matches the color or value
    for (let i = 0; i < playerCards.length; i++) {
      if (
        playerCards[i].color == LayedCards[LayedCards.length - 1].color ||
        playerCards[i].value == LayedCards[LayedCards.length - 1].value ||
        playerCards[i].color == Color.Any
      ) {
        cardIndex = i;
        break;
      }
    }
  } else {
    //pick the first card that matches the color or value
    for (let i = 0; i < possibleCards.length; i++) {
      if (
        playerCards[possibleCards[i]].color ==
          LayedCards[LayedCards.length - 1].color ||
        playerCards[possibleCards[i]].value ==
          LayedCards[LayedCards.length - 1].value
      ) {
        cardIndex = possibleCards[i];
        break;
      }
    }
  }

  if (cardIndex == null) {
    return null;
  }

  //handle action cards
  transformAnyColorCards(playerCards, cardIndex!);

  return cardIndex;
};

export const playAllActionCards = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex = null;
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    return checkForForcingCards(playerCards, LayedCards, requirements);
  }
  //make a new array with indexes of possible cards
  let possibleCards: number[] = playerCards
    .map((card, index) => {
      if (card.action) {
        return index;
      }
    })
    .filter(card => card != undefined) as number[];
  //if there are possible cards play the first one
  if (possibleCards.length > 0) {
    cardIndex = possibleCards[0];
  } else {
    //pick the first card that can be played,
    for (let i = 0; i < playerCards.length; i++) {
      if (
        playerCards[i].color == LayedCards[LayedCards.length - 1].color ||
        playerCards[i].value == LayedCards[LayedCards.length - 1].value ||
        playerCards[i].color == Color.Any
      ) {
        cardIndex = i;
        break;
      }
    }
  }
  if (cardIndex == null) {
    return null;
  }
  //handle action cards
  transformAnyColorCards(playerCards, cardIndex!);
  return cardIndex;
};

//keep plus two and plus four cards to defend, else always try to get rid of action cards(reverse, skip, and wild)

export const keepPlusCardsAndPlayAction = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  let cardIndex = null;
  if (checkForForcingCards(playerCards, LayedCards, requirements) != null) {
    const cardIndex = checkForForcingCards(
      playerCards,
      LayedCards,
      requirements
    );
    //handle color if it is any
    transformAnyColorCards(playerCards, cardIndex!);
    return cardIndex;
  }
  //make a new array with indexes of possible cards
  const possibleCards: number[] = playerCards
    .map((card, index) => {
      if (
        card.action == Action.Reverse ||
        card.action == Action.Skip ||
        card.action == Action.Wild
      ) {
        return index;
      }
    })
    .filter(card => card != undefined) as number[];
  //if there are possible cards play the first one
  if (possibleCards.length > 0) {
    cardIndex = possibleCards[0];
  } else {
    //play any card except plus two and plus four that matches the color or value
    const possibleCards: number[] = playerCards
      .map((card, index) => {
        if (
          card.action != Action.DrawTwo &&
          card.action != Action.DrawFour &&
          (card.color == LayedCards[LayedCards.length - 1].color ||
            card.value == LayedCards[LayedCards.length - 1].value)
        ) {
          return index;
        }
      })
      .filter(card => card != undefined) as number[];
    //if there are possible cards play the first one
    if (possibleCards.length > 0) {
      cardIndex = possibleCards[0];
    } else {
      //play any card
      for (let i = 0; i < playerCards.length; i++) {
        if (
          playerCards[i].color == LayedCards[LayedCards.length - 1].color ||
          playerCards[i].value == LayedCards[LayedCards.length - 1].value ||
          playerCards[i].color == Color.Any
        ) {
          cardIndex = i;
          break;
        }
      }
    }
  }
  if (cardIndex == null) {
    return null;
  }
  //handle action cards
  transformAnyColorCards(playerCards, cardIndex!);
  return cardIndex;
};

// calculate the amount of cards of own color and if the card is color.any make the color with the most cards the color of the card

const transformAnyColorCards = (
  playerCards: Card[],
  cardToTransformIndex: number
) => {
  console.log("transformAnyColorCards");
  console.log(playerCards[cardToTransformIndex], cardToTransformIndex);
  //ignore prettier for this object
  // prettier-ignore
  const colors = {
    "Red": 0,
    "Blue": 0,
    "Green": 0,
    "Yellow": 0
  };
  for (let i = 0; i < playerCards.length; i++) {
    if (playerCards[i].color != Color.Any) {
      // @ts-ignore
      colors[playerCards[i].color!] += 1;
    }
  }
  if (playerCards[cardToTransformIndex].color == Color.Any) {
    // @ts-ignore
    playerCards[cardToTransformIndex].color = Object.keys(colors).sort(
      // @ts-ignore
      (a, b) => colors[b] - colors[a]
    )[0];
  }
};
