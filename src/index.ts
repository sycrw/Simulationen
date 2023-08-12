import { alwaysDraw, cardCounting, firstCard, keepManyColors, keepManyActionCards,playAllActionCards } from './Classes/Tactics';

import { Game } from './Classes/Game';
import { Tactic } from './types';
import fs from 'fs';

function simulation(){
    //create a error.txt file and make a new line
    fs.writeFileSync('error.txt', "\n");
    const startTime =  Date.now();
    //run the simulation a 20 Million times
    const interations = 1_000_000;
    const printInfoEvery = 10_000;
    let currentIteration = 0;
    const playersAmount = 2;
    const tactics = new Array(playersAmount).fill(keepManyColors);
    tactics[0] = keepManyActionCards;
    tactics[1] = playAllActionCards;
    //tactics[0] = keepManyActionCards;
    const detailsAboutGame:boolean = false;
    let totalMovesOfAllGames = 0;
    let AverageMovesOfAllGames = 0;

    let wins:any = {};
    console.log(`\nStarting simulation with ${interations} iterations and ${playersAmount} players at ${new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() }`);
    for(let i = 0; i < playersAmount; i++){
        wins[i] = 0;
    }
    wins["error"] = 0;
    //write that simulation started to log.txt
    fs.appendFileSync('log.txt', `Simulation started at ${new Date(startTime).toLocaleDateString() + " " + new Date(startTime).toLocaleTimeString() }\n`);

    for(let i = 0; i < interations; i++){

        try{
        const game = new Game(playersAmount, tactics, detailsAboutGame);
        wins[game.winner!] += 1;
        totalMovesOfAllGames += game.round;
        AverageMovesOfAllGames = totalMovesOfAllGames / (i + 1);
        currentIteration = i;
        if(currentIteration % printInfoEvery == 0){
          GiveCurrentInfoAboutSimulation(interations,startTime,currentIteration,playersAmount,wins,tactics,AverageMovesOfAllGames);
        }
        }
        catch(e:any){
            //write the error to error.txt
            fs.appendFileSync('error.txt', e + "\n");
            wins["error"] += 1;
            if(detailsAboutGame){
                throw e;
            }
        }
    }
    //log results to log.txt with the amout of player, their wins and the tactics they used to win, and the time it took and the time it started, and the amount of iterations. In an easy to read format and logical order
    fs.appendFileSync('simulations.txt', `Simulation with ${playersAmount} players finished at ${new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() }\n`);
    fs.appendFileSync('simulations.txt', `Simulation started at ${new Date(startTime).toLocaleDateString() + " " + new Date(startTime).toLocaleTimeString() }\n`);
    fs.appendFileSync('simulations.txt', `Time it took: ${Math.floor((Date.now() - startTime) / 1000 / 60 / 60)}h ${Math.floor((Date.now() - startTime) / 1000 / 60 - Math.floor((Date.now() - startTime) / 1000 / 60 / 60) * 60)}m ${Math.floor((Date.now() - startTime) / 1000 - Math.floor((Date.now() - startTime) / 1000 / 60) * 60)}s\n`);
    fs.appendFileSync('simulations.txt', `Iterations: ${interations}\n`);
    fs.appendFileSync('simulations.txt', `Wins: ${JSON.stringify(wins)}\n`);
    for(let i = 0; i < playersAmount; i++){
        fs.appendFileSync('simulations.txt', `Player(${tactics[i].name}) ${i + 1} won ${((wins[i] / interations) * 100).toFixed(2)}% of the games\n`);
    }
    fs.appendFileSync('simulations.txt', `The Simulation errored ${(wins["error"] / interations * 100).toFixed(2)}% of the times\n`);
    fs.appendFileSync('simulations.txt', `\n`);

    //print out the results and the time it took in h m s
    console.log(`\nSimulation started at ${new Date(startTime).toLocaleDateString() + " " + new Date(startTime).toLocaleTimeString() }`);
    console.log(`Simulation finished at ${new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() }`);
    console.log(`Time it took: ${Math.floor((Date.now() - startTime) / 1000 / 60 / 60)}h ${Math.floor((Date.now() - startTime) / 1000 / 60 - Math.floor((Date.now() - startTime) / 1000 / 60 / 60) * 60)}m ${Math.floor((Date.now() - startTime) / 1000 - Math.floor((Date.now() - startTime) / 1000 / 60) * 60)}s`);
    console.log(`Wins: ${JSON.stringify(wins)}`);
    //procent of wins
    for(let i = 0; i < playersAmount; i++){
        console.log(`Player ${i + 1} won ${((wins[i] / interations) * 100).toFixed(2)}% of the games`);
    }
    
}
simulation();

function GiveCurrentInfoAboutSimulation(interations:number,startTime:number,currentIteration:number,playersAmount:number,wins:any,tactics:any,AverageMovesOfAllGames:number){
    //print out a progress bar that doesnt use a new line and the estimated time left
    const timeElapsed = Date.now() - startTime;
    const timePerIteration = timeElapsed / (currentIteration + 1);
    const timeLeft = (interations - currentIteration) * timePerIteration;
    
    const percentage = (currentIteration / interations) * 100;

    const progressBar = Math.round(percentage );

    let progressBarString = "[";
    for(let i = 0; i < progressBar; i++){
        progressBarString += "=";
    }
    for(let i = 0; i < 100 - progressBar; i++){
        progressBarString += ".";
    }
    progressBarString += "]";

    const timeLeftInHours = Math.floor(timeLeft / 1000 / 60 / 60);
    const timeLeftInMinutes = Math.floor(timeLeft / 1000 / 60 - timeLeftInHours * 60); 
    const timeLeftInSeconds = Math.floor(timeLeft / 1000 - timeLeftInMinutes * 60 - timeLeftInHours * 60 * 60); 


    //clear the last lines in the console
    if(currentIteration != 0){
    for(let i = 0; i < playersAmount + 3; i++){
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.moveCursor(0,-1);
    }
    }
    console.log(`\r${progressBarString} ${percentage.toFixed(2)}% -- Time left: ${timeLeftInHours.toFixed(0)}h ${timeLeftInMinutes.toFixed(0)}m ${timeLeftInSeconds.toFixed(0)}s`);
    console.log(`Current iteration: ${currentIteration + 1}`);
    console.log(`Average moves of all games: ${AverageMovesOfAllGames.toFixed(2)}`);
    for(let i = 0; i < playersAmount; i++){
        console.log(`Player ${i + 1} (${tactics[i].name}) won ${((wins[i] / currentIteration) * 100).toFixed(2)}% of the games`);
    }
}
