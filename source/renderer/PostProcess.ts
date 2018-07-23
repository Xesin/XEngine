namespace XEngine {
	export class PostProcess {
		private vertDataBuffer: DataBuffer32;
		private vertBuffer: VertexBuffer;
		private material: Material;

		constructor(renderer: Renderer) {
			let vertices = [
				1,  1,
				-1,  1,
				-1, -1,
				1,  1,
				-1, -1,
				1, -1,
			];

			let uvs = [
				0,  0,
				1,  0,
				1, 1,
				0,  0,
				1, 1,
				0, 1,
			];
			let gl = renderer.context;
			let resourceManager = renderer.resourceManager;
			this.vertDataBuffer = new DataBuffer32(16 * 6);
			let buffer = resourceManager.createBuffer(gl.ARRAY_BUFFER, this.vertDataBuffer.getByteCapacity(), gl.STREAM_DRAW) as VertexBuffer;

			let index = this.vertDataBuffer.allocate(vertices.length * 2);
			this.vertBuffer = new VertexBuffer(gl, buffer);
			let floatBuffer = this.vertDataBuffer.floatView;
			for (let i = 0; i < vertices.length; i += 2) {
				floatBuffer[index++] = vertices[i];
				floatBuffer[index++] = vertices[i + 1];
				let x = 0;
				let y = 0;
				if (uvs !== undefined) {
					x = uvs[i];
					y = uvs[i + 1];
				}
			}

			this.vertBuffer.updateResource(floatBuffer, 0);
		}

		public onRenderImage(rt: RenderTarget) {
			return;
		}
	}
}
