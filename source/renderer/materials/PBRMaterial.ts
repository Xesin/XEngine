declare var mat4: any;
namespace XEngine {
	export class PBRMaterial extends Material {
		public static shader = new PBRMaterial();
		public albedoTexture: Texture2D;
		public normalTexture: Texture2D;
		public opacityMask: Texture2D;
		public ambientTexture: Texture2D;
		public smoothnessTexture: Texture2D;
		public metallicTexture: Texture2D;
		public smoothness: number;
		public metallic: number;
		public normalIntensity: number;
		public color: Array<number>;

		private defines = Array<string>();

		constructor() {
			super(XEngine.ShaderLib.PBRShader.vertexShader, XEngine.ShaderLib.PBRShader.fragmentShader, {});
			this.depthTest = true;
			this.cullFace = true;
			this.cullMode = CullMode.BACK;
			this.transparent = false;
			this.depthWrite = true;
			this.color = [1, 1, 1, 1];
			this.smoothness = 1;
			this.metallic = 0.0;
			this.normalIntensity = 1.0;

			this.baseUniforms.color = {
				type: Uniforms.VECTOR4,
				value: this.color,
			};
			this.baseUniforms.smoothness = {
				type: Uniforms.FLOAT,
				value: this.smoothness,
			};
			this.baseUniforms.metallic = {
				type: Uniforms.FLOAT,
				value: this.metallic,
			};
			this.baseUniforms.normalIntensity = {
				type: Uniforms.FLOAT,
				value: this.normalIntensity,
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

			this.baseUniforms.metallicTex = {
				type: Uniforms.SAMPLER,
				value: 4,
			};

			this.baseUniforms.eyePos = {
				type: Uniforms.VECTOR3,
				value: new Vector3(0.0, 0.0, 0.0),
			};

			for (let i = 0; i < 5; i++) {
				this.uniforms["light[" + i + "].position"] = {
					type: Uniforms.VECTOR3,
					value: new Vector3(0, 0, 0),
					dirty: true,
				};

				this.uniforms["light[" + i + "].intensity"] = {
					type: Uniforms.FLOAT,
					value: 1,
					dirty: true,
				};

				this.uniforms["light[" + i + "].color"] = {
					type: Uniforms.VECTOR3,
					value: new Vector3(1, 1, 1),
					dirty: true,
				};

				this.uniforms["light[" + i + "].type"] = {
					type: Uniforms.INTEGER,
					value: 0,
					dirty: true,
				};

				this.uniforms["light[" + i + "].range"] = {
					type: Uniforms.FLOAT,
					value: 1,
					dirty: true,
				};
			}

			this.lightOn = true;
		}

		// public _setTexture(texture: WebGLTexture) {
		// 	this.texture = texture;
		// }

		public setAlbedo(texture: Texture2D, gl: WebGL2RenderingContext) {
			if (this.albedoTexture === undefined) {
				this.defines.push("#define ALBEDO");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.albedoTexture = texture;
		}

		public setNormal(texture: Texture2D, gl: WebGL2RenderingContext) {
			if (this.normalTexture === undefined) {
				this.defines.push("#define NORMAL");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.normalTexture = texture;
		}

		public setOpacityMask(texture: Texture2D, gl: WebGL2RenderingContext) {
			if (this.opacityMask === undefined) {
				this.defines.push("#define OPACITY_MASK");
				this.defines.push("#define MASKED");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.opacityMask = texture;
		}

		public setAmbient(texture: Texture2D, gl: WebGL2RenderingContext) {
			if (this.ambientTexture === undefined) {
				this.defines.push("#define AMBIENT_MAP");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.ambientTexture = texture;
		}

		public setMetallic(texture: Texture2D, gl: WebGL2RenderingContext) {
			if (this.metallicTexture === undefined) {
				this.defines.push("#define METALLIC_COLOR");
				this.shaderProgram = ShaderCompiler.compileShader(gl, this, this.defines);
				this.setUniforms(gl);
			}
			this.metallicTexture = texture;
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

			if (this.smoothnessTexture) {
				renderer.bindTexture(this.smoothnessTexture, renderer.context.TEXTURE4);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE4);
			}

			if (this.metallicTexture) {
				renderer.bindTexture(this.metallicTexture, renderer.context.TEXTURE5);
			} else {
				renderer.bindTexture(null, renderer.context.TEXTURE5);
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
