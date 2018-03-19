namespace XEngine {
	export class Text extends TwoDObject {

		public font: string;
		public size: number;
		public textColor: string;
		public style: string;
		public strokeWidth: number;
		public strokeColor: string;
		public text: string;

		public isDirty: boolean;

		private canvas: HTMLCanvasElement;
		private context: CanvasRenderingContext2D;
		private texture: WebGLTexture;

		constructor(game: Game, posX: number, posY: number, text: string, textStyle: any) {
			super(game, posX, posY);
			textStyle = textStyle || {};
			this.font = textStyle.font || "Arial";
			this.size = textStyle.font_size || 12;
			this.textColor = textStyle.font_color || "white";
			this.style = "";
			this.strokeWidth = textStyle.stroke_width || 0;
			this.strokeColor = textStyle.stroke_color || "black";
			this.canvas = document.createElement("canvas");
			this.context = this.canvas.getContext("2d");
			this.context.save();
			this.context.font = this.size + "px " + this.font;
			let textSize = this.context.measureText(this.text);
			this.context.restore();
			this.transform.width = textSize.width;
			this.transform.height = this.size;
			this.materials[0] = this.game.resourceManager.createMaterial(SpriteMat, "spriteShader");
			this.setText(text);
		}

		public beginRender(context: WebGLRenderingContext) {
			super.beginRender(context);
			(this.materials[0] as SpriteMat)._setTexture(this.texture);
		}

		public renderToCanvas (context: WebGL2RenderingContext, viewMatrix: Mat4, pMatrix: Array<number>, eyePos: Vector3, material?: Material) {
			if (this.materials == null) { return; }
			super.renderToCanvas(context, viewMatrix, pMatrix, eyePos, material);
		}

		public setText(text: string) {
			this.isDirty = true;
			this.text = text;
			this.updateText();
			this.transform.calculateMatrix();
		}

		public getBounds(): any {
			let width = this.transform.width * this.transform.scale.x;
			let height = this.transform.height * this.transform.scale.y;
			return {
				width: width,
				height: height,
			};
		}

		private updateText() {
			this.context.globalAlpha = this.alpha;
			let font = this.style + " " + this.size + "px " + this.font;
			this.context.font = font.trim();
			let textSize = this.context.measureText(this.text);
			this.transform.width = textSize.width;
			this.transform.height = this.size;
			this.canvas.width = textSize.width;
			this.canvas.height = this.transform.height;
			this.context.font = font.trim();
			if (this.strokeWidth > 0) {
				this.context.strokeStyle = this.strokeColor;
				this.context.lineWidth = this.strokeWidth;
				this.context.strokeText(this.text, 0, this.transform.height);
			}
			this.context.fillStyle = this.textColor;
			this.context.textBaseline = "top";
			this.context.textAlign = "left";
			this.context.fillText(this.text, 0, 0);
			let texture = new XEngine.Texture2D("textTexture", this.transform.width, this.transform.height, WRAP_MODE.CLAMP, false);
			texture.image = this.context.canvas;
			texture.createTexture(this.game.context);
			this.texture = texture._texture;
			this.materials[0].dirty = true;
			this._setVertices(this.transform.width, this.transform.height, this.color, this._uv);
		}
	}
}
