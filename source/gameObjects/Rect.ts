namespace XEngine {
	export class Rect extends GameObject {
		public width: number;
		public height: number;

		constructor(game: Game, posX: number, posY: number, width: number, height: number, color: number) {
			super(game, posX, posY);
			this.width = width;
			this.height = height;
			this.shader = this.game.resourceManager.createShader(SimpleColor, "colorShader");
			this.setColor(color);
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
			this.game.renderer.rectBatch.addRect(this, this.shader);
		}
	}
}
