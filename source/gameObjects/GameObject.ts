namespace XEngine {
	declare var mat4: any;
	export class GameObject {
		protected game: Game;
		public parent: any;
		public isPendingDestroy: boolean;
		public alive: boolean;
		public alpha: number;
		public scale: Vector;
		public anchor: Vector;
		public rotation: number;
		public position: Vector;
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
		public mvMatrix: Array<number>;
		protected _uv: Array<number>;
		private _vertDataBuffer: DataBuffer32;
		private gl: WebGLRenderingContext;

		private indexBuffer: IndexBuffer;
		private vertexBuffer: VertexBuffer;

		private _prevWidth: number;
		private _prevHeight: number;
		private _prevPos: any;

		constructor(game: Game, posX = 0, posY = 0) {
			this.game = game;
			this.parent = game;
			this.isPendingDestroy = false;
			this.alive = true;
			this.alpha = 1.0;
			this.scale = new XEngine.Vector(1, 1);
			this.anchor = new XEngine.Vector(0, 0);
			this.rotation = 0;
			this.position = new XEngine.Vector(posX, posY);
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

			this._vertDataBuffer = new XEngine.DataBuffer32(24 * 4);

			this._uv = [
				0.0, 0.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0,
			];

			this.gl = this.game.context;
			let gl = this.gl;
			let indexDataBuffer = new XEngine.DataBuffer16(2 * 6);
			this.vertexBuffer = this.game.renderer.resourceManager.createBuffer(
				gl.ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STREAM_DRAW) as VertexBuffer;
			this.indexBuffer = this.game.renderer.resourceManager.createBuffer(
				gl.ELEMENT_ARRAY_BUFFER, this._vertDataBuffer.getByteCapacity(), gl.STATIC_DRAW) as IndexBuffer;
			let indexBuffer = indexDataBuffer.uintView;
			for (let indexA = 0, indexB = 0; indexA < 6; indexA += 6, indexB += 4) {
				indexBuffer[indexA + 0] = indexB + 0;
				indexBuffer[indexA + 1] = indexB + 1;
				indexBuffer[indexA + 2] = indexB + 2;
				indexBuffer[indexA + 3] = indexB + 1;
				indexBuffer[indexA + 4] = indexB + 3;
				indexBuffer[indexA + 5] = indexB + 2;
			}

			this.indexBuffer.updateResource(indexBuffer, 0);
			this.mask = null;

			this.mvMatrix = mat4.create();

			mat4.identity(this.mvMatrix);

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
			this.position.x = posX;
			this.position.y = posY;
			this.alive = true;
		}

		public getWorldMatrix (childMatrix: Array<number>) {
			this.parent.getWorldMatrix(childMatrix);
			let translation = [this.position.x, this.position.y, 0.0];
			let posX = Math.round(-(this.width * this.anchor.x));
			let posY = Math.round(-(this.height * this.anchor.y));
			if (this.fixedToCamera) {
				translation[0] += this.game.camera.position.x;
				translation[1] += this.game.camera.position.y;
			}
			mat4.translate(childMatrix, childMatrix, translation);
			mat4.rotateZ(childMatrix, childMatrix, this.rotation * XEngine.Mathf.TO_RADIANS);
			mat4.scale(childMatrix, childMatrix, [this.scale.x, this.scale.y, 1.0]);
			mat4.translate(childMatrix, childMatrix, [posX, posY, 0.0]);
			return childMatrix;
		}

		public getWorldPos () {
			let parentPos = this.parent.getWorldPos();
			let x = this.position.x + parentPos.x;
			let y = this.position.y + parentPos.y;
			return new XEngine.Vector(x, y);
		}

		public _beginRender(context: WebGLRenderingContext) {
			if (this.shader) {
				this.shader._beginRender(context);
			}
			this.game.renderer.setRenderer(null, null);
		}

		public _renderToCanvas (context: WebGLRenderingContext) {
			this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			this.shader.updateUniforms(context);

			if (this._prevHeight !== this.height ||
				this._prevWidth !== this.width ||
				this._prevPos.x !== this.position.x ||
				this._prevPos.y !== this.position.y) {
				this._setVertices(this.width, this.height, this.color, this._uv);
				this._prevHeight = this.height;
				this._prevWidth = this.width;
				this._prevPos.x = this.position.x;
				this._prevPos.y = this.position.y;
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
			this.shader._beginRender(gl);

			this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			this.shader.updateUniforms(gl);

			this._setVertices(this.width, this.height, this.color, this._uv);

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
			let width = this.width * this.scale.x;
			let height = this.height * this.scale.y;
			let worldPos = this.getWorldPos();
			let widthAnchor = width * this.anchor.x;
			let heightAnchor = height * this.anchor.y;
			let minX = worldPos.x - widthAnchor;
			let maxX = worldPos.x + width - widthAnchor;
			let minY = worldPos.y - heightAnchor;
			let maxY = worldPos.y + height - heightAnchor;
			return {
				width: width,
				height: height,
				minX: minX,
				maxX: maxX,
				minY: minY,
				maxY: maxY,
			};
		}

		public isInsideCamera(): boolean {
			let bounds = this.getBounds();
			let worldPos = this.getWorldPos();
			let cameraPos = this.game.camera.position;
			let viewRect = {width: this.game.width, height: this.game.height};
			if (bounds.maxX < cameraPos.x) { return false; }
			if (bounds.maxY < cameraPos.y) { return false; }
			if (bounds.minX > cameraPos.x + viewRect.width) {return false; }
			if (bounds.minY > cameraPos.y + viewRect.height) { return false; }

			return true;
		}

		public start () { return; }
		public update (deltaTime) { return; }

		public _setVertices(width, height, color, uv) {
			let floatBuffer = this._vertDataBuffer.floatView;
			let uintBuffer = this._vertDataBuffer.uintView;
			let index = 0;
			let pos = new XEngine.Vector(0, 0);
			this._uv = uv;
			this.width = width;
			this.height = height;
			this.getWorldMatrix(this.mvMatrix);
			pos = pos.multiplyMatrix(this.mvMatrix);

			floatBuffer[index++] = pos.x;
			floatBuffer[index++] = pos.y;
			floatBuffer[index++] = uv[0];
			floatBuffer[index++] = uv[1];
			uintBuffer[index++] = color;
			floatBuffer[index++] = this.alpha;

			pos.setTo(0, height);
			pos = pos.multiplyMatrix(this.mvMatrix);

			floatBuffer[index++] = pos.x;
			floatBuffer[index++] = pos.y;
			floatBuffer[index++] = uv[2];
			floatBuffer[index++] = uv[3];
			uintBuffer[index++] = color;
			floatBuffer[index++] = this.alpha;

			pos.setTo(width, 0);
			pos = pos.multiplyMatrix(this.mvMatrix);

			floatBuffer[index++] = pos.x;
			floatBuffer[index++] = pos.y;
			floatBuffer[index++] = uv[4];
			floatBuffer[index++] = uv[5];
			uintBuffer[index++] = color;
			floatBuffer[index++] = this.alpha;

			pos.setTo(width, height);
			pos = pos.multiplyMatrix(this.mvMatrix);

			floatBuffer[index++] = pos.x;
			floatBuffer[index++] = pos.y;
			floatBuffer[index++] = uv[6];
			floatBuffer[index++] = uv[7];
			uintBuffer[index++] = color;
			floatBuffer[index++] = this.alpha;

			this.vertexBuffer.updateResource(floatBuffer, 0);
		}

		private _setBuffers() {
			let context = this.gl;
			this.shader.bind(context);
			this.vertexBuffer.addAttribute(this.shader.vertPosAtt, 2, context.FLOAT, false, 24, 0);
			this.vertexBuffer.addAttribute(this.shader.vertUvAtt, 2, context.FLOAT, false, 24, 8);
			this.vertexBuffer.addAttribute(this.shader.vertColAtt, 3, context.UNSIGNED_BYTE, true, 24, 16);
			this.vertexBuffer.addAttribute(this.shader.vertAlphaAtt, 1, context.FLOAT, false, 24, 20);
		}
	}
}
