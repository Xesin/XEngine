namespace XEngine {

	export class SignalBinding {

		public isOnce = false;
		public listener: Function;
		public listenerContext: Object;

		private signal: Signal;

		constructor (signal: Signal, listener: Function, listenerContext: Object, isOnce: boolean) {
			this.signal = signal;
			this.listener = listener;
			this.listenerContext = listenerContext;
			this.isOnce = isOnce;
		}

		public dispatch() {
			this.listener.apply(this.listenerContext, arguments);
			if (this.isOnce) {
				this.detach();
			}
		}

		public detach() {
			this.signal.remove(this.listenerContext);
		}
	}
}
