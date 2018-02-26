namespace XEngine {

	export class Renderer {

		public clearColor: any;
		public scale: Vector3;
		public context: WebGLRenderingContext;
		public resourceManager: ResourceManager;
		public spriteBatch: SpriteBatcher.SpriteBatch;
		public rectBatch: RectBatcher.RectBatch;
		public currentMaterial: Material;

		private game: Game;
		private renderer: any;
		private sprite: string;
		private currentTexture: WebGLTexture;

		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 0.0 };
			this.scale = new Vector3(1);
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true};
			this.context = canvas.getContext("webgl2", options) as WebGLRenderingContext;
		}

		public init() {
			// Si no tenemos ningun contexto GL, date por vencido ahora
			if (!this.context) {
				alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
				this.context = null;
			} else {
				this.context.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
				this.context.clear(this.context.COLOR_BUFFER_BIT
					| this.context.DEPTH_BUFFER_BIT); // Limpiar el buffer de color asi como el de profundidad
				this.context.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));
				this.resourceManager = this.game.resourceManager;
				this.spriteBatch = new SpriteBatcher.SpriteBatch(this.game, this.context, this);
				// this.rectBatch = new RectBatcher.RectBatch(this.game, this.context, this);
				this.renderer = null;
				this.sprite = undefined;
			}
		}

		public render() {
			this.context.clearDepth(1.0);

			// Clear the canvas before we start drawing on it.
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			this.context.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
			this.renderLoop(this.game.renderQueue);
			if (this.renderer) {
				this.renderer.flush();
				this.renderer = null;
				this.sprite = null;
			}
		}

		public setRenderer(renderer, sprite) {
			if (this.renderer !== renderer || this.sprite !== sprite) {
				if (this.renderer) {
					this.renderer.flush();
				}
			}
			if (renderer && renderer.shouldFlush()) {
				renderer.flush();
			}
			this.renderer = renderer;
			this.sprite = sprite;
		}

		public bindTexture(texture: WebGLTexture, position: number) {
			if (this.currentTexture !== texture) {
				this.currentTexture = texture;

				this.context.activeTexture(position);

				// Bind the texture to texture unit 0
				this.context.bindTexture(this.context.TEXTURE_2D, texture);
			}
		}

		public bindMaterial(material: Material) {
			if (this.currentMaterial !== material) {
				this.currentMaterial = material;
				this.context.useProgram(material.shaderProgram);
				this.currentMaterial.bind(this);

				if (this.currentMaterial.depthWrite) {
					this.context.depthMask(true);
				} else {
					this.context.depthMask(false);
				}

				if (this.currentMaterial.depthTest) {
					this.context.enable(this.context.DEPTH_TEST);
					this.context.depthFunc(this.context.LEQUAL);
				} else {
					this.context.disable(this.context.DEPTH_TEST);
				}

				if (this.currentMaterial.transparent) {
					switch (this.currentMaterial.blendMode) {
						case BlendMode.Multiply:
							this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
					}
					this.context.enable(this.context.BLEND);
				} else {
					this.context.disable(this.context.BLEND);
				}

				if (this.currentMaterial.cullFace) {
					switch (this.currentMaterial.cullMode) {
						case CullMode.BACK:
							this.context.cullFace(this.context.BACK);
							break;
						case CullMode.FRONT:
							this.context.cullFace(this.context.FRONT);
							break;
						case CullMode.BOTH:
							this.context.cullFace(this.context.FRONT_AND_BACK);
							break;
						case CullMode.NONE:
							this.context.cullFace(this.context.NONE);
							break;
					}
					this.context.enable(this.context.CULL_FACE);
				} else {
					this.context.disable(this.context.CULL_FACE);
				}
			}
		}

		public setClearColor(r, g, b, a) {
			this.clearColor.r = r;
			this.clearColor.g = g;
			this.clearColor.b = b;
			this.clearColor.a = a;
			this.context.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
		}

		public renderLoop(arrayObjects) {
			let _this = this;
			let arrayLenght = arrayObjects.length;

			for (let i = 0; i < arrayLenght; i++) {
				let object = arrayObjects[i];
				if (!object.render) {continue; }
				if (Group.prototype.isPrototypeOf(object)) {
					object._beginRender(_this.context);
					_this.renderLoop(object.children);
					object._endRender(_this.context);
				} else if (!Audio.prototype.isPrototypeOf(object)) {
					if (!object.alive) {continue; }
					if (this.game.autoCulling && !object.isInsideCamera()) {continue ; }
					object._beginRender(_this.context);
					object._renderToCanvas(_this.context);
					if (object.body !== undefined) {
						object.body._renderBounds(_this.context);
					}
					object._endRender(_this.context);

				}
			}
			VertexBuffer.SetDiry();
			IndexBuffer.SetDiry();
		}

		public setScale(x, y) {
			this.scale.x = x;
			this.scale.y = y || x;
		}
	}
}
