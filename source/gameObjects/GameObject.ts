namespace XEngine {
	declare var mat4: any;
	export class GameObject {
		protected game: Game;
		public isPendingDestroy: boolean;
		public alive: boolean;
		public alpha: number;
		public transform: Transform;

		public persist: boolean;

		public visible: boolean;
		public materials: Array<Material>;


		protected _uv: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32;
		protected gl: WebGL2RenderingContext;

		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			this.game = game;
			this.isPendingDestroy = false;
			this.alive = true;
			this.alpha = 1.0;
			this.transform = new Transform();
			this.transform.position.setTo(posX, posY, posZ);

			this.visible = true;

			this.materials = new Array();

			this.vertDataBuffer = new XEngine.DataBuffer32(24 * 4);

			this._uv = [
				0, 1,   // AR-I
				1, 1,   // AR-D
				1, 0,   // AB-D
				0, 0,   // AB-I
			];

			this.gl = this.game.context;
		}

		public destroy () {
			this.kill();
			this.isPendingDestroy = true;
			if (this.onDestroy !== undefined) {
				this.onDestroy();
			}
		}

		protected onDestroy() { return; }

		public _onInitialize() {
			if (this.materials) {
				for (let i = 0; i < this.materials.length; i ++) {
					if (!this.materials[i].compiled) {
						this.materials[i].initializeShader(this.gl);
					}
				}
				this._setBuffers();
			}
		}

		public kill () {
			this.alive = false;
		}

		public restore (posX: number, posY: number) {
			this.transform.position.x = posX;
			this.transform.position.y = posY;
			this.alive = true;
		}

		public getTotalAlpha () {
			return this.alpha;
		}

		public beginRender(context: WebGLRenderingContext) {
			if (this.transform.dirty) {
				this.transform.calculateMatrix();
			}
		}

		public endRender(context: WebGLRenderingContext) {
			if (this.transform.dirty) {
				this.transform.dirty = false;
			}
		}

		public render (gl: WebGL2RenderingContext, camera: Camera, material?: Material) {
			
		}

		public start () { return; }
		public update (deltaTime) { return; }

		public setVertices(vertices: Array<number>, indices: Array<number>, uv?: Array<number>, vertColors?: Array<number> | number) {
			let renderer = this.game.renderer;
			let material = this.materials;
			let attributes = material[0].getAttributes(renderer);
			let stride = material[0].getAttrStride();
			if (this.indexBuffer) {
				this.gl.deleteBuffer(this.indexBuffer.buffer);
				delete this.indexBuffer;
			}
			if (this.vertexBuffer) {
				this.gl.deleteBuffer(this.vertexBuffer.buffer);
				delete this.vertexBuffer;
			}
			this.vertDataBuffer = new XEngine.DataBuffer32(stride * (vertices.length / 3));
			this.indexDataBuffer = new XEngine.DataBuffer16(2 * indices.length);

			this.vertexBuffer = this.game.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;

			for (const attr in attributes) {
				if (attributes.hasOwnProperty(attr)) {
					const element = attributes[attr];
					this.vertexBuffer.addAttribute(element.gpuLoc, element.items, element.type, element.normalized, stride, element.offset);
				}
			}

			this.indexBuffer = this.game.resourceManager.createBuffer(
				this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW) as IndexBuffer;

			let alpha = this.getTotalAlpha();

			let index = this.vertDataBuffer.allocate(vertices.length);
			let uvIndex = 0;
			let floatBuffer = this.vertDataBuffer.floatView;
			let uintIndexBuffer = this.indexDataBuffer.uintView;
			// tslint:disable-next-line:forin
			for (let i = 0; i < vertices.length; i++) {
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i++];
				floatBuffer[index++] = vertices[i];
				let x = 0;
				let y = 0;
				if (uv !== undefined) {
					x = uv[uvIndex++];
					y = uv[uvIndex++];
				}
				floatBuffer[index++] = x;
				floatBuffer[index++] = y;
				floatBuffer[index++] = 1;
				floatBuffer[index++] = 1;
				floatBuffer[index++] = 1;
				floatBuffer[index++] = alpha;
			}

			index = this.indexDataBuffer.allocate(indices.length);
			for (let i = 0; i < indices.length; i++) {
				uintIndexBuffer[i] = indices[i];
			}

			this.vertexBuffer.updateResource(floatBuffer, 0);
			this.indexBuffer.updateResource(uintIndexBuffer, 0);
		}

		private _setBuffers() {
			// let context = this.gl;
			// this.shader.bind(this.game.renderer);
			// this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 0, 0);
			// this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
			// this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
			// this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
		}
	}
}
