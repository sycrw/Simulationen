import { Action } from "../types";
import { Color } from "../types";

export class Card{
    // atributtes
    public color: Color | null;
    public value: number;
    public action: Action | null;

    // constructor takes type of action card if it is an action card else it takes null and number value and 
    constructor(color: Color|null, value: number, action: Action | null){
        this.color = color;
        this.value = value;
        this.action = action;
    }
    
}