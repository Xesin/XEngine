namespace XEngine {
	declare var mat4: any;
	export class GameObject {
		protected game: Game;
		public parent: any;
		public isPendingDestroy: boolean;
		public alive: boolean;
		public alpha: number;
		public transform: Transform;
		public anchor: Vector;
		public rotation: number;

		public width: number;
		public height: number;
		public isometric: boolean;
		public pickeable: boolean;
		public downPos: Vector;
		public posWhenDown: Vector;
		public color: number;
		public body: any;
		public persist: boolean;

		public onClick: Signal;
		public onInputDown: Signal;
		public onInputOver: Signal;
		public onInputUp: Signal;
		public onInputLeft: Signal;
		public inputEnabled: boolean;
		public isInputDown: boolean;
		public isInputOver: boolean;

		public render: boolean;
		public fixedToCamera: boolean;
		public shader: Material;
		public mask: GameObject;
		public sprite: string;
		public modelMatrix: Array<number>;
		protected _uv: Array<number>;
		protected indexDataBuffer: XEngine.DataBuffer16;
		protected vertDataBuffer: DataBuffer32;
		protected gl: WebGLRenderingContext;

		protected indexBuffer: IndexBuffer;
		protected vertexBuffer: VertexBuffer;

		private _prevWidth: number;
		private _prevHeight: number;
		private _prevPos: any;

		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			this.game = game;
			this.parent = game;
			this.isPendingDestroy = false;
			this.alive = true;
			this.alpha = 1.0;
			this.transform = new Transform();
			this.anchor = new XEngine.Vector(0, 0);
			this.rotation = 0;
			this.transform.position.setTo(posX, posY, posZ);
			this.onClick = new XEngine.Signal();
			this.onInputDown = new XEngine.Signal();
			this.onInputUp = new XEngine.Signal();
			this.onInputOver = new XEngine.Signal();
			this.onInputLeft = new XEngine.Signal();
			this.inputEnabled = false;
			this.render = true;
			this.fixedToCamera = false;
			this.isometric = false;
			this.isInputDown = false;

			this.width = 0;
			this.height = 0;
			this._prevWidth = 0;
			this._prevHeight = 0;
			this._prevPos = {x: 0, y: 0 };
			this.shader = null;

			this.vertDataBuffer = new XEngine.DataBuffer32(24 * 4);

			this._uv = [
				0, 1,
				0, 0,
				1, 1,
				1, 0,
			];

			this.gl = this.game.context;
			let gl = this.gl;

			// this._setVertices(this.width, this.height, this.color, this._uv);

			this.mask = null;

			this.modelMatrix = mat4.create();

			mat4.identity(this.modelMatrix);

			this.pickeable = false;
			this.downPos = new XEngine.Vector(0, 0);
			this.posWhenDown = new XEngine.Vector(0, 0);
			this.color = (0xffffff >> 16) + (0xffffff & 0xff00) + ((0xffffff & 0xff) << 16);
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
			if (this.shader) {
				if (!this.shader.compiled) {
					this.shader.initializeShader(this.gl);
				}
				this._setBuffers();
			}
		}

		public setColor(value: number, a = 1.0) {
			this.color = value;
			this.alpha = a;
			this._setVertices(this.width, this.height, this.color, this._uv);
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
			let translation = [this.transform.position.x, this.transform.position.y, this.transform.position.z];
			if (this.fixedToCamera) {
				translation[0] += this.game.camera.transform.position.x;
				translation[1] += this.game.camera.transform.position.y;
				translation[2] += this.game.camera.transform.position.z;
			}
			let anchorX = Math.round(-(this.width * this.anchor.x));
			let anchorY = Math.round(-(this.height * this.anchor.y));
			mat4.translate(childMatrix, childMatrix, translation);
			mat4.rotateX(childMatrix, childMatrix, this.transform.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.rotateY(childMatrix, childMatrix, this.transform.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(childMatrix, childMatrix, this.transform.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.scale(childMatrix, childMatrix, [this.transform.scale.x, this.transform.scale.y, this.transform.scale.z]);
			mat4.translate(childMatrix, childMatrix, [anchorX, anchorY, 0]);
			return childMatrix;
		}

		public getWorldPos () {
			let parentPos = this.parent.getWorldPos();
			let x = this.transform.position.x + parentPos.x;
			let y = this.transform.position.y + parentPos.y;
			return new XEngine.Vector(x, y);
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
			this.shader.bind(this.game.renderer);
			this.shader.baseUniforms.pMatrix.value = this.game.camera.uiMatrix;
			this.getWorldMatrix(this.modelMatrix);
			this.shader.baseUniforms.modelMatrix.value = this.modelMatrix;
			this.shader.updateUniforms(context);

			if (this._prevHeight !== this.height ||
				this._prevWidth !== this.width ||
				this._prevPos.x !== this.transform.position.x ||
				this._prevPos.y !== this.transform.position.y) {
				this._setVertices(this.width, this.height, this.color, this._uv);
				this._prevHeight = this.height;
				this._prevWidth = this.width;
				this._prevPos.x = this.transform.position.x;
				this._prevPos.y = this.transform.position.y;
			}
			this.vertexBuffer.bind();
			this.indexBuffer.bind();

			context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
		}

		public rendermask(gl: WebGLRenderingContext) {
			// disable color (u can also disable here the depth buffers)
			gl.colorMask(false, false, false, false);

			// Replacing the values at the stencil buffer to 1 on every pixel we draw
			gl.stencilFunc(gl.ALWAYS, 1, 1);
			gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

			gl.enable(gl.STENCIL_TEST);
			if (this.sprite) {
				let cache_image = this.game.cache.image(this.sprite);
				(this.shader as SpriteMat)._setTexture(cache_image._texture);
			}

			this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			this.shader.updateUniforms(gl);

			this.vertexBuffer.bind();
			this.indexBuffer.bind();

			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
			// enabling back the color buffer
			// Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
			gl.stencilFunc(gl.EQUAL, 1, 1);
			gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
			gl.colorMask(true, true, true, true);
		}

		public endRendermask(gl: WebGLRenderingContext) {
			gl.disable(gl.STENCIL_TEST);
			gl.clear(gl.STENCIL_BUFFER_BIT);
		}

		public _endRender(gl: WebGLRenderingContext) {
			if (this.mask != null) {
				return;
			}
		}

		public getBounds (): any {
			let width = this.width * this.transform.scale.x;
			let height = this.height * this.transform.scale.y;
			let worldPos = this.getWorldPos();
			let widthAnchor = width * this.anchor.x;
			let heightAnchor = height * this.anchor.y;
			let minX = worldPos.x - widthAnchor;
			let maxX = worldPos.x + width - widthAnchor;
			let minY = worldPos.y - heightAnchor;
			let maxY = worldPos.y + height - heightAnchor;
			return {
				height: height,
				maxX: maxX,
				maxY: maxY,
				minX: minX,
				minY: minY,
				width: width,
			};
		}

		public isInsideCamera(): boolean {
			let bounds = this.getBounds();
			let worldPos = this.getWorldPos();
			let cameraPos = this.game.camera.transform.position;
			let viewRect = {width: this.game.width, height: this.game.height};
			if (bounds.maxX < cameraPos.x) { return false; }
			if (bounds.maxY < cameraPos.y) { return false; }
			if (bounds.minX > cameraPos.x + viewRect.width) {return false; }
			if (bounds.minY > cameraPos.y + viewRect.height) { return false; }

			return true;
		}

		public start () { return; }
		public update (deltaTime) { return; }

		public setVertices(vertices: Array<number>, indices: Array<number>, uv?: Array<number>, vertColors?: Array<number> | number) {
			let renderer = this.game.renderer;
			let material = this.shader;
			let attributes = material.getAttributes(renderer);
			let stride = material.getAttrStride();
			if (this.indexBuffer) {
				this.gl.deleteBuffer(this.indexBuffer.buffer);
				delete this.indexBuffer;
			}
			if (this.vertexBuffer) {
				this.gl.deleteBuffer(this.vertexBuffer.buffer);
				delete this.vertexBuffer;
			}
			this.vertDataBuffer = new XEngine.DataBuffer32(stride * indices.length);
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
				floatBuffer[index++] = vertices[i++];
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

		public _setVertices(width: number, height: number, color: number, uv: Array<number>) {
			let pos = new XEngine.Vector(0, 0);
			this._uv = uv;
			this.width = width;
			this.height = height;

			let vertices = [
				// Cara delantera
				0, 0, -1,
				width, 0, -1,
				width, height, -1,
				0, height, -1,
			];
			const indices = [
				0, 1, 2,
				1, 3, 2,
			];

			this.setVertices(vertices, indices, uv);
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
