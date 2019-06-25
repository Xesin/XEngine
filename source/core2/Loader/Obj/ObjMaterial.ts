namespace XEngine2 {
	export class ObjMaterial {
		public name: string;
		public ambient: Array<number>;
		public diffuse: Array<number>;
		public albedoTexture: string;
		public normalTexture: string;
		public opacityMask: string;
		public ambientTexture: string;
		public specularTexture: string;
		public smoothness: number;
		public glossiness: number;

		constructor(name: string) {
			this.name = name;
		}

		public createMaterial(game: Game, gl: WebGL2RenderingContext): Material {
			let mat = game.createMaterialFromBase(BasicMaterial);
			
			// if (this.albedoTexture) {
			// 	mat.setAlbedo(cache.image(this.albedoTexture), gl);
			// }
			// if (this.normalTexture) {
			// 	mat.setNormal(cache.image(this.normalTexture), gl);
			// }
			// if (this.opacityMask) {
			// 	mat.setOpacityMask(cache.image(this.opacityMask), gl);
			// }
			// if (this.ambientTexture) {
			// 	mat.setAmbient(cache.image(this.ambientTexture), gl);
			// }
			// if (this.specularTexture) {
			// 	mat.setSpecular(cache.image(this.specularTexture), gl);
			// }
			// mat.baseUniforms.smoothness.value = 0.55;
			// mat.baseUniforms.metallic.value = 0;
			
			return mat;
		}
	}
}
