namespace XEngine {
	export class Rect extends GameObject {
		public width: number;
		public height: number;

		constructor(game: Game, posX: number, posY: number, width: number, height: number, color: number) {
			super(game, posX, posY);
			this.width = width;
			this.height = height;
			this.materials[0] = this.game.resourceManager.createMaterial(SimpleColorMat, "colorShader");
			this.setColor(color);
		}

		public _beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public _renderToCanvas(gl: WebGLRenderingContext) {
			this.game.renderer.rectBatch.addRect(this, this.materials);
		}
	}
}