namespace XEngine {

	export class Renderer {

		public clearColor: any;
		public scale: Vector3;
		public context: WebGL2RenderingContext;
		public currentMaterial: Material;

		public depthWriteEnabled: boolean;
		public depthTestEnabled: boolean;
		public transparencyEnabled: boolean;
		public cullFaceEnabled: boolean;
		public currentCullMode: CullMode;

		public game: Game;
		private renderer: any;
		private currentTexture: Texture2D;


		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 0.0 };
			this.scale = new Vector3(1);
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true};
			this.context = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
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
				// this.rectBatch = new RectBatcher.RectBatch(this.game, this.context, this);
				this.renderer = null;
			}
		}

		public render(objects: Array<GameObject>, camera: Camera) {
			// Clear the canvas before we start drawing on it.
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			this.renderLoop(objects, camera);
			if (this.renderer) {
				this.renderer.flush();
				this.renderer = null;
			}

			for (let i = 0; i < this.game.lights.length; i++) {
				this.game.lights[i].dirty = false;
			}
			camera.dirty = false;
		}

		public bindTexture(texture: Texture2D, position: number) {
			if(texture == null){
				this.context.activeTexture(position);
				this.context.bindTexture(this.context.TEXTURE_2D, null);
				return;
			}
			if (this.currentTexture !== texture || texture.dirty) {
				this.currentTexture = texture;
				if(texture.dirty)
				{
					if(texture.texture != null)
					{
						this.context.deleteTexture(texture.texture);
					}
					texture.texture = this.game.resourceManager.createTexture(
						texture.frameWidth
					  , texture.frameHeight
					  , texture.image
					  , texture.wrapMode
					  , texture.generateMipmaps
					  , texture.isNormal);
					texture.dirty = false;
				}
				this.context.activeTexture(position);

				// Bind the texture to texture unit 0
				this.context.bindTexture(this.context.TEXTURE_2D, texture.texture);
			}
		}

		public bindMaterial(material: Material) {
			if (this.currentMaterial !== material || this.currentMaterial.dirty) {
				this.currentMaterial = material;
				this.currentMaterial.dirty = false;
				this.context.useProgram(material.shaderProgram);
				this.currentMaterial.bind(this);

				if (this.currentMaterial.depthWrite !== this.depthWriteEnabled) {
					this.depthWriteEnabled = this.currentMaterial.depthWrite;
					this.context.depthMask(this.currentMaterial.depthWrite);
				}

				if (this.currentMaterial.depthTest !== this.depthTestEnabled) {
					this.depthTestEnabled = this.currentMaterial.depthTest;
					if (this.currentMaterial.depthTest) {
						this.context.enable(this.context.DEPTH_TEST);
						this.context.depthFunc(this.context.LEQUAL);
					} else {
						this.context.disable(this.context.DEPTH_TEST);
					}
				}

				if (this.currentMaterial.transparent !== this.transparencyEnabled) {
					this.transparencyEnabled = this.currentMaterial.transparent;
					if (this.currentMaterial.transparent) {
						switch (this.currentMaterial.blendMode) {
							case BlendMode.Multiply:
								this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
						}
						this.context.enable(this.context.BLEND);
					} else {
						this.context.disable(this.context.BLEND);
					}
				}

				if (this.currentMaterial.cullFace) {
					if (this.currentMaterial.cullMode !== this.currentCullMode) {
						this.currentCullMode = this.currentMaterial.cullMode;
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
						if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
							this.cullFaceEnabled = this.currentMaterial.cullFace;
							this.context.enable(this.context.CULL_FACE);
						}
					}
				} else {
					if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
						this.cullFaceEnabled = this.currentMaterial.cullFace;
						this.context.disable(this.context.CULL_FACE);
					}
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

		public renderLoop(arrayObjects, camera: Camera) {
			let _this = this;
			let arrayLenght = arrayObjects.length;

			for (let i = 0; i < arrayLenght; i++) {
				let object = arrayObjects[i];
				if (!object.visible) {continue; }
				if (Group.prototype.isPrototypeOf(object)) {
					object.beginRender(_this.context);
					_this.renderLoop(object.children, camera);
					object.endRender(_this.context);
				} else if (!Audio.prototype.isPrototypeOf(object)) {
					let go = object as GameObject;
					if (!go.alive) {continue; }
					go.beginRender(_this.context);
					go.render(_this.context, camera);
					go.endRender(_this.context);
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
