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
			this.baseUniforms.pMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.modelMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.viewMatrix = {
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
				gpuLoc: this.getAttribLocation(renderer.context, "aVertexPosition"),
				items: 3,
				normalized: false,
				offset: 0,
				type: renderer.context.FLOAT,
			},
			);
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.context, "vUv"),
				items: 2,
				normalized: false,
				offset: 12,
				type: renderer.context.FLOAT,
			},
			);
			attrs.push({
				gpuLoc: this.getAttribLocation(renderer.context, "aVertexColor"),
				items: 4,
				normalized: false,
				offset: 20,
				type: renderer.context.FLOAT,
			},
			);

			return attrs;
		}

		public setUniforms(gl: WebGLRenderingContext) {
			gl.useProgram(this.shaderProgram);

			for (let property in this.uniforms) {
				if (this.uniforms.hasOwnProperty(property)) {
					let uniformValue = this.uniforms[property].value;
					this.baseUniforms[property].dirty = false;
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
			if (!this.compiled) { this.initializeShader(renderer.context); }
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

		public updateUniforms(gl: WebGLRenderingContext) {
			for (const property in this.uniforms) {
				if (this.uniforms.hasOwnProperty(property) && this.uniforms[property].dirty) {
					this._setUniform(this.uniforms[property], gl);
					this.uniforms[property].dirty = false;
				}
			}
			for (let property in this.baseUniforms) {
				if (this.baseUniforms.hasOwnProperty(property) && this.baseUniforms[property].dirty) {
					this._setUniform(this.baseUniforms[property], gl);
					this.baseUniforms[property].dirty = false;
				}
			}
		}
	}
}
