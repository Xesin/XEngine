namespace XEngine {
	export class InputManager {
		public onKeyDown: Signal;
		public onKeyUp: Signal;
		public onClick: Signal;
		public onInputDown: Signal;
		public onInputUp: Signal;
		public onInputMove: Signal;
		public pointerDown: boolean;
		public pointer: Vector3;

		private keysPressed: Array<boolean>;
		private game: Game;

		constructor(game: Game) {
			this.game = game;
			this.onKeyDown = new Signal();
			this.onKeyUp = new Signal();
			this.onClick = new Signal();
			this.onInputDown = new Signal();
			this.onInputUp = new Signal();
			this.onInputMove = new Signal();
			this.pointerDown = false;
			this.pointer = new Vector3(0);

			let _this = this;
			document.addEventListener("keydown", function (event) {
				_this.keyDownHandler.call(_this, event);
			});
			document.addEventListener("keyup", function (event) {
				_this.keyUpHandler.call(_this, event);
			});

			if (this.game.isMobile) {
				this.game.canvas.addEventListener("touchstart", function (event) {
					_this.inputDownHandler.call(_this, event);
				});
				this.game.canvas.addEventListener("touchend", function (event) {
					_this.inputUpHandler.call(_this, event);
				});
				this.game.canvas.addEventListener("touchmove", function (event) {
					_this.inputMoveHandler.call(_this, event);
				});
			} else {
				this.game.canvas.addEventListener("mousedown", function (event) {
					_this.inputDownHandler.call(_this, event);
				});
				this.game.canvas.addEventListener("mouseup", function (event) {
					_this.inputUpHandler.call(_this, event);
				});
				this.game.canvas.addEventListener("mousemove", function (event) {
					_this.inputMoveHandler.call(_this, event);
				});
				this.game.canvas.addEventListener("click", function (event) {
					_this.clickHandler.call(_this, event);
				});
			}
			this._initializeKeys();
		}

		public _initializeKeys() {
			this.keysPressed = new Array();
			// tslint:disable-next-line:forin
			for (let item in KEY_CODE) {
				this.keysPressed[item] = false;
			}
		}

		public isDown(keyCode: KEY_CODE): boolean {
			return this.keysPressed[keyCode];
		}

		public reset() {
			this.onKeyUp._destroy();
			this.onKeyDown._destroy();
			this.onClick._destroy();
			this.onInputDown._destroy();
			this.onInputUp._destroy();
			this.onInputMove._destroy();
			this._initializeKeys();
		}

		private keyDownHandler(event: any) {
			if (!this.keysPressed[event.keyCode]) {
				this.keysPressed[event.keyCode] = true;
				this.onKeyDown.dispatch(event);
			}
		}

		private keyUpHandler(event: any) {
			this.keysPressed[event.keyCode] = false;
			this.onKeyUp.dispatch(event);
		}

		private inputDownHandler() {
			this.pointerDown = true;
			let inputPos = this.getInputPosition(event);
			this.pointer.x = inputPos.position.x;
			this.pointer.y = inputPos.position.y;
			this.onInputDown.dispatch(inputPos);
			let _this = this;
		}



		private inputUpHandler() {
			this.pointerDown = false;
			let newEvent = {
				position: {
					x: this.pointer.x,
					y: this.pointer.y,
				},
			};
			if (this.game.isMobile) {
				this.clickDispatcher(newEvent);
			}
			this.onInputUp.dispatch(newEvent);

			let _this = this;
			let loop = function (array) {
				for (let i = array.length - 1; i >= 0; i--) {
					let gameObject = array[i];
					if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
						loop(gameObject.children);
					} else {
						if (!gameObject.inputEnabled) {continue; }
						if (gameObject.isInputDown) {

							if (gameObject.onInputUp === undefined) {
								gameObject.onInputUp = new XEngine.Signal();
							}
							gameObject.onInputUp.dispatch(event);
							gameObject.isInputDown = false;
							return true;
						}
					}

				}
			};

			loop(this.game.updateQueue);
		}

		private inputMoveHandler() {
			let inputPos = this.getInputPosition(event);
			inputPos.deltaX = this.pointer.x - inputPos.position.x;
			inputPos.deltaY = this.pointer.y - inputPos.position.y;
			this.pointer.x = inputPos.position.x;
			this.pointer.y = inputPos.position.y;
			let _this = this;

			this.onInputMove.dispatch(inputPos);
		}

		private clickHandler(event: any) {
			let inputPos = this.getInputPosition(event);
			this.clickDispatcher(inputPos);
		}

		private clickDispatcher(event: any) {
			this.onClick.dispatch(event);
			let _this = this;
		}

		private getInputPosition(event: any): any {
			let rect = this.game.canvas.getBoundingClientRect();
			let newEvent = {
				position: {
					x: event.pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
					y: event.pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top,
				},
			};

			if (this.game.isMobile) {
				newEvent = {
					position: {
						x: event.touches[0].pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
						y: event.touches[0].pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top,
					},
				};
			}
			newEvent.position.x /= this.game.renderer.scale.x;
			newEvent.position.y /= this.game.renderer.scale.y;
			return newEvent;
		}
	}
}
