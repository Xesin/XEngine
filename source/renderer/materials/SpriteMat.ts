namespace XEngine {
	export class SpriteMat extends Material {
		public static shader = new SpriteMat();
		public texture: WebGLTexture;

		constructor() {
			super(XEngine.ShaderLib.SpriteShader.vertexShader, XEngine.ShaderLib.SpriteShader.fragmentShader);
		}

		public _setTexture(texture: WebGLTexture) {
			this.texture = texture;
		}

		public bind(renderer: Renderer) {
			XEngine.Material.prototype.bind.call(this, renderer);
			// Tell WebGL we want to affect texture unit 0
			renderer.bindTexture(this.texture, renderer.context.TEXTURE0);
		}
	}
}
