namespace XEngine {

	export class StateManager {

		public currentState: any;
		public currentStateName: string;
		private game: Game;
		private states: Array<any>;

		constructor(game) {
			this.game = game;
			this.states = new Array();
			this.currentState = null;
			this.currentStateName = null;
		}

		public add(stateName, stateClass) {
			this.states[stateName] = stateClass;
		}

		/**
		 * Arranca un estado
		 * @method XEngine.StateManager#start
		 * @param {String} stateName - KeyName del estado
		 */
		public start(stateName) {
			let _this = this;
			if (_this.currentState != null) {
				_this.game.destroy();
				if (_this.currentState.destroy !== undefined) {
					_this.currentState.destroy();
				}
				delete _this.currentState;
				_this.currentState = null;
			}
			let state = _this.states[stateName];

			if (state == null) {
				console.error("no state for name " + stateName);
				return;
			}

			_this.currentState = new state(_this.game);
			if (_this.currentState.update === undefined) {_this.currentState.update = function() {return; }; }
			_this.currentState.game = _this.game;
			_this.currentState.stateName = stateName;
			if (_this.currentState.preload !== undefined) {
				_this.currentState.preload();
			}
			_this.game.scale.updateScale();
			_this.game.load._startPreload();

		}

		/**
		 * Reinicia el estado actual
		 * @method XEngine.StateManager#restart
		 */
		public restart() {
			this.start(this.currentState.stateName);
		}
	}
}
