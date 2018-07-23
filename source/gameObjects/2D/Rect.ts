namespace XEngine {
	export class Rect extends TwoDObject {

		constructor(game: Game, posX: number, posY: number, width: number, height: number, color: number) {
			super(game, posX, posY);
			this.transform.width = width;
			this.transform.height = height;
			this.materials[0] = this.game.resourceManager.createMaterial(SimpleColorMat, "colorShader");
			this.setColor(color);
		}

		public beginRender(gl: WebGLRenderingContext) {
			return;
		}

		public renderToCanvas(gl: WebGLRenderingContext) {
			this.game.renderer.rectBatch.addRect(this, this.materials);
		}
	}
}
