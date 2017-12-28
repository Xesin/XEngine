namespace XEngine {
	export class Text extends GameObject {

		public font: string;
		public size: number;
		public textColor: string;
		public style: string;
		public strokeWidth: number;
		public strokeColor: string;
		public text: string;

		private canvas: HTMLCanvasElement;
		private context: CanvasRenderingContext2D;
		private texture: WebGLTexture;

		constructor(game: Game, posX: number, posY: number, text: string, textStyle: any) {
			super(game, posX, posY);
			this.text = text || "";
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
			this.width = textSize.width;
			this.height = this.size;
			this.shader = this.game.resourceManager.createMaterial(SimpleColorMat, "spriteShader");
			this.updateText();
		}

		public _beginRender(context: WebGLRenderingContext) {
			super._beginRender(context);
			(this.shader as SpriteMat)._setTexture(this.texture);
			this.shader._beginRender(context);
		}

		public _renderToCanvas(context: WebGLRenderingContext) {
			if (this.shader == null) { return; }
			super._renderToCanvas(context);
		}

		public setText(text: string) {
			this.text = text;
			this.updateText();
		}

		public getBounds(): any {
			let width = this.width * this.scale.x;
			let height = this.height * this.scale.y;
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
			this.width = textSize.width;
			this.height = this.size * 0.8;
			this.canvas.width = textSize.width;
			this.canvas.height = this.height;
			this.context.font = font.trim();
			if (this.strokeWidth > 0) {
				this.context.strokeStyle = this.strokeColor;
				this.context.lineWidth = this.strokeWidth;
				this.context.strokeText(this.text, 0, this.height);
			}
			this.context.fillStyle = this.textColor;
			this.context.fillText(this.text, 0, this.height);
			let texture = new XEngine.Texture2D("textTexture", this.width, this.height, WRAP_MODE.CLAMP);
			texture.image = this.context.canvas;
			texture.createTexture(this.game.context);
			this.texture = texture._texture;
			this._setVertices(this.width, this.height, this.color, this._uv);
		}
	}
}
