namespace XEngine {
	export class ObjMaterial {
		public name: string;
		public ambient: Array<number>;
		public diffuse: Array<number>;
		public albedoTexture: string;
		public normalTexture: string;
		public emissiveTexture: string;
		public smoothness: number;
		public glossiness: number;

		constructor(name: string) {
			this.name = name;
		}

		public createMaterial(cache: Cache): Material {
			let mat = new LambertMaterial();
			if (this.albedoTexture) {
				mat.albedoTexture = cache.image(this.albedoTexture)._texture;
			}
			if (this.normalTexture) {
				mat.normalTexture = cache.image(this.normalTexture)._texture;
			}
			mat.smoothness = this.smoothness;
			mat.glossiness = this.glossiness;
			return mat;
		}
	}
}
