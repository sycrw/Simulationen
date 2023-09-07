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
    //console.log("forcing card found");
    cardIndex = checkForForcingCards(playerCards, LayedCards, requirements);
    //console.log("card got: " + JSON.stringify(playerCards[cardIndex!]));
    //handle color if it is any
    if (playerCards[cardIndex!].color == Color.Any) {
      //console.log("color is any");
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
    .filter((card) => card != undefined) as number[];
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
    cardIndex = checkForForcingCards(playerCards, LayedCards, requirements);
    //handle color if it is any
    transformAnyColorCards(playerCards, cardIndex!);
    return cardIndex;
  }
  //make a new array with indexes of possible cards
  let possibleCards: number[] = playerCards
    .map((card, index) => {
      if (card.action) {
        return index;
      }
    })
    .filter((card) => card != undefined) as number[];
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
    .filter((card) => card != undefined) as number[];
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
      .filter((card) => card != undefined) as number[];
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

//best Tactic
/**
 * Combines Keep Many Colors and KeepPlusCardsAndPlayAction + Keep Many Numbers
 **/
export const bestTactic = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  // console.log("start calc best Tactic");
  let cardIndex = null;
  let anyCardColor: Color;
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
  //make a new object from the cards that looks like this, called valued cards : [{value:number, card:Card}]
  let valuedCards: { value: number; card: Card }[] = [];
  for (let i = 0; i < playerCards.length; i++) {
    valuedCards.push({ value: 0, card: playerCards[i] });
  }
  //const which tactic gives how many points
  const tacticPoints = {
    keepManyColors: 1,
    keepManyNumbers: 0,
    keepPlusCardsAndPlayAction: 0,
    keepPlusCardsAndPlayActionMinus: 0,
  };
  //let each tactic play and if the tactic would play the card, they add a point
  //tactic: keepManyColors
  // prettier-ignore
  const playerColorCount: any = {
    "Red": 0,
    "Blue": 0,
    "Green": 0,
    "Yellow": 0,
  };
  for (let i = 0; i < playerCards.length; i++) {
    if (!playerCards[i].color) {
      throw new Error("color is undefinded");
    }
    if (playerCards[i].color != Color.Any) {
      playerColorCount[playerCards[i].color!] += 1;
    }
  }
  // console.log("playerColorCount: " + JSON.stringify(playerColorCount, null, 2));
  //sort the object by the amount of cards
  const sortedColors = Object.keys(playerColorCount).sort(
    (a, b) => playerColorCount[b] - playerColorCount[a]
  );
  // console.log("sortedColors: " + JSON.stringify(sortedColors, null, 2));

  //now each card that matches the first card, gets their value upped by one
  for (let i = 0; i < valuedCards.length; i++) {
    if (valuedCards[i].card.color == sortedColors[0]) {
      valuedCards[i].value += tacticPoints.keepManyColors;
    }
  }
  anyCardColor = sortedColors[0] as Color;
  // console.log("value after colors", JSON.stringify(valuedCards, null, 2));

  //Tactic: Keep many numbers
  //count which cards are the most common
  const playerNumberCount: any = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };

  for (let i = 0; i < playerCards.length; i++) {
    if (playerCards[i].value != -1) {
      playerNumberCount[playerCards[i].value!] += 1;
    }
  }
  // console.log(
  //   "playerNumberCount: " + JSON.stringify(playerNumberCount, null, 2)
  // );

  //sort the object by the amount of cards
  const sortedNumbers = Object.keys(playerNumberCount).sort(
    (a, b) => playerNumberCount[b] - playerNumberCount[a]
  );
  // console.log("sortedNumbers: " + JSON.stringify(sortedNumbers, null, 2));

  //now each card that matches the first card, gets their value upped by one
  for (let i = 0; i < valuedCards.length; i++) {
    if (valuedCards[i].card.value == Number(sortedNumbers[0])) {
      valuedCards[i].value += tacticPoints.keepManyNumbers;
    }
    if (valuedCards[i].card.value == Number(sortedNumbers[1])) {
      valuedCards[i].value += tacticPoints.keepManyNumbers / 2;
    }
  }
  // console.log("value after numbers", JSON.stringify(valuedCards, null, 2));

  //tactic keep plus cards and play action
  //loop over the cards and if the card is an action card but not a plus card, up the value by one
  //if it is a plus card down the value by one
  for (let i = 0; i < valuedCards.length; i++) {
    if (
      valuedCards[i].card.action == Action.Reverse ||
      valuedCards[i].card.action == Action.Skip ||
      valuedCards[i].card.action == Action.Wild
    ) {
      valuedCards[i].value += tacticPoints.keepPlusCardsAndPlayAction;
    }
    if (
      valuedCards[i].card.action == Action.DrawTwo ||
      valuedCards[i].card.action == Action.DrawFour
    ) {
      valuedCards[i].value -= tacticPoints.keepPlusCardsAndPlayActionMinus;
    }
  }
  // console.log("value after action cards", JSON.stringify(valuedCards, null, 2));

  //sort valueCards, after value
  valuedCards.sort((a, b) => b.value - a.value);
  // console.log("evaluated cards", JSON.stringify(valuedCards, null, 2));

  //play the first card, that is playable
  for (let i = 0; i < valuedCards.length; i++) {
    if (
      valuedCards[i].card.color == LayedCards[LayedCards.length - 1].color ||
      valuedCards[i].card.value == LayedCards[LayedCards.length - 1].value ||
      valuedCards[i].card.color == Color.Any
    ) {
      cardIndex = playerCards.indexOf(valuedCards[i].card);
      break;
    }
  }
  if (cardIndex == null) {
    return null;
  }
  //if color is any, make it the color with the most cards
  if (playerCards[cardIndex!].color == Color.Any) {
    playerCards[cardIndex!].color = anyCardColor;
  }

  return cardIndex;
};

//best Tactic by exclucion
//tactics: keep many colors, keep many numbers, keep plus cards and play action,
//let first tactic give cards it would lay,
//then let second tactic, evaluate on the recommended cards of the first tactic
//and so on
export const bestTacticByExclucion = (
  playerCards: Card[],
  LayedCards: Card[],
  requirements: string[]
): number | null => {
  // console.log("player Cards", JSON.stringify(playerCards, null, 2));
  let cardIndex = null;
  if (playerCards.length == 1) {
    return 0;
  }
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
  let recommendedCards: Card[] = [];
  //put all cards,that can be layed, in recommended cards
  for (let i = 0; i < playerCards.length; i++) {
    if (
      playerCards[i].color == LayedCards[LayedCards.length - 1].color ||
      playerCards[i].value == LayedCards[LayedCards.length - 1].value ||
      playerCards[i].color == Color.Any
    ) {
      recommendedCards.push(playerCards[i]);
    }
    //if a action card is laying, any player has the same action, add it to the recommended cards
    if (
      playerCards[i].action == Action.Reverse ||
      playerCards[i].action == Action.Skip
    ) {
      if (LayedCards[LayedCards.length - 1].action == playerCards[i].action) {
        recommendedCards.push(playerCards[i]);
      }
    }
    //if color is any add
  }
  //if no cards can be layed, return null
  if (recommendedCards.length == 0) {
    return null;
  }
  // console.log("recomended cards", JSON.stringify(recommendedCards, null, 2));

  //tactic: keep many colors
  // prettier-ignore
  const playerColorCount: any = {
    "Red": 0,
    "Blue": 0,
    "Green": 0,
    "Yellow": 0,
  }
  for (let i = 0; i < playerCards.length; i++) {
    if (!playerCards[i].color) {
      throw new Error("color is undefinded");
    }
    if (playerCards[i].color != Color.Any) {
      playerColorCount[playerCards[i].color!] += 1;
    }
  }
  //sort the object by the amount of cards
  const sortedColors = Object.keys(playerColorCount).sort(
    (a, b) => playerColorCount[b] - playerColorCount[a]
  );
  //add each color, that has the most cards to the recommended cards, if more than one color has the most cards, add all of them
  const colorsToAdd = Object.keys(playerColorCount).filter(
    (color) => playerColorCount[color] == playerColorCount[sortedColors[0]]
  );
  //delete all cards from recomended, if they are not in the colors to add, if no cards in recomended after that, keep the old recomended
  let oldRecomendedCards = [...recommendedCards];
  recommendedCards = recommendedCards.filter((card) =>
    colorsToAdd.includes(card.color!)
  );
  //add action cards, that can be layed, because that is keepplusand play actions task
  for (let i = 0; i < playerCards.length; i++) {
    if (playerCards[i].action) {
      //if it can be layed
      if (
        playerCards[i].action == Action.Reverse ||
        playerCards[i].action == Action.Skip
      ) {
        if (playerCards[i].action == LayedCards[LayedCards.length - 1].action) {
          recommendedCards.push(playerCards[i]);
        }
      }
      //if color matches
      if (playerCards[i].color == LayedCards[LayedCards.length - 1].color) {
        recommendedCards.push(playerCards[i]);
      }
      //if color is any
      if (playerCards[i].color == Color.Any) {
        recommendedCards.push(playerCards[i]);
      }
    }
  }
  if (recommendedCards.length == 0) {
    recommendedCards = oldRecomendedCards;
  }

  // console.log(
  //   "recommendedCards after colors: " +
  //     JSON.stringify(recommendedCards, null, 2)
  // );
  //tactic: keep plus and play action
  //remove all cards that are not reverse, skip, wild
  oldRecomendedCards = [...recommendedCards];
  recommendedCards = recommendedCards.filter(
    (card) =>
      card.action == Action.Reverse ||
      card.action == Action.Skip ||
      card.action == Action.Wild
  );
  //if no cards in recommended, keep the old recommended
  if (recommendedCards.length == 0) {
    recommendedCards = oldRecomendedCards;
  }
  //remove all +4 and +2
  oldRecomendedCards = [...recommendedCards];
  recommendedCards = recommendedCards.filter(
    (card) => card.action != Action.DrawFour && card.action != Action.DrawTwo
  );
  //if no cards in recommended, keep the old recommended
  if (recommendedCards.length == 0) {
    recommendedCards = oldRecomendedCards;
  }

  // console.log(
  //   "recommendedCards after action cards: " +
  //     JSON.stringify(recommendedCards, null, 2)
  // );
  //play the first card in recommended cards
  cardIndex = playerCards.indexOf(recommendedCards[0]);
  //handle action cards
  transformAnyColorCards(playerCards, cardIndex!);
  //if color is still any, throw error
  if (playerCards[cardIndex!].color == Color.Any) {
    throw new Error("Color is still any");
  }
  return cardIndex;
};
