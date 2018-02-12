declare var mat4: any;
namespace XEngine {
	export class SimpleMaterial extends Material {
		public static shader = new SimpleMaterial();
		public texture: WebGLTexture;

		constructor() {
			super(XEngine.MaterialLib.SimpleMaterial.vertexShader, XEngine.MaterialLib.SimpleMaterial.fragmentShader, null);
		}

		// public _setTexture(texture: WebGLTexture) {
		// 	this.texture = texture;
		// }

		public _setTexture(texture: WebGLTexture) {
			this.texture = texture;
		}

		public bind(renderer: Renderer) {
			XEngine.Material.prototype.bind.call(this, renderer);
			if (this.texture) {
				renderer.bindTexture(this.texture, renderer.context.TEXTURE0);
			}
		}
	}
}
