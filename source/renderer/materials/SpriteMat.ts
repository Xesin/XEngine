namespace XEngine {
	export class SpriteMat extends Material {
		public static shader = new SpriteMat();
		public texture: WebGLTexture;

		constructor() {
			super(XEngine.ShaderLib.SpriteShader.vertexShader, XEngine.ShaderLib.SpriteShader.fragmentShader);
			this.depthTest = false;
			this.cullFace = true;
			this.cullMode = CullMode.BACK;
			this.transparent = true;
		}

		public _setTexture(texture: WebGLTexture) {
			this.texture = texture;
		}

		public bind(renderer: Renderer) {
			super.bind(renderer);
			// Tell WebGL we want to affect texture unit 0
			renderer.bindTexture(this.texture, renderer.context.TEXTURE0);
		}
	}
}
