import { Game } from './Classes/Game';
import { randomTactic } from './Classes/Tactics';

function simulation(){
    const interations =33;
    let currentIteration = 0;
    const playersAmount = 2;
    let wins:any = new Object();
    for(let i = 0; i < playersAmount; i++){
        wins[i] = 0;
    }
    for(let i = 0; i < interations; i++){
        const game = new Game(playersAmount, [randomTactic, randomTactic]);
        wins[game.winner!] += 1;
        currentIteration = i;
        console.log("Iteration: " + currentIteration + " out of " + interations);
    }
    console.log(wins);
}

simulation();