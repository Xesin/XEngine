namespace XEngine {
	export class SpriteMat extends Material {
		public static shader = new SpriteMat();
		public texture: WebGLTexture;

		constructor() {
			super(XEngine.MaterialLib.Sprite.vertexShader, XEngine.MaterialLib.Sprite.fragmentShader);
		}

		public _setTexture(texture: WebGLTexture) {
			this.texture = texture;
		}

		public _beginRender(gl: WebGLRenderingContext) {
			XEngine.Material.prototype._beginRender.call(this, gl);
			// Tell WebGL we want to affect texture unit 0
			gl.activeTexture(gl.TEXTURE0);

			// Bind the texture to texture unit 0
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}
	}
}
