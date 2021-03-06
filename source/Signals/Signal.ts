import {SignalBinding} from "./SignalBinding";

export class Signal {

    public bindings: Array<SignalBinding>;

    constructor () {
        this.bindings = new Array<SignalBinding>();
    }

    public add(listener: Function, listenerContext: Object) {
        let newBinding = new SignalBinding(this, listener, listenerContext, false);
        this.bindings.push(newBinding);
        return newBinding;
    }

    public addOnce(listener: Function, listenerContext: Object) {
        let newBinding = new SignalBinding(this, listener, listenerContext, true);
        this.bindings.push(newBinding);
        return newBinding;
    }

    public remove(listenerContext: Object) {
        for (let i = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].listenerContext === listenerContext) {
                this.bindings.splice(i, 1);
            }
        }
    }

    public _destroy() {
        delete this.bindings;
        this.bindings = new Array<SignalBinding>();
    }

    public dispatch(..._eventArguments: any[]) {
        for (let i = this.bindings.length - 1; i >= 0; i--) {
            if (this.bindings[i]) {
                try {
                    this.bindings[i].dispatch.apply(this.bindings[i], arguments);
                } catch (error) {
                    console.warn("Exception thrown by dispatching event on: ", this.bindings[i].listenerContext);
                }
            }
        }
    }

}
