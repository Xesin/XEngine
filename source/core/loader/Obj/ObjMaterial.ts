namespace XEngine {
	export class ObjMaterial {
		public name: string;
		public ambient: Array<number>;
		public diffuse: Array<number>;
		public albedoTexture: string;
		public normalTexture: string;
		public opacityMask: string;
		public ambientTexture: string;
		public smoothness: number;
		public glossiness: number;

		constructor(name: string) {
			this.name = name;
		}

		public createMaterial(cache: Cache, gl: WebGL2RenderingContext): Material {
			let mat = new PhongMaterial();
			if (this.albedoTexture) {
				mat.setAlbedo(cache.image(this.albedoTexture)._texture, gl);
			}
			if (this.normalTexture) {
				mat.setNormal(cache.image(this.normalTexture)._texture, gl);
			}
			if (this.opacityMask) {
				mat.setOpacityMask(cache.image(this.opacityMask)._texture, gl);
			}
			if (this.ambientTexture) {
				mat.setAmbient(cache.image(this.ambientTexture)._texture, gl);
			}
			mat.smoothness = this.smoothness;
			mat.glossiness = this.glossiness;
			return mat;
		}
	}
}
