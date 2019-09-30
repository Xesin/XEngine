/// <reference path="ShaderCompiler.ts"/>
namespace XEngine {
	export let ShaderUniforms = {

	};

	export enum BlendMode {
		Multiply,
		Add,
		Substract,
	}

	export enum CullMode {
		BACK,
		FRONT,
		NONE,
		BOTH,
	}

	export class Material {

		public uniforms: any;
		public baseUniforms: any;
		public compiled: boolean;
		public lightOn: boolean;
		public dirty: boolean;
		public shader: Material;

		public transparent: boolean;
		public blendMode: BlendMode;
		public depthTest: boolean;
		public cullFace: boolean;
		public cullMode: CullMode;
		public depthWrite: boolean;

		public shaderProgram: WebGLProgram;
		public vertexCode: Array<string>;
		public fragmentCode: Array<string>;

		constructor(vertexCode: Array<string>, fragmentCode: Array<string>, uniforms = {}) {
			this.transparent = false;
			this.depthWrite = false;
			this.depthTest = false;
			this.cullFace = true;
			this.cullMode = CullMode.BACK;
			this.uniforms = uniforms;
			this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
			this.baseUniforms.modelMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.viewMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.pMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.normalMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};

			this.shaderProgram = null;
			this.compiled = false;
			this.vertexCode = vertexCode;
			this.fragmentCode = fragmentCode;
			this.blendMode = BlendMode.Multiply;
			this.lightOn = false;
			this.dirty = true;
		}

		public initializeShader(gl: WebGL2RenderingContext) {
			this.shaderProgram = ShaderCompiler.compileShader(gl, this, []);
			this.setUniforms(gl);
		}

		public getAttrStride(): number {
			return 36;
		}

		public getAttributes(renderer: Renderer): Array<any> {
			let attrs = new Array();
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.gl, "aVertexPosition"),
				items: 3,
				normalized: false,
				offset: 0,
				type: renderer.gl.FLOAT,
			},
			);
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.gl, "vUv"),
				items: 2,
				normalized: false,
				offset: 12,
				type: renderer.gl.FLOAT,
			},
			);
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.gl, "aVertexColor"),
				items: 4,
				normalized: false,
				offset: 20,
				type: renderer.gl.FLOAT,
			},
			);

			return attrs;
		}

		public setUniforms(gl: WebGLRenderingContext) {
			gl.useProgram(this.shaderProgram);

			for (let property in this.uniforms) {
				if (this.uniforms.hasOwnProperty(property)) {
					let uniformValue = this.uniforms[property].value;
					this.uniforms[property].dirty = true;
					this.uniforms[property].value = undefined;
					this.uniforms[property]._value = uniformValue;
					Object.defineProperty(this.uniforms[property], "value", {
						get: function () {
							return this._value;
						},
						set: function (val) {
							this._value = val;
							this.dirty = true;
						},
					});
					this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
				}
			}

			for (let property in this.baseUniforms) {
				if (this.baseUniforms.hasOwnProperty(property)) {
					let uniformValue = this.baseUniforms[property].value;
					this.baseUniforms[property].dirty = true;
					this.baseUniforms[property].value = undefined;
					this.baseUniforms[property]._value = uniformValue;
					Object.defineProperty(this.baseUniforms[property], "value", {
						get: function () {
							return this._value;
						},
						set: function (val) {
							this._value = val;
							this.dirty = true;
						},
					});
					this.baseUniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
				}
			}
		}

		public getAttribLocation(gl: WebGLRenderingContext, attr: string) {
			return gl.getAttribLocation(this.shaderProgram, attr);
		}

		public bind(renderer: Renderer) {
			if (!this.compiled) { this.initializeShader(renderer.gl); }
		}

		public _setUniform(uniform, gl) {
			let valueType = uniform.type;
			switch (valueType) {
				case XEngine.Uniforms.INTEGER:
					gl.uniform1i(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.SAMPLER:
					gl.uniform1i(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.FLOAT:
					gl.uniform1f(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.VECTOR2:
					gl.uniform2fv(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.VECTOR3:
					gl.uniform3fv(uniform.gpuPosition, [uniform.value.x, uniform.value.y, uniform.value.z]);
					break;
				case XEngine.Uniforms.VECTOR4:
					gl.uniform4fv(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.MAT2X2:
					gl.uniformMatrix2fv(uniform.gpuPosition, false, uniform.value);
					break;
				case XEngine.Uniforms.MAT3X3:
					gl.uniformMatrix3fv(uniform.gpuPosition, false, uniform.value);
					break;
				case XEngine.Uniforms.MAT4X4:
					gl.uniformMatrix4fv(uniform.gpuPosition, false, uniform.value);
					break;
				default:
					gl.uniform1f(uniform.gpuPosition, uniform.value);
					break;
			}
		}

		public updateLights(gl: WebGL2RenderingContext, lights: Array<Light>) {
			for (let i = 0; i < lights.length; i++) {
				if (lights[i].dirty) {
					// tslint:disable-next-line:max-line-length
					this.uniforms["light[" + i + "].position"].value = lights[i].type === LightType.DIRECTIONAL ? lights[i].transform.rotation : lights[i].transform.position;
					this.uniforms["light[" + i + "].position"].dirty = true;

					this.uniforms["light[" + i + "].intensity"].value = lights[i].intensity;
					this.uniforms["light[" + i + "].intensity"].dirty = true;

					this.uniforms["light[" + i + "].color"].value = lights[i].lightColor;
					this.uniforms["light[" + i + "].color"].dirty = true;

					this.uniforms["light[" + i + "].type"].value = lights[i].type;
					this.uniforms["light[" + i + "].type"].dirty = true;

					this.uniforms["light[" + i + "].range"].value = lights[i].range;
					this.uniforms["light[" + i + "].range"].dirty = true;

					if (this.uniforms["light[" + i + "].position"].gpuPosition === undefined) {
						this.uniforms["light[" + i + "].position"].gpuPosition = gl.getUniformLocation(this.shaderProgram, "light[" + i + "].position");
					}
					if (this.uniforms["light[" + i + "].intensity"].gpuPosition === undefined) {
						this.uniforms["light[" + i + "].intensity"].gpuPosition = gl.getUniformLocation(this.shaderProgram, "light[" + i + "].intensity");
					}
					if (this.uniforms["light[" + i + "].color"].gpuPosition === undefined) {
						this.uniforms["light[" + i + "].color"].gpuPosition = gl.getUniformLocation(this.shaderProgram, "light[" + i + "].color");
					}
					if (this.uniforms["light[" + i + "].type"].gpuPosition === undefined) {
						this.uniforms["light[" + i + "].type"].gpuPosition = gl.getUniformLocation(this.shaderProgram, "light[" + i + "].type");
					}
					if (this.uniforms["light[" + i + "].range"].gpuPosition === undefined) {
						this.uniforms["light[" + i + "].range"].gpuPosition = gl.getUniformLocation(this.shaderProgram, "light[" + i + "].range");
					}
				}
			}
		}

		public updateUniforms(gl: WebGLRenderingContext) {
			for (const property in this.uniforms) {
				if (this.uniforms.hasOwnProperty(property) && (this.uniforms[property].dirty || this.uniforms[property].value.dirty)) {
					this._setUniform(this.uniforms[property], gl);
					this.uniforms[property].dirty = false;
				}
			}
			for (let property in this.baseUniforms) {
				if (this.baseUniforms.hasOwnProperty(property) && (this.baseUniforms[property].dirty || this.baseUniforms[property].value.dirty)) {
					this._setUniform(this.baseUniforms[property], gl);
					this.baseUniforms[property].dirty = false;
				}
			}
		}
	}
}
