
namespace XEngine2 {

	export class Shader {

		private vertextCode: string;
		private fragmentCode: string;

		public uniforms: Uniform[];
		public vertexAttrs: VertexAttribute[];

		public _shaderProgram: WebGLProgram;

		constructor(vertextCode: string, fragmentCode: string) {
			this.vertextCode = vertextCode;
			this.fragmentCode = fragmentCode;
			this.uniforms = new Array<Uniform>();
			this.vertexAttrs = new Array<VertexAttribute>();
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
				let result = new VertexAttribute(attribute.name, type, null, gl.getAttribLocation(this._shaderProgram, attribute.name));
				this.vertexAttrs[attribute.name] = result;
			}

		}
	}
}