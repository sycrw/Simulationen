import { Action, Tactic, numToColor } from "../types";

import { ActionCardRequirmentsHandler } from "./ActionCardRequirmentsHandler";
import { Card } from "./Card";
import { Color } from "../types";
import { Player } from "./Player";

export class Game {
  Players: Player[] = [];
  LayedCards: Card[] = [];
  Deck: Card[] = [];
  winner: number | null = null;
  round: number = 0;
  ActionCardRequirmentsHandler: ActionCardRequirmentsHandler = new ActionCardRequirmentsHandler(
    false,
    []
  );
  totalCards: number = 0;
  startCardsList: Card[] = [];

  constructor(
    playersAmount: number,
    tactics: ((playerCards: Card[], LayedCards: Card[]) => number | null)[],
    public log: boolean
  ) {
    this.Deck = this.initializeCards();
    this.Deck = this.shuffle(this.Deck);
    this.Players = this.initializePlayers(playersAmount, this.Deck, tactics);
    this.log = log;
    while (this.Deck[this.Deck.length - 1].action != null) {
      this.Deck = this.shuffle(this.Deck);
    }
    this.totalCards =
      this.Deck.length +
      this.Players.reduce((acc, player) => acc + player.Cards.length, 0);
    //start Cards list to compare if a card is lost
    this.startCardsList = this.Deck.concat();
    this.Players.forEach(player => {
      this.startCardsList = this.startCardsList.concat(
        JSON.parse(JSON.stringify(player.Cards))
      );
    });
    this.LayedCards.push(this.Deck.pop()!);
    this.winner = this.playGame();
  }

  playGame(): number | null {
    let currentPlayerIndex = 0;
    let direction = 1;
    if (this.log) {
      console.log(`\nStarting game with ${this.Players.length} players`);
      console.log(
        "top card: " +
          JSON.stringify(this.LayedCards[this.LayedCards.length - 1])
      );
      console.log("players:");
      this.Players.forEach((player, i) => {
        console.log(
          `${i} has ${player.Cards.length} cards and uses ${player.calculateMove.name}`
        );
      });
    }

    while (!this.checkWin(this.Players)) {
      this.round++;
      if (this.log) {
        console.log("--------------------");
        console.log(`\nRound ${this.round}`);
        console.log(
          "top card: " +
            JSON.stringify(this.LayedCards[this.LayedCards.length - 1])
        );
        console.log(
          `Player ${currentPlayerIndex} has ${this.Players[currentPlayerIndex].Cards.length} cards`
        );
      }
      this.checkHeath();
      //reshuffle the deck if there are no cards left
      if (this.Deck.length == 0) {
        this.resetDeck();
      }

      const currentPlayer = this.Players[
        currentPlayerIndex % this.Players.length
      ];
      const playerCardIndex = currentPlayer.calculateMove(
        currentPlayer.Cards,
        this.LayedCards,
        this.ActionCardRequirmentsHandler.requirements
      ); // get the index of the card the player wants to play

      const playerCard = currentPlayer.Cards[playerCardIndex!]; // get the card the player wants to play
      if (this.log) {
        console.log(
          `Player ${currentPlayerIndex} plays: ${JSON.stringify(
            playerCard
          )} from his cards:`
        );
        currentPlayer.Cards.forEach(card => {
          console.log(JSON.stringify(card));
        });
      }
      if (this.log) {
        console.log(
          "Requirements: " + this.ActionCardRequirmentsHandler.requirements
        );
      }

      // check if the player has to be skipped or the direction has to be reversed
      if (this.ActionCardRequirmentsHandler.requirements[0] == Action.Skip) {
        // skip

        if (this.log) {
          console.log(`Player ${currentPlayerIndex} has to skip`);
        }
        currentPlayerIndex =
          (currentPlayerIndex + direction) % this.Players.length;
        if (currentPlayerIndex == -1) {
          currentPlayerIndex = this.Players.length - 1;
        }
        //remove the action from the card so the next player doesnt have to skip
        this.resetActionCardRequirements();
        continue;
      } else if (
        this.ActionCardRequirmentsHandler.requirements[0] == Action.Reverse
      ) {
        // reverse
        if (this.log) {
          console.log(
            `The direction has been reversed! Player ${currentPlayerIndex} has lost his turn`
          );
        }
        direction *= -1;
        if (this.Players.length > 2) {
          currentPlayerIndex =
            (currentPlayerIndex + 2 * direction) % this.Players.length; // skip the next player else the same player would play again
        } else {
          currentPlayerIndex =
            (currentPlayerIndex + direction) % this.Players.length; // skip the next player else the same player would play again
        }
        if (currentPlayerIndex == -1) {
          currentPlayerIndex = this.Players.length - 1;
        }
        currentPlayerIndex = Math.abs(currentPlayerIndex);
        if (this.log) {
          console.log(`Player ${currentPlayerIndex} is now playing`);
        }

        this.resetActionCardRequirements();
        continue;
      }
      //check if the requirements of the action card are met (draw 2 and 4 cards)
      if (
        this.ActionCardRequirmentsHandler.requirements.includes(
          Action.DrawTwo
        ) ||
        this.ActionCardRequirmentsHandler.requirements.includes(Action.DrawFour)
      ) {
        const requirement = this.ActionCardRequirmentsHandler.requirements.includes(
          Action.DrawTwo
        )
          ? Action.DrawTwo
          : Action.DrawFour;

        if (playerCardIndex == null || playerCard.action != requirement) {
          if (this.log) {
            console.log(
              `Player ${currentPlayerIndex} couldnt respond to the requirment: ${requirement}`
            );
            console.log("His cards:");
            currentPlayer.Cards.forEach(card => {
              console.log(JSON.stringify(card));
            });
          }

          const amount = this.ActionCardRequirmentsHandler.requirements.filter(
            action => action == requirement
          ).length;
          const AmounttoDraw = (requirement == Action.DrawTwo ? 2 : 4) * amount;
          for (let i = 0; i < AmounttoDraw; i++) {
            if (this.Deck.length == 0) {
              this.resetDeck();
            }
            currentPlayer.Cards.push(this.Deck.pop()!);
          }
          if (this.log) {
            console.log(
              `Player ${currentPlayerIndex} has to draw ${AmounttoDraw} cards and has lost his turn`
            );
          }
          this.ActionCardRequirmentsHandler.isActivated = false;
          this.ActionCardRequirmentsHandler.requirements = [];
          currentPlayerIndex =
            (currentPlayerIndex + direction) % this.Players.length;
          if (currentPlayerIndex == -1) {
            currentPlayerIndex = this.Players.length - 1;
          }
          continue;
        } else {
          this.ActionCardRequirmentsHandler.requirements.push(
            playerCard.action
          );
          if (this.log) {
            console.log(
              `Player ${currentPlayerIndex} layed another draw ${requirement} card`
            );
            console.log("His cards:");
            currentPlayer.Cards.forEach(card => {
              console.log(JSON.stringify(card));
            });
            console.log(
              "The requirements are now:" +
                this.ActionCardRequirmentsHandler.requirements
            );
          }

          this.LayedCards.push(playerCard);
          currentPlayer.Cards.splice(playerCardIndex!, 1);

          currentPlayerIndex =
            (currentPlayerIndex + direction) % this.Players.length;
          if (currentPlayerIndex == -1) {
            currentPlayerIndex = this.Players.length - 1;
          }

          continue;
        }
      }

      // check if all requirements are met
      if (this.ActionCardRequirmentsHandler.requirements.length != 0) {
        throw new Error(
          "The requirements are not met" +
            JSON.stringify(this.ActionCardRequirmentsHandler.requirements)
        );
      }
      if (playerCardIndex == null) {
        // if the player has to draw a card because he can't play a card
        const drawnCard = this.Deck.pop()!;
        if (this.log) {
          console.log(
            `Player ${currentPlayerIndex} has to draw a card and has drawn ${JSON.stringify(
              drawnCard
            )}`
          );
        }
        //check if the drawn card can be played
        if (
          drawnCard.color === Color.Any ||
          drawnCard.color ==
            this.LayedCards[this.LayedCards.length - 1].color ||
          drawnCard.value ==
            this.LayedCards[this.LayedCards.length - 1].value ||
          drawnCard.action == Action.Wild ||
          drawnCard.action == Action.DrawFour
        ) {
          if (drawnCard.action == Action.DrawFour) {
            let colorIndex = Math.floor(Math.random() * 4); //TODO make the AI choose the color
            drawnCard.color = numToColor(colorIndex);
            //add the draw 4 card to the requirements
          } else if (drawnCard.action == Action.Wild) {
            let colorIndex = Math.floor(Math.random() * 4);
            drawnCard.color = numToColor(colorIndex);
          }
          if (drawnCard.value == -1) {
            // if the player drew a wild card, draw 4 card, skip or reverse,draw 2 card, check if the player can lay the card
            if (this.log) {
              console.log(
                `Player ${currentPlayerIndex} drew an action card: ${JSON.stringify(
                  drawnCard
                )}`
              );
            }
            if (
              drawnCard.color == Color.Any ||
              drawnCard.color ==
                this.LayedCards[this.LayedCards.length - 1].color ||
              drawnCard.action == Action.DrawFour ||
              drawnCard.action == Action.Wild
            ) {
              // if the player can lay the card
              //lay the card
              currentPlayer.Cards.push(drawnCard);
              this.layCard(currentPlayerIndex, currentPlayer.Cards.length - 1);
            } else {
              currentPlayer.Cards.push(drawnCard);
              if (this.log) {
                console.log(
                  `Player ${currentPlayerIndex} could not play the card he drew, but the game thought he could because he drew an action card`
                );
              }
            }
          } else {
            currentPlayer.Cards.push(drawnCard);
            this.layCard(currentPlayerIndex, currentPlayer.Cards.length - 1);
          }

          if (this.log) {
            console.log(`Player could play the card he drew`);
          }
        } else {
          currentPlayer.Cards.push(drawnCard);
        }
      } else {
        // if the player can play a card
        if (this.log) {
          console.log(
            `Player ${currentPlayerIndex} layed ${JSON.stringify(playerCard)}`
          );
        }
        this.layCard(currentPlayerIndex, playerCardIndex);
      }
      //check if the player has won
      if (this.checkWin(this.Players)) {
        return currentPlayerIndex;
      }
      currentPlayerIndex =
        (currentPlayerIndex + direction) % this.Players.length;
      if (currentPlayerIndex == -1) {
        currentPlayerIndex = this.Players.length - 1;
      }
    }
    return currentPlayerIndex;
  }

  checkWin = (players: Player[]): boolean => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].Cards.length == 0) {
        return true;
      }
    }
    return false;
  };

  initializeCards = (): Card[] => {
    let cards: Card[] = [];
    for (let i = 0; i < 4; i++) {
      const color: Color = numToColor(i);
      for (let j = 0; j < 10; j++) {
        cards.push(new Card(color, j, null));
        if (j != 0) {
          cards.push(new Card(color, j, null));
        }
      }
      for (let j = 0; j < 2; j++) {
        cards.push(new Card(color, -1, Action.DrawTwo));
        cards.push(new Card(color, -1, Action.Reverse));
        cards.push(new Card(color, -1, Action.Skip));
      }
    }
    for (let i = 0; i < 4; i++) {
      cards.push(new Card(Color.Any, -1, Action.Wild));
      cards.push(new Card(Color.Any, -1, Action.DrawFour));
    }
    return cards;
  };

  shuffle = (array: Card[]): Card[] => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex]
      ];
    }
    return array;
  };

  initializePlayers = (
    playersAmount: number,
    Deck: Card[],
    tactics: Tactic[]
  ): Player[] => {
    let players: Player[] = [];
    if (playersAmount < 2 || playersAmount > Deck.length / 7) {
      throw new Error("Invalid amount of players");
    }
    for (let i = 0; i < playersAmount; i++) {
      players.push(new Player(tactics[i]));
      // give players cards
      for (let j = 0; j < 7; j++) {
        players[i].Cards.push(Deck.pop()!);
      }
    }
    return players;
  };
  resetDeck = (): void => {
    //take the cards from the layed cards and put them back in the deck
    //make sure to keep the top card and reset the draw 4 and wild cards to color any
    const topCard = this.LayedCards[this.LayedCards.length - 1];
    this.Deck = this.Deck.concat(this.LayedCards);
    this.Deck.pop();
    this.Deck = this.shuffle(this.Deck);
    this.LayedCards = [topCard];
    for (let i = 0; i < this.Deck.length; i++) {
      if (this.Deck[i].action == Action.DrawFour) {
        this.Deck[i].color = Color.Any;
      }
      if (this.Deck[i].action == Action.Wild) {
        this.Deck[i].color = Color.Any;
      }
    }
    if (this.Deck.length == 1) {
      let out = ``;
      this.Players.forEach((player, i) => {
        out += `${i} has ${player.Cards.length} cards\n`;
      });
      throw new Error(`Not enough cards in the deck! ` + out);
    }
    //reset the action card requirements
  };

  resetActionCardRequirements = (): void => {
    this.ActionCardRequirmentsHandler.isActivated = false;
    this.ActionCardRequirmentsHandler.requirements = [];
  };

  layCard = (playerIndex: number, cardIndex: number): void => {
    //check if the card is an action card and update the action card requirements
    const playerCard = this.Players[playerIndex].Cards[cardIndex];
    if (
      playerCard.action == Action.DrawFour ||
      playerCard.action == Action.DrawTwo ||
      playerCard.action == Action.Skip ||
      playerCard.action == Action.Reverse
    ) {
      this.ActionCardRequirmentsHandler.isActivated = true;
      this.ActionCardRequirmentsHandler.requirements = [playerCard.action];
    }
    //only lay the cards, don't check if the card is valid
    this.LayedCards.push(this.Players[playerIndex].Cards[cardIndex]);
    this.Players[playerIndex].Cards.splice(cardIndex, 1);
  };

  checkHeath = (): void => {
    //if cards are undefined, throw an error
    this.Players.forEach((player, i) => {
      player.Cards.forEach((card, j) => {
        if (
          card.action == undefined &&
          card.color == undefined &&
          card.value == undefined
        ) {
          throw new Error(`Player ${i} card ${j} is undefined`);
        }
      });
    });
    this.Deck.forEach((card, i) => {
      if (
        card.action == undefined &&
        card.color == undefined &&
        card.value == undefined
      ) {
        throw new Error(`Deck card ${i} is undefined`);
      }
    });
    this.LayedCards.forEach((card, i) => {
      if (
        card.action == undefined &&
        card.color == undefined &&
        card.value == undefined
      ) {
        throw new Error(`Layed card ${i} is undefined`);
      }
    });
    //check if all the cards add up to total calculated cards at the start of the game
    let totalCards = 0;
    let playersCards = 0;
    this.Players.forEach((player, i) => {
      playersCards += player.Cards.length;
    });
    totalCards += playersCards;
    totalCards += this.Deck.length;
    totalCards += this.LayedCards.length;

    if (totalCards != this.totalCards) {
      //search which card is missing by comparing the cards to the startCardsList
      let startCardsList = this.startCardsList;
      let cardsList: Card[] = [];
      cardsList = cardsList.concat(this.Deck);
      cardsList = cardsList.concat(this.LayedCards);
      this.Players.forEach((player, i) => {
        cardsList = cardsList.concat(player.Cards);
      });
      // search for the missing card
      for (let i = 0; i < startCardsList.length; i++) {
        for (let j = 0; j < cardsList.length; j++) {
          if (
            startCardsList[i].color == cardsList[j].color &&
            startCardsList[i].value == cardsList[j].value &&
            startCardsList[i].action == cardsList[j].action
          ) {
            break;
          }
        }
      }
      throw new Error(
        `Total cards don't add up! ${totalCards} != ${this.totalCards}`
      );
    }
    //check if the requirements are valid given the layed cards, also account that multiple draw X cards can be layed
    if (this.ActionCardRequirmentsHandler.isActivated) {
      let requirements = this.ActionCardRequirmentsHandler.requirements;
      let topCard = this.LayedCards[this.LayedCards.length - 1];

      if (requirements.includes(Action.Skip)) {
        if (topCard.action != Action.Skip) {
          throw new Error(`Skip requirement not met!`);
        }
      }
      if (requirements.includes(Action.Reverse)) {
        if (topCard.action != Action.Reverse) {
          throw new Error(`Reverse requirement not met!`);
        }
      }
    }
  };
}
