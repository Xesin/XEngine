namespace XEngine {

	export class SpriteShader extends Shader {
		public static shader = new SpriteShader();
		public texture: WebGLTexture;

		constructor() {
			super(XEngine.ShaderLib.Sprite.vertexShader, XEngine.ShaderLib.Sprite.fragmentShader);
		}

		public _setTexture(texture: WebGLTexture) {
			this.texture = texture;
		}

		public _beginRender(gl: WebGLRenderingContext) {
			XEngine.Shader.prototype._beginRender.call(this, gl);
			// Tell WebGL we want to affect texture unit 0
			gl.activeTexture(gl.TEXTURE0);

			// Bind the texture to texture unit 0
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}
	}
}
