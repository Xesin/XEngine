namespace XEngine {
	export class SimpleMaterial extends Material {
		public static shader = new SimpleMaterial();
		public texture: WebGLTexture;

		constructor() {
			let uniforms = {
				mvpMatrix: {
					value: null,
					type: Uniforms.MAT4X4,
				},
			};
			super(XEngine.MaterialLib.SimpleMaterial.vertexShader, XEngine.MaterialLib.SimpleMaterial.fragmentShader, uniforms);
		}

		// public _setTexture(texture: WebGLTexture) {
		// 	this.texture = texture;
		// }

		public _beginRender(gl: WebGLRenderingContext) {
			XEngine.Material.prototype._beginRender.call(this, gl);
			// // Tell WebGL we want to affect texture unit 0
			// gl.activeTexture(gl.TEXTURE0);

			// // Bind the texture to texture unit 0
			// gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}
	}
}
