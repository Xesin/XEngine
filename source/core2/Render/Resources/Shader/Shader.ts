
namespace XEngine2 {

	export class Shader {

		private vertextCode: string;
		private fragmentCode: string;

		private attributeStride: number;

		public uniforms: IDict<Uniform>;
		public samplers: Uniform[];
		public vertexAttrs: VertexAttribute[];

		public _shaderProgram: WebGLProgram;

		constructor(vertextCode: string, fragmentCode: string) {
			this.vertextCode = vertextCode;
			this.fragmentCode = fragmentCode;
			this.uniforms = new IDict<Uniform>();
			this.vertexAttrs = new Array<VertexAttribute>();
			this.samplers = new Array<Uniform>();
			this.attributeStride = 0;
		}

		public initializeShader(gl: WebGL2RenderingContext) {
			if(this._shaderProgram == null || this._shaderProgram == undefined){
				this._shaderProgram = ShaderCompiler.compileShader(gl, this.vertextCode, this.fragmentCode);
				if(this._shaderProgram)
					this.extractUniformsFromCode(gl);
			}
		}

		private extractUniformsFromCode(gl: WebGL2RenderingContext)
		{
			let activeUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
			let activeAttributes = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
			
			// Uniforms
			for (var i = 0; i < activeUniforms; i++) {
				var uniform = gl.getActiveUniform(this._shaderProgram, i);
				let result = new Uniform(uniform.name, uniform.type, null, gl.getUniformLocation(this._shaderProgram, uniform.name));
				if(uniform.type == gl.SAMPLER_2D)
				{
					result.samplerNumber = this.samplers.length;
					this.samplers.push(result);
				}
				this.uniforms[uniform.name] = result;
			}
			
			// Attributes
			for (var i=0; i < activeAttributes; i++) {
				var attribute = gl.getActiveAttrib(this._shaderProgram, i);
				let type = attribute.type as ShaderType;
				let result = new VertexAttribute(i, attribute.name, type, gl.getAttribLocation(this._shaderProgram, attribute.name), this.attributeStride, false);
				this.vertexAttrs[attribute.name] = result;
				switch(type)
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
						break;
					case ShaderType.INT_VEC4:
					case ShaderType.FLOAT_VEC4:
					case ShaderType.FLOAT_MAT2:
						this.attributeStride += 16;
						break;
				}
			}
		}

		public get attrStride() : number {
			return this.attributeStride;
		}
	}
}