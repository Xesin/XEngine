/// <reference path="ShaderCompiler.ts"/>
namespace XEngine {
	export let ShaderUniforms = {

	};

	export class Material {

		public uniforms: any;
		public baseUniforms: any;
		public compiled: boolean;
		public shader: Material;

		public shaderProgram: WebGLProgram;
		private vertexCode: Array<string>;
		private fragmentCode: Array<string>;

		constructor(vertexCode: Array<string>, fragmentCode: Array<string>, uniforms = {}) {
			this.uniforms = uniforms;
			this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
			this.baseUniforms.pMatrix = {
				type: Uniforms.MAT4X4,
				value: mat4.create(),
			};
			this.baseUniforms.mvMatrix = {
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
		}

		public initializeShader(gl: WebGLRenderingContext) {
			let vertString = "";
			let fragmentString = "";

			for (let i = 0; i < this.vertexCode.length; i++) {
				vertString += this.vertexCode[i] + "\n";
			}

			vertString = XEngine.ShaderCompiler.compileVertexShader(vertString);

			for (let j = 0; j < this.fragmentCode.length; j++) {
				fragmentString += this.fragmentCode[j] + "\n";
			}

			fragmentString = XEngine.ShaderCompiler.compileFragmentShader(fragmentString);

			let vertexShader;
			let fragmentShader;
			fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			vertexShader = gl.createShader(gl.VERTEX_SHADER);

			gl.shaderSource(vertexShader, vertString);
			gl.compileShader(vertexShader);
			gl.shaderSource(fragmentShader, fragmentString);
			gl.compileShader(fragmentShader);

			if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
				alert("vertex shader error: " + gl.getShaderInfoLog(vertexShader) + "\n" + vertexShader);
				this.compiled = true;
				return null;
			}

			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				alert("fragment shader error: " + gl.getShaderInfoLog(fragmentShader) + "\n" + fragmentShader);
				this.compiled = true;
				return null;
			}

			this.shaderProgram = gl.createProgram();
			gl.attachShader(this.shaderProgram, vertexShader);
			gl.attachShader(this.shaderProgram, fragmentShader);
			gl.linkProgram(this.shaderProgram);

			if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
				alert("Could not initialise shaders");
				this.compiled = true;
			}
			this.compiled = true;
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
						get: function() {
							return this._value;
						},
						set: function(val) {
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
						get: function() {
							return this._value;
						},
						set: function(val) {
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
				case XEngine.Uniforms.FLOAT:
					gl.uniform1f(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.VECTOR2:
					gl.uniform2fv(uniform.gpuPosition, uniform.value);
					break;
				case XEngine.Uniforms.VECTOR3:
					gl.uniform3fv(uniform.gpuPosition, uniform.value);
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
