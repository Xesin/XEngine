declare var mat4: any;
namespace XEngine {
	export class PhongMaterial extends Material {
		public static shader = new PhongMaterial();
		public albedoTexture: WebGLTexture;
		public normalTexture: WebGLTexture;
		public opacityMask: WebGLTexture;
		public ambientTexture: WebGLTexture;
		public smoothness: number;
		public glossiness: number;
		public color: Array<number>;

		private defines = Array<string>();

		constructor() {
			super(XEngine.ShaderLib.BlinnPhongShader.vertexShader, XEngine.ShaderLib.BlinnPhongShader.fragmentShader, {});
			this.depthTest = true;
			this.cullFace = true;
			this.cullMode = CullMode.BACK;
			this.transparent = false;
			this.depthWrite = true;
			this.color = [1, 1, 1, 1];
			this.smoothness = 1;
			this.glossiness = 45;

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

			this.baseUniforms.eyePos = {
				type: Uniforms.VECTOR3,
				value: [],
			};

			this.baseUniforms.albedoTex = {
				type: Uniforms.SAMPLER,
				value: 0,
			};

			this.baseUniforms.normalTex = {
				type: Uniforms.SAMPLER,
				value: 1,
			};

			this.baseUniforms.opacityMask = {
				type: Uniforms.SAMPLER,
				value: 2,
			};

			this.baseUniforms.ambientMap = {
				type: Uniforms.SAMPLER,
				value: 3,
			};

			this.uniforms["light.position"] = {
				type: Uniforms.VECTOR3,
				value: new Vector3(0.5, 0.5, 0.5),
			};

			this.uniforms["light.intensity"] = {
				type: Uniforms.FLOAT,
				value: 0.8,
			};

			this.uniforms["light.color"] = {
				type: Uniforms.VECTOR3,
				value: new Vector3(1, 1, 1),
			};
		}

		// public _setTexture(texture: WebGLTexture) {
		// 	this.texture = texture;
		// }

		public setAlbedo(texture: WebGLTexture, gl: WebGL2RenderingContext) {
			if (this.albedoTexture === undefined) {
				this.defines.push("#define ALBEDO");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.albedoTexture = texture;
		}

		public setNormal(texture: WebGLTexture, gl: WebGL2RenderingContext) {
			if (this.normalTexture === undefined) {
				this.defines.push("#define NORMAL");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.normalTexture = texture;
		}

		public setOpacityMask(texture: WebGLTexture, gl: WebGL2RenderingContext) {
			if (this.opacityMask === undefined) {
				this.defines.push("#define OPACITY_MASK");
				this.defines.push("#define MASKED");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.opacityMask = texture;
		}

		public setAmbient(texture: WebGLTexture, gl: WebGL2RenderingContext) {
			if (this.ambientTexture === undefined) {
				this.defines.push("#define AMBIENT_MAP");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.ambientTexture = texture;
		}

		public bind(renderer: Renderer) {
			XEngine.Material.prototype.bind.call(this, renderer);
			if (this.albedoTexture) {
				renderer.bindTexture(this.albedoTexture, renderer.context.TEXTURE0);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE0);
			}
			if (this.normalTexture) {
				renderer.bindTexture(this.normalTexture, renderer.context.TEXTURE1);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE1);
			}
			if (this.opacityMask) {
				renderer.bindTexture(this.opacityMask, renderer.context.TEXTURE2);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE2);
			}

			if (this.ambientTexture) {
				renderer.bindTexture(this.ambientTexture, renderer.context.TEXTURE3);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE3);
			}
		}

		public getAttrStride(): number {
			let baseStride = super.getAttrStride();
			return baseStride + 24;
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
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.context, "aTangent"),
				items: 3,
				type: renderer.context.FLOAT,
				normalized: false,
				offset: baseStride + 12,
			});

			return attrs;
		}
	}
}
