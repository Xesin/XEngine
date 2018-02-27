declare var mat4: any;
namespace XEngine {
	export class LambertMaterial extends Material {
		public static shader = new LambertMaterial();
		public albedoTexture: WebGLTexture;
		public normalTexture: WebGLTexture;
		public emissiveTexture: WebGLTexture;
		public smoothness: number;
		public glossiness: number;
		public color: Array<number>;

		constructor() {
			super(XEngine.ShaderLib.LambertShader.vertexShader, XEngine.ShaderLib.LambertShader.fragmentShader, null);
			this.depthTest = true;
			this.cullFace = true;
			this.cullMode = CullMode.BACK;
			this.transparent = false;
			this.depthWrite = true;
			this.color = [1, 1, 1, 1];
			this.smoothness = 0;
			this.glossiness = 0;
			this.baseUniforms.color = {
				type: Uniforms.VECTOR4,
				value: this.color,
			};
			this.baseUniforms.smoothness = {
				type: Uniforms.FLOAT,
				value: this.smoothness,
			};
			this.baseUniforms.glossiness = {
				type: Uniforms.FLOAT,
				value: this.glossiness,
			};

			this.baseUniforms.albedoTex = {
				type: Uniforms.SAMPLER,
				value: 0,
			};

			this.baseUniforms.normalTex = {
				type: Uniforms.SAMPLER,
				value: 1,
			};
		}

		// public _setTexture(texture: WebGLTexture) {
		// 	this.texture = texture;
		// }

		public _setTexture(texture: WebGLTexture) {
			this.albedoTexture = texture;
		}

		public bind(renderer: Renderer) {
			XEngine.Material.prototype.bind.call(this, renderer);
			if (this.albedoTexture) {
				renderer.bindTexture(this.albedoTexture, renderer.context.TEXTURE0);
			}
			if (this.normalTexture) {
				renderer.bindTexture(this.normalTexture, renderer.context.TEXTURE1);
			}
		}

		public getAttrStride(): number {
			let baseStride = super.getAttrStride();
			return baseStride + 12;
		}

		public getAttributes(renderer: Renderer): Array<any> {
			let attrs = super.getAttributes(renderer);
			let baseStride = super.getAttrStride();
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.context, "aNormal"),
				items: 3,
				type: renderer.context.FLOAT,
				normalized: true,
				offset: baseStride,
			});

			return attrs;
		}
	}
}
