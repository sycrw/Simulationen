import { Action } from "../types";
import { Color } from "../types";

export class Card{
    // atributtes
    public color: Color;
    public value: number;
    public action: Action | null;

    // constructor takes type of action card if it is an action card else it takes null and number value and 
    constructor(color: Color, value: number, action: Action | null){
        console.log("Card created");
        this.color = color;
        this.value = value;
        this.action = action;
    }
    
}