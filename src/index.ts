import { Game } from './Classes/Game';
import fs from 'fs';
import { randomTactic } from './Classes/Tactics';

function simulation(){
    //create a error.txt file
    fs.writeFileSync('error.txt', "");

    const startTime =  Date.now();
    //run the simulation for 1000000 times
    const interations =100;
    const printInfoEvery = Math.floor(interations / 1000);
    let currentIteration = 0;
    const playersAmount = 2;
    const tactics = new Array(playersAmount).fill(randomTactic);
    let wins:any = new Object();
    console.log(`\nStarting simulation with ${interations} iterations and ${playersAmount} players at ${new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() }`);
    for(let i = 0; i < playersAmount; i++){
        wins[i] = 0;
    }
    wins["error"] = 0;
 

    for(let i = 0; i < interations; i++){
        try{
        const game = new Game(playersAmount, tactics);
        wins[game.winner!] += 1;
        currentIteration = i;
        if(currentIteration % printInfoEvery == 0){
          // GiveCurrentInfoAboutSimulation(interations,startTime,currentIteration,playersAmount,wins);
        }
        console.log("--------------------");
        }
        catch(e){
            //write the error to error.txt
            fs.appendFileSync('error.txt', e + "\n");
            wins["error"] += 1;
            throw e;
        }
    }
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

function GiveCurrentInfoAboutSimulation(interations:number,startTime:number,currentIteration:number,playersAmount:number,wins:any){
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
    for(let i = 0; i < playersAmount + 1; i++){
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.moveCursor(0,-1);
    }
    }
    console.log(`\r${progressBarString} ${percentage.toFixed(2)}% -- Time left: ${timeLeftInHours.toFixed(0)}h ${timeLeftInMinutes.toFixed(0)}m ${timeLeftInSeconds.toFixed(0)}s`);
    for(let i = 0; i < playersAmount; i++){
        console.log(`Player ${i + 1} won ${((wins[i] / currentIteration) * 100).toFixed(2)}% of the games`);
    }
}
