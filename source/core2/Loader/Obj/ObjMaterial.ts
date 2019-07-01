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
			let mat = game.createMaterialFromBase(BlinnPhongMaterial) as BlinnPhongMaterial;
			
			if(this.albedoTexture)
			{
				if(mat.albedo)
					mat.albedo.value = game.cache.image(this.albedoTexture);
			}

			if (this.normalTexture) {
				if(mat.normal)
					mat.normal.value = game.cache.image(this.normalTexture);
			}
			if (this.opacityMask) {
				if(mat.opacityTex)
					mat.opacityTex.value = game.cache.image(this.opacityMask);
			}
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
