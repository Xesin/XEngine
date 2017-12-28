namespace XEngine {
	declare var mat4: any;
	export namespace RectBatcher {
		export class RectBatch {
			public shader: SimpleColor;
			private gl: WebGLRenderingContext;
			private game: Game;
			private renderer: Renderer;
			private maxSprites: number;
			private vertexBufferObject: VertexBuffer;
			private indexBufferObject: IndexBuffer;
			private vertexDataBuffer: DataBuffer32;
			private indexDataBuffer: DataBuffer16;
			private elementCount: number;
			private mask: GameObject;
			private vertexCount: number;

			constructor(game: Game, gl: WebGLRenderingContext, renderer: Renderer) {
				this.gl = gl;
				this.game = game;
				this.renderer = renderer;

				this.maxSprites = null;
				this.shader = null;

				this.vertexBufferObject = null;
				this.indexBufferObject = null;

				this.vertexDataBuffer = null;
				this.indexDataBuffer = null;

				this.elementCount = 0;
				this.mask = null;

				this.vertexCount = 0;

				this.init(this.gl);
			}

			public shouldFlush(): boolean {
				if (this.isFull()) {
					return true;
				}
				return false;
			}

			public isFull() {
				return (this.vertexDataBuffer.getByteLength() >= this.vertexDataBuffer.getByteCapacity());
			}

			public bind(shader) {
				if (!shader) {
					this.shader.bind(this.gl);
					this.shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
					this.shader.updateUniforms(this.gl);
				} else {
					shader.bind(this.gl);
					shader.baseUniforms.pMatrix.value = this.game.camera.pMatrix;
					shader.updateUniforms(this.gl);
				}
				this.vertexBufferObject.bind();
				this.indexBufferObject.bind();
			}

			public flush(shader) {
				let gl = this.gl;
				if (this.mask) {
					this.mask.rendermask(gl);
				}
				let vertexDataBuffer = this.vertexDataBuffer;

				if (this.elementCount === 0 && this.vertexCount === 0) {
					return;
				}

				this.bind(shader);
				this.vertexBufferObject.updateResource(vertexDataBuffer.floatView, 0);

				gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);

				vertexDataBuffer.clear();
				this.elementCount = 0;
				this.vertexCount = 0;
				if (this.mask) {
					this.mask.endRendermask(gl);
					this.mask = null;
				}
			}

			public addRect(gameObject, shader) {
				if (gameObject.mask !== this.mask || this.shader !== shader) {
					this.flush(this.shader);
					this.shader = shader;
				}
				if (gameObject.mask) {
					this.mask = gameObject.mask;
				}
				this.renderer.setRenderer(this, null);

				let floatBuffer = this.vertexDataBuffer.floatView;
				let uintBuffer = this.vertexDataBuffer.uintView;
				let index = this.vertexDataBuffer.allocate(24);

				let pos = new XEngine.Vector(0, 0);
				mat4.identity(gameObject.mvMatrix);
				gameObject.getWorldMatrix(gameObject.mvMatrix);
				pos = pos.multiplyMatrix(gameObject.mvMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = gameObject._uv[0];
				floatBuffer[index++] = gameObject._uv[1];
				uintBuffer[index++] = gameObject.color;
				floatBuffer[index++] = gameObject.alpha;

				pos.setTo(0, gameObject.height);
				pos = pos.multiplyMatrix(gameObject.mvMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = gameObject._uv[2];
				floatBuffer[index++] = gameObject._uv[3];
				uintBuffer[index++] = gameObject.color;
				floatBuffer[index++] = gameObject.alpha;

				pos.setTo(gameObject.width, 0);
				pos = pos.multiplyMatrix(gameObject.mvMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = gameObject._uv[4];
				floatBuffer[index++] = gameObject._uv[5];
				uintBuffer[index++] = gameObject.color;
				floatBuffer[index++] = gameObject.alpha;

				pos.setTo(gameObject.width, gameObject.height);
				pos = pos.multiplyMatrix(gameObject.mvMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = gameObject._uv[6];
				floatBuffer[index++] = gameObject._uv[7];
				uintBuffer[index++] = gameObject.color;
				floatBuffer[index++] = gameObject.alpha;

				this.elementCount += 6;
			}

			private init(gl: WebGLRenderingContext) {
				let vertexDataBuffer = new XEngine.DataBuffer32(
					Consts.VERTEX_SIZE * Consts.VERTEX_COUNT * Consts.MAX_RECTS);
				let indexDataBuffer = new XEngine.DataBuffer16(
					Consts.INDEX_SIZE * Consts.INDEX_COUNT * Consts.MAX_RECTS);

				let indexBufferObject = this.renderer.resourceManager.createBuffer(
					gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW) as IndexBuffer;
				let vertexBufferObject = this.renderer.resourceManager.createBuffer(
					gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW) as VertexBuffer;

				let shader = this.renderer.resourceManager.createShader(SimpleColor, "colorShader") as SimpleColor;

				let indexBuffer = indexDataBuffer.uintView;
				let max = Consts.MAX_RECTS * Consts.INDEX_COUNT;

				this.vertexDataBuffer = vertexDataBuffer;
				this.vertexBufferObject = vertexBufferObject;
				this.indexDataBuffer = indexDataBuffer;
				this.indexBufferObject = indexBufferObject;

				this.shader = shader;

				vertexBufferObject.addAttribute(
					shader.getAttribLocation(gl, "aVertexPosition"), 2, gl.FLOAT, false, Consts.VERTEX_SIZE, 0);
				vertexBufferObject.addAttribute(
					shader.getAttribLocation(gl, "vUv"), 2, gl.FLOAT, false, Consts.VERTEX_SIZE, 8);
				vertexBufferObject.addAttribute(
					shader.getAttribLocation(gl, "aVertexColor"), 3, gl.UNSIGNED_BYTE, true, Consts.VERTEX_SIZE, 16);
				vertexBufferObject.addAttribute(
					shader.getAttribLocation(gl, "in_alpha"), 1, gl.FLOAT, false, Consts.VERTEX_SIZE, 20);

				// Populate the index buffer only once
				for (let indexA = 0, indexB = 0; indexA < max; indexA += Consts.INDEX_COUNT, indexB += Consts.VERTEX_COUNT) {
					indexBuffer[indexA + 0] = indexB + 0;
					indexBuffer[indexA + 1] = indexB + 1;
					indexBuffer[indexA + 2] = indexB + 2;
					indexBuffer[indexA + 3] = indexB + 1;
					indexBuffer[indexA + 4] = indexB + 3;
					indexBuffer[indexA + 5] = indexB + 2;
				}

				indexBufferObject.updateResource(indexBuffer, 0);
			}
		}
	}
}
