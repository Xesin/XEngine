import {Signal} from "../Signals/Signal";
import {KEY_ACTION} from "./KeyAction";

export class ActionMapping {

    public name: string;
    private onKeyDown: Signal;
    private onKeyUp: Signal;

    constructor(name: string) {
        this.name = name;
        this.onKeyDown = new Signal();
        this.onKeyUp = new Signal();
    }

    public executeForAction(keyAction: KEY_ACTION) {
        if (keyAction === KEY_ACTION.PRESSED) {
            this.onKeyDown.dispatch();
        } else {
            this.onKeyUp.dispatch();
        }
    }

    public bindAction(context: Object, callback: Function, keyAction: KEY_ACTION) {
        if (keyAction === KEY_ACTION.PRESSED) {
            this.onKeyDown.add(callback, context);
        } else {
            this.onKeyUp.add(callback, context);
        }
    }

    public unBindAction(context: Object,  keyAction: KEY_ACTION) {
        if (keyAction === KEY_ACTION.PRESSED) {
            this.onKeyDown.remove(context);
        } else {
            this.onKeyUp.remove(context);
        }
    }
}
