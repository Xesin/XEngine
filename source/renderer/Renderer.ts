namespace XEngine {

	export class Renderer {

		public clearColor: any;
		public scale: Vector3;
		public gl: WebGL2RenderingContext;
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
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 1.0 };
			this.scale = new Vector3(1);
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true, alpha: false};
			this.gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
		}

		public init() {
			// Si no tenemos ningun contexto GL, date por vencido ahora
			if (!this.gl) {
				alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
				this.gl = null;
			} else {
				this.gl.colorMask(false, false, false, true);
				this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT);
				this.gl.colorMask(true, true, true, false);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT
					| this.gl.DEPTH_BUFFER_BIT); // Limpiar el buffer de color asi como el de profundidad
				this.gl.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));

				this.renderer = null;
			}
		}

		public render(objects: Array<GameObject>, camera: Camera) {
			// Clear the canvas before we start drawing on it.
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
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
				this.gl.activeTexture(position);
				this.gl.bindTexture(this.gl.TEXTURE_2D, null);
				return;
			}
			if (this.currentTexture !== texture || texture.dirty) {
				this.currentTexture = texture;
				if(texture.dirty)
				{
					if(texture.texture != null)
					{
						this.gl.deleteTexture(texture.texture);
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
				this.gl.activeTexture(position);

				// Bind the texture to texture unit 0
				this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
			}
		}

		public bindMaterial(material: Material) {
			if (this.currentMaterial !== material || this.currentMaterial.dirty) {
				this.currentMaterial = material;
				this.currentMaterial.dirty = false;
				this.gl.useProgram(material.shaderProgram);
				this.currentMaterial.bind(this);

				if (this.currentMaterial.depthWrite !== this.depthWriteEnabled) {
					this.depthWriteEnabled = this.currentMaterial.depthWrite;
					this.gl.depthMask(this.currentMaterial.depthWrite);
				}

				if (this.currentMaterial.depthTest !== this.depthTestEnabled) {
					this.depthTestEnabled = this.currentMaterial.depthTest;
					if (this.currentMaterial.depthTest) {
						this.gl.enable(this.gl.DEPTH_TEST);
						this.gl.depthFunc(this.gl.LEQUAL);
					} else {
						this.gl.disable(this.gl.DEPTH_TEST);
					}
				}

				if (this.currentMaterial.transparent !== this.transparencyEnabled) {
					this.transparencyEnabled = this.currentMaterial.transparent;
					if (this.currentMaterial.transparent) {
						switch (this.currentMaterial.blendMode) {
							case BlendMode.Multiply:
								this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
						}
						this.gl.enable(this.gl.BLEND);
					} else {
						this.gl.disable(this.gl.BLEND);
					}
				}

				if (this.currentMaterial.cullFace) {
					if (this.currentMaterial.cullMode !== this.currentCullMode) {
						this.currentCullMode = this.currentMaterial.cullMode;
						switch (this.currentMaterial.cullMode) {
							case CullMode.BACK:
								this.gl.cullFace(this.gl.BACK);
								break;
							case CullMode.FRONT:
								this.gl.cullFace(this.gl.FRONT);
								break;
							case CullMode.BOTH:
								this.gl.cullFace(this.gl.FRONT_AND_BACK);
								break;
							case CullMode.NONE:
								this.gl.cullFace(this.gl.NONE);
								break;
						}
						if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
							this.cullFaceEnabled = this.currentMaterial.cullFace;
							this.gl.enable(this.gl.CULL_FACE);
						}
					}
				} else {
					if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
						this.cullFaceEnabled = this.currentMaterial.cullFace;
						this.gl.disable(this.gl.CULL_FACE);
					}
				}
			}
		}

		public setClearColor(r, g, b, a) {
			this.clearColor.r = r;
			this.clearColor.g = g;
			this.clearColor.b = b;
			this.clearColor.a = a;
			this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
		}

		public renderLoop(arrayObjects, camera: Camera) {
			let _this = this;
			let arrayLenght = arrayObjects.length;

			for (let i = 0; i < arrayLenght; i++) {
				let object = arrayObjects[i];
				if (!object.visible) {continue; }
				if (Group.prototype.isPrototypeOf(object)) {
					object.beginRender(_this.gl);
					_this.renderLoop(object.children, camera);
					object.endRender(_this.gl);
				} else if (!Audio.prototype.isPrototypeOf(object)) {
					let go = object as GameObject;
					if (!go.alive) {continue; }
					go.beginRender(_this.gl);
					go.render(_this.gl, camera);
					go.endRender(_this.gl);
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
