/// <reference path="ShaderCompiler.ts"/>
namespace XEngine {
	export let ShaderUniforms = {
		pMatrix: {
			value: null,
			type: Uniforms.MAT4X4,
		},
	};

	export class Shader {

		public uniforms: any;
		public baseUniforms: any;
		public vertPosAtt: number;
		public vertColAtt: number;
		public vertUvAtt: number;
		public vertAlphaAtt: number;
		public compiled: boolean;
		public shader: Shader;

		private shaderProgram: WebGLProgram;
		private vertexCode: Array<string>;
		private fragmentCode: Array<string>;


		constructor(vertexCode: Array<string>, fragmentCode: Array<string>, uniforms = {}) {
			this.uniforms = uniforms;
			this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
			this.vertColAtt = null;
			this.vertColAtt = null;
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
				alert(gl.getShaderInfoLog(vertexShader));
				this.compiled = true;
				return null;
			}

			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(fragmentShader));
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

		public setUniforms(gl: WebGLRenderingContext) {
			gl.useProgram(this.shaderProgram);

			this.vertPosAtt = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
			this.vertColAtt = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
			this.vertUvAtt = gl.getAttribLocation(this.shaderProgram, "vUv");
			this.vertAlphaAtt = gl.getAttribLocation(this.shaderProgram, "in_alpha");

			for (let property in this.uniforms) {
				if (this.uniforms.hasOwnProperty(property)) {
					this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
				}
			}

			for (let property in this.baseUniforms) {
				if (this.baseUniforms.hasOwnProperty(property)) {
					this.baseUniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
				}
			}
		}

		public getAttribLocation(gl: WebGLRenderingContext, attr: string) {
			return gl.getAttribLocation(this.shaderProgram, attr);
		}

		public _beginRender(gl: WebGLRenderingContext) {
			if (!this.compiled) { this.initializeShader(gl); }
			gl.useProgram(this.shaderProgram);
		}

		public bind(gl) {
			if (!this.compiled) { this.initializeShader(gl); }
			gl.useProgram(this.shaderProgram);
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
				if (this.uniforms.hasOwnProperty(property)) {
					this._setUniform(this.uniforms[property], gl);
					this.uniforms[property].prevVal = this.uniforms[property].value;
				}
			}
			for (let property in this.baseUniforms) {
				if (this.baseUniforms.hasOwnProperty(property)) {
					this._setUniform(this.baseUniforms[property], gl);
					this.baseUniforms[property].prevVal = this.baseUniforms[property].value;
				}
			}
		}
	}
}
