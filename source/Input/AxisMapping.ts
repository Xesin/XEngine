import {Signal} from "../Signals/Signal"

export class AxisMapping {

    public name:string;
    public modifier: number;
    private onExecute: Signal;

    constructor(name: string, modifier: number)
    {
        this.name = name;
        this.onExecute = new Signal();
        this.modifier = modifier;
    }

    public execute(value: number)
    {
        if(Math.abs(value) != 0)
            this.onExecute.dispatch(value * this.modifier);
    }

    public bindAxis(context: Object, callback: Function)
    {
        this.onExecute.add(callback, context);
    }

    public unBindAxis(context: Object)
    {
        this.onExecute.remove(context);
    }
}
