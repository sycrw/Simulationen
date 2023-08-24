import {
  alwaysDraw,
  cardCounting,
  firstCard,
  keepManyColors,
  keepManyActionCards,
  playAllActionCards,
  keepPlusCardsAndPlayAction
} from "./Classes/Tactics";
import { Game } from "./Classes/Game";
import { Tactic } from "./types";
import fs from "fs";

//test all tactics against each other and save the results in a csv with the name of the tactic and the winrate
testAllTactics();
function testAllTactics() {
  const tactics: Tactic[] = [
    cardCounting,
    firstCard,
    keepManyColors,
    keepManyActionCards,
    playAllActionCards,
    keepPlusCardsAndPlayAction
  ];

  //time logging and prodiction
  const testStartTime = Date.now();

  let heading = "Tactic;";
  for (let i = 0; i < tactics.length; i++) {
    heading += `${tactics[i].name};`;
  }
  heading += "\n";
  fs.writeFileSync("results.csv", heading);
  for (let i = 0; i < tactics.length; i++) {
    //in next line of the csv write the name of the tactic
    let line = `${tactics[i].name};`;
    for (let j = 0; j < tactics.length; j++) {
      const started = Date.now();
      const inputTactics = [tactics[i], tactics[j]];
      const results = simulation(inputTactics);
      line += `${results[tactics[i].name].toFixed(2)};`;
      //log make the log colorful
      console.log(
        `\n${tactics[i].name} vs ${
          tactics[j].name
        } finished at ${new Date().toLocaleTimeString()}`
      );
      console.log(
        `Time it took: ${Math.floor(
          (Date.now() - started) / 1000 / 60
        )}m ${Math.floor(
          (Date.now() - started) / 1000 -
            Math.floor((Date.now() - started) / 1000 / 60) * 60
        )}s`
      );
      //log the time estimated time left
      const timeElapsed = Date.now() - testStartTime;
      const timePerIteration = timeElapsed / (i * tactics.length + j + 1);
      const timeLeft =
        (tactics.length * tactics.length - (i * tactics.length + j)) *
        timePerIteration;
      const timeLeftInHours = Math.floor(timeLeft / 1000 / 60 / 60);
      const timeLeftInMinutes = Math.floor(
        timeLeft / 1000 / 60 - timeLeftInHours * 60
      );
      console.log(
        `Time left: ${timeLeftInHours.toFixed(0)}h ${timeLeftInMinutes.toFixed(
          0
        )}m`
      );
    }
    line += "\n";
    fs.appendFileSync("results.csv", line);
    //log colorful that the tactic is done
    console.log(
      "\x1b[31m",
      `${tactics[i].name} is done at ${new Date().toLocaleTimeString()}`,
      "\x1b[0m"
    );
  }
}

function simulation(inputTactics: Tactic[]) {
  //create a error.txt file and make a new line
  const startTime = Date.now();
  //run the simulation a 20 Million times
  const interations = 100_000;
  const printInfoEvery = 1;
  let currentIteration = 0;
  const playersAmount = inputTactics.length;
  const tactics = inputTactics;

  const detailsAboutGame: boolean = false;
  let totalMovesOfAllGames = 0;
  let AverageMovesOfAllGames = 0;

  let wins: any = {};
  if (!inputTactics) {
    console.log(
      `\nStarting simulation with ${interations} iterations and ${playersAmount} players at ${new Date().toLocaleDateString() +
        " " +
        new Date().toLocaleTimeString()}`
    );
  }
  for (let i = 0; i < playersAmount; i++) {
    wins[i] = 0;
  }
  wins["error"] = 0;
  for (let i = 0; i < interations; i++) {
    try {
      let inputTactics = arrayRotate(tactics, i % playersAmount);
      const game = new Game(playersAmount, inputTactics, detailsAboutGame);
      wins[(game.winner! + (i % playersAmount)) % playersAmount] += 1;
      totalMovesOfAllGames += game.round;
      AverageMovesOfAllGames = totalMovesOfAllGames / (i + 1);
      currentIteration = i;
      if (currentIteration % printInfoEvery == 0) {
        GiveCurrentInfoAboutSimulation(
          interations,
          startTime,
          currentIteration,
          playersAmount,
          wins,
          tactics,
          AverageMovesOfAllGames
        );
      }
      //move tactics to the right
    } catch (e) {
      //write the error to error.txt
      wins["error"] += 1;
      if (detailsAboutGame) {
        throw e;
      }
    }
  }
  if (!inputTactics) {
    //print out the results and the time it took in h m s
    console.log(
      `\nSimulation started at ${new Date(startTime).toLocaleDateString() +
        " " +
        new Date(startTime).toLocaleTimeString()}`
    );
    console.log(
      `Simulation finished at ${new Date().toLocaleDateString() +
        " " +
        new Date().toLocaleTimeString()}`
    );
    console.log(
      `Time it took: ${Math.floor(
        (Date.now() - startTime) / 1000 / 60 / 60
      )}h ${Math.floor(
        (Date.now() - startTime) / 1000 / 60 -
          Math.floor((Date.now() - startTime) / 1000 / 60 / 60) * 60
      )}m ${Math.floor(
        (Date.now() - startTime) / 1000 -
          Math.floor((Date.now() - startTime) / 1000 / 60) * 60
      )}s`
    );
    console.log(`Wins: ${JSON.stringify(wins)}`);
    //procent of wins
    for (let i = 0; i < playersAmount; i++) {
      console.log(
        `Player ${i + 1} won ${((wins[i] / interations) * 100).toFixed(
          2
        )}% of the games`
      );
    }
  }
  let returnObject: any = {};
  for (let i = 0; i < tactics.length; i++) {
    returnObject[tactics[i].name] = (wins[i] / interations) * 100;
  }
  return returnObject;
}

function GiveCurrentInfoAboutSimulation(
  interations: number,
  startTime: number,
  currentIteration: number,
  playersAmount: number,
  wins: any,
  tactics: any,
  AverageMovesOfAllGames: number
) {
  //print out a progress bar that doesnt use a new line and the estimated time left
  const timeElapsed = Date.now() - startTime;
  const timePerIteration = timeElapsed / (currentIteration + 1);
  const timeLeft = (interations - currentIteration) * timePerIteration;

  const percentage = (currentIteration / interations) * 100;

  const progressBar = Math.round(percentage);

  let progressBarString = "[";
  for (let i = 0; i < progressBar; i++) {
    progressBarString += "=";
  }
  for (let i = 0; i < 100 - progressBar; i++) {
    progressBarString += ".";
  }
  progressBarString += "]";

  const timeLeftInHours = Math.floor(timeLeft / 1000 / 60 / 60);
  const timeLeftInMinutes = Math.floor(
    timeLeft / 1000 / 60 - timeLeftInHours * 60
  );
  const timeLeftInSeconds = Math.floor(
    timeLeft / 1000 - timeLeftInMinutes * 60 - timeLeftInHours * 60 * 60
  );

  //clear the last lines in the console
  if (currentIteration != 0) {
    for (let i = 0; i < playersAmount + 3; i++) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.moveCursor(0, -1);
    }
  }
  console.log(
    `\r${progressBarString} ${percentage.toFixed(
      2
    )}% -- Time left: ${timeLeftInHours.toFixed(
      0
    )}h ${timeLeftInMinutes.toFixed(0)}m ${timeLeftInSeconds.toFixed(0)}s`
  );
  console.log(`Current iteration: ${currentIteration + 1}`);
  console.log(
    `Average moves of all games: ${AverageMovesOfAllGames.toFixed(2)}`
  );
  for (let i = 0; i < playersAmount; i++) {
    console.log(
      `Player ${i + 1} (${tactics[i].name}) won ${(
        (wins[i] / currentIteration) *
        100
      ).toFixed(2)}% of the games`
    );
  }
}

function arrayRotate(arr: any[], count: number) {
  let changedArray = [...arr];
  const len = changedArray.length;
  changedArray.push(...changedArray.splice(0, ((-count % len) + len) % len));
  return changedArray;
}
