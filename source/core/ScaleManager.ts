namespace XEngine {

	export enum Scale {
		FIT,
		SHOW_ALL,
		NO_SCALE,
	}

	export class ScaleManager {

		public scaleType: Scale;
		public orientation: string;
		public sourceAspectRatio: number;
		private game: Game;

		constructor(game) {
			this.game = game;
			this.scaleType = Scale.NO_SCALE;
			this.orientation = "landScape";
			this.sourceAspectRatio = 0;
		}

		public init() {
			let _this = this;
			let onWindowsResize = function (event) {
				_this.onWindowsResize(event);
			};
			window.addEventListener("resize", onWindowsResize, true);
		}

		public updateScale() {
			if (this.scaleType !== XEngine.Scale.NO_SCALE) {
				let newWidth = 0;
				let newHeight = 0;
				if (this.scaleType === XEngine.Scale.FIT) {
					newWidth = window.innerWidth;
					newHeight = window.innerHeight;
				} else {
					this.sourceAspectRatio = this.game.width / this.game.height;
					newHeight = window.innerHeight;
					newWidth = newHeight * this.sourceAspectRatio;
					if (newWidth > window.innerWidth) {
						newWidth = window.innerWidth;
						newHeight = newWidth / this.sourceAspectRatio;
					}
				}
				newWidth = Math.round(newWidth);
				newHeight = Math.round(newHeight);
				this.resizeCanvas(newWidth, newHeight);
			}
		}

		private resizeCanvas(newWidth, newHeight) {
			this.game.canvas.setAttribute("width", newWidth);
			this.game.canvas.setAttribute("height", newHeight);
			this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
			this.game.context.viewport(0, 0, newWidth, newHeight);
		}

		private onWindowsResize(event) {
			this.updateScale();
		}
	}
}
