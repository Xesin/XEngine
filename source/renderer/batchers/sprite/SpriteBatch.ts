namespace XEngine {
	declare var mat4: any;
	export namespace SpriteBatcher {
		export class SpriteBatch {
			public shader: SpriteMat;
			private gl: WebGLRenderingContext;
			private game: Game;
			private renderer: Renderer;
			private maxSprites: number;
			private vertexBufferObject: VertexBuffer;
			private indexBufferObject: IndexBuffer;
			private vertexDataBuffer: DataBuffer32;
			private indexDataBuffer: DataBuffer16;
			private elementCount: number;
			private currentTexture2D: WebGLTexture;
			private currentSprite: string;
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
				this.currentTexture2D = null;
				this.currentSprite = null;
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
					this.shader.baseUniforms.pMatrix.value = this.game.camera.uiMatrix;
					this.shader._setTexture(this.currentTexture2D);
					this.renderer.bindMaterial(this.shader);
					this.shader.updateUniforms(this.gl);
				} else {
					shader.baseUniforms.pMatrix.value = this.game.camera.uiMatrix;
					shader._setTexture(this.currentTexture2D);
					this.renderer.bindMaterial(shader);
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

			public addSprite(gameObject, shader) {
				if (gameObject.mask !== this.mask || this.shader !== shader) {
					this.flush(this.shader);
					this.shader = shader;
				}
				if (gameObject.mask) {
					this.mask = gameObject.mask;
				}
				this.renderer.setRenderer(this, gameObject.sprite);

				let floatBuffer = this.vertexDataBuffer.floatView;
				let uintBuffer = this.vertexDataBuffer.uintView;
				let index = this.vertexDataBuffer.allocate(24);
				let objectAlpha = gameObject.getTotalAlpha();
				let pos = new XEngine.Vector(0, 0);
				mat4.identity(gameObject.modelMatrix);
				gameObject.getWorldMatrix(gameObject.modelMatrix);
				pos = pos.multiplyMatrix(gameObject.modelMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = -0.1;
				floatBuffer[index++] = gameObject._uv[0];
				floatBuffer[index++] = gameObject._uv[1];
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = objectAlpha;

				pos.setTo(0, gameObject.height);
				pos = pos.multiplyMatrix(gameObject.modelMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = -0.1;
				floatBuffer[index++] = gameObject._uv[2];
				floatBuffer[index++] = gameObject._uv[3];
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = objectAlpha;

				pos.setTo(gameObject.width, 0);
				pos = pos.multiplyMatrix(gameObject.modelMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = -0.1;
				floatBuffer[index++] = gameObject._uv[4];
				floatBuffer[index++] = gameObject._uv[5];
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = 1
				floatBuffer[index++] = objectAlpha;

				pos.setTo(gameObject.width, gameObject.height);
				pos = pos.multiplyMatrix(gameObject.modelMatrix);

				floatBuffer[index++] = pos.x;
				floatBuffer[index++] = pos.y;
				floatBuffer[index++] = -0.1;
				floatBuffer[index++] = gameObject._uv[6];
				floatBuffer[index++] = gameObject._uv[7];
				floatBuffer[index++] = 1;
				floatBuffer[index++] = 1;
				floatBuffer[index++] = 1;
				floatBuffer[index++] = objectAlpha;

				this.currentTexture2D = this.game.cache.image(gameObject.sprite)._texture;
				this.currentSprite = gameObject.sprite;
				this.elementCount += 6;
			}

			private init(gl: WebGLRenderingContext) {
				let vertexDataBuffer = new XEngine.DataBuffer32(
					Consts.VERTEX_SIZE * Consts.VERTEX_COUNT * Consts.MAX_SPRITES);
				let indexDataBuffer = new XEngine.DataBuffer16(
					Consts.INDEX_SIZE * Consts.INDEX_COUNT * Consts.MAX_SPRITES);

				let indexBufferObject = this.renderer.resourceManager.createBuffer(
					gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW) as IndexBuffer;
				let vertexBufferObject = this.renderer.resourceManager.createBuffer(
					gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW) as VertexBuffer;

				let shader = this.renderer.resourceManager.createMaterial(SpriteMat, "spriteShader") as SpriteMat;

				let indexBuffer = indexDataBuffer.uintView;
				let max = Consts.MAX_SPRITES * Consts.INDEX_COUNT;

				this.vertexDataBuffer = vertexDataBuffer;
				this.vertexBufferObject = vertexBufferObject;
				this.indexDataBuffer = indexDataBuffer;
				this.indexBufferObject = indexBufferObject;

				this.shader = shader;

				let attributes = shader.getAttributes(this.renderer);
				let stride = shader.getAttrStride();

				for (const attr in attributes) {
					if (attributes.hasOwnProperty(attr)) {
						const element = attributes[attr];
						vertexBufferObject.addAttribute(element.gpuLoc, element.items, element.type, element.normalized, stride, element.offset);
					}
				}

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
