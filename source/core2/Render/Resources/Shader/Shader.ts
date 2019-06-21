
namespace XEngine2 {

	export class Shader {

		private vertextCode: string;
		private fragmentCode: string;

		private attributeStride: number;

		public uniforms: Uniform[];
		public vertexAttrs: VertexAttribute[];

		public _shaderProgram: WebGLProgram;

		constructor(vertextCode: string, fragmentCode: string) {
			this.vertextCode = vertextCode;
			this.fragmentCode = fragmentCode;
			this.uniforms = new Array<Uniform>();
			this.vertexAttrs = new Array<VertexAttribute>();
			this.attributeStride = 0;
		}

		public initializeShader(gl: WebGL2RenderingContext) {
			this._shaderProgram = ShaderCompiler.compileShader(gl, this.vertextCode, this.fragmentCode);
			this.extractUniformsFromCode(gl);
		}

		private extractUniformsFromCode(gl: WebGL2RenderingContext)
		{
			let activeUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
			let activeAttributes = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
			
			// Uniforms
			for (var i = 0; i < activeUniforms; i++) {
				var uniform = gl.getActiveUniform(this._shaderProgram, i);
				let result = new Uniform(uniform.name, uniform.type, null, gl.getUniformLocation(this._shaderProgram, uniform.name));
				this.uniforms[uniform.name] = result;
			}
			
			// Attributes
			for (var i=0; i < activeAttributes; i++) {
				var attribute = gl.getActiveAttrib(this._shaderProgram, i);
				let type = attribute.type as ShaderType;
				let result = new VertexAttribute(i, attribute.name, type, null, gl.getAttribLocation(this._shaderProgram, attribute.name), this.attributeStride);
				this.vertexAttrs[attribute.name] = result;
				switch(result.type)
				{
					case ShaderType.INT:
					case ShaderType.FLOAT:
					case ShaderType.SHORT:
						this.attributeStride += 4;
						break;
					case ShaderType.INT_VEC2:
					case ShaderType.FLOAT_VEC2:
						this.attributeStride += 8;
						break;
					case ShaderType.INT_VEC3:
					case ShaderType.FLOAT_VEC3:
						this.attributeStride += 12;
					case ShaderType.INT_VEC4:
					case ShaderType.FLOAT_VEC4:
					case ShaderType.FLOAT_MAT2:
						this.attributeStride += 16;
				}
			}
		}

		public get attrStride() : number {
			return this.attributeStride;
		}
	}
}