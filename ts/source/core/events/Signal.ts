namespace XEngine {

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
			for (let i = 0; i < this.bindings.length; i++){
				if (this.bindings[i].listenerContext === listenerContext) {
					this.bindings.splice(i, 1);
				}
			}
		}

		public _destroy() {
			delete this.bindings;
			this.bindings = new Array<SignalBinding>();
		}

		public dispatch(...eventArguments: any[]) {
			this._cleanup();
			for (let i = 0; i < this.bindings.length; i++) {
				this.bindings[i].dispatch.apply(this.bindings[i], arguments);
			}
		}

		public _cleanup() {
			for (let i = this.bindings.length - 1; i >= 0; i--) {
				if (this.bindings[i] == null || this.bindings[i] === undefined) {
					this.bindings.splice(i, 1);
				}
			}
		}
	}
}
