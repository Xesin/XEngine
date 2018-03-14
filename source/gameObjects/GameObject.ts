namespace XEngine {
	declare var mat4: any;
	export class GameObject {
		protected game: Game;
		public parent: any;
		public isPendingDestroy: boolean;
		public alive: boolean;
		public alpha: number;
		public transform: Transform;
		public anchor: Vector3;
		public rotation: number;

		public pickeable: boolean;
		public downPos: Vector3;
		public posWhenDown: Vector3;

		public body: any;
		public persist: boolean;

		public render: boolean;
		public fixedToCamera: boolean;
		public materials: Array<Material>;


		public modelMatrix: Array<number>;
		protected _uv: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32;
		protected gl: WebGL2RenderingContext;

		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			this.game = game;
			this.parent = game;
			this.isPendingDestroy = false;
			this.alive = true;
			this.alpha = 1.0;
			this.transform = new Transform();
			this.anchor = new XEngine.Vector3(0, 0);
			this.rotation = 0;
			this.transform.position.setTo(posX, posY, posZ);

			this.render = true;
			this.fixedToCamera = false;

			this.materials = new Array();

			this.vertDataBuffer = new XEngine.DataBuffer32(24 * 4);

			this._uv = [
				0, 1,   // AR-I
				1, 1,   // AR-D
				1, 0,   // AB-D
				0, 0,   // AB-I
			];

			this.gl = this.game.context;
			let gl = this.gl;

			// this._setVertices(this.width, this.height, this.color, this._uv);

			this.modelMatrix = mat4.create();

			mat4.identity(this.modelMatrix);

			this.pickeable = false;
			this.downPos = new XEngine.Vector3(0, 0);
			this.posWhenDown = new XEngine.Vector3(0, 0);
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

		public getWorldMatrix (childMatrix: Array<number>) {
			this.parent.getWorldMatrix(childMatrix);
			let translation =  this.transform.position.toArray();
			if (this.fixedToCamera) {
				translation[0] += this.game.camera.transform.position.x;
				translation[1] += this.game.camera.transform.position.y;
				translation[2] += this.game.camera.transform.position.z;
			}
			mat4.translate(childMatrix, childMatrix, translation);
			mat4.rotateY(childMatrix, childMatrix, this.transform.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(childMatrix, childMatrix, this.transform.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.rotateX(childMatrix, childMatrix, this.transform.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.scale(childMatrix, childMatrix, this.transform.scale.toArray());
			return childMatrix;
		}

		public getWorldPos () {
			let parentPos = this.parent.getWorldPos();
			let x = this.transform.position.x + parentPos.x;
			let y = this.transform.position.y + parentPos.y;
			return new XEngine.Vector3(x, y);
		}

		public getTotalAlpha () {
			let totAlpha = this.alpha;
			if (this.parent.getTotalAlpha !== undefined) {
				totAlpha *= this.parent.getTotalAlpha();
			}
			return totAlpha;
		}

		public _beginRender(context: WebGLRenderingContext) {
			this.game.renderer.setRenderer(null, null);
		}

		public _renderToCanvas (context: WebGLRenderingContext) {
			this.game.renderer.bindMaterial(this.materials[0]);
			this.materials[0].baseUniforms.pMatrix.value = this.game.camera.uiMatrix;
			this.getWorldMatrix(this.modelMatrix);
			this.materials[0].baseUniforms.modelMatrix.value = this.modelMatrix;
			this.materials[0].updateUniforms(context);


			this.vertexBuffer.bind();
			this.indexBuffer.bind();

			context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
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

			this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), this.gl.STREAM_DRAW) as VertexBuffer;

			for (const attr in attributes) {
				if (attributes.hasOwnProperty(attr)) {
					const element = attributes[attr];
					this.vertexBuffer.addAttribute(element.gpuLoc, element.items, element.type, element.normalized, stride, element.offset);
				}
			}

			this.indexBuffer = this.game.renderer.resourceManager.createBuffer(
				this.gl.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer.getByteCapacity(), this.gl.STATIC_DRAW) as IndexBuffer;

			let alpha = this.getTotalAlpha();

			let index = this.vertDataBuffer.allocate(vertices.length);
			let uvIndex = 0;
			let colorIndex = 0;
			let floatBuffer = this.vertDataBuffer.floatView;
			let uintBuffer = this.vertDataBuffer.uintView;
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
			let context = this.gl;
			// this.shader.bind(this.game.renderer);
			// this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 0, 0);
			// this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
			// this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
			// this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
		}
	}
}
