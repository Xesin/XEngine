
namespace XEngine2 {

	export class Material {

        public shader : Shader;

        public vertexPositionName = "aVertexPosition";
        public modelMatrixName = "modelMatrix";
        public viewMatrixName = "viewMatrix";
        public projMatrixName = "pMatrix";

        constructor(shader: Shader)
        {
            this.shader = shader;
        }

        public updateUniforms(gl: WebGL2RenderingContext)
        {
            for (let i = 0; i < this.shader.uniforms.length; i++) {
                const uniform = this.shader.uniforms[i];
                this.setUniform(uniform, gl);
            }
        }
        
        public get vPosition() : VertexAttribute {
            return this.shader.vertexAttrs[this.vertexPositionName];
        }

        public get modelMatrix() : Uniform
        {
            return this.shader.uniforms[this.modelMatrixName];
        }
        
        public get viewMatrix() : Uniform
        {
            return this.shader.uniforms[this.viewMatrixName];
        }

        public get projectionMatrix() : Uniform
        {
            return this.shader.uniforms[this.projMatrixName];
        }

        public get AttrStride() : number
        {
            return 0;
        }

        public get HasPosition(): boolean
        {
            return this.vertexPositionName in this.shader.vertexAttrs;
        }

        public get HasUVs(): boolean
        {
            return false;
        }

        public get HasColor(): boolean
        {
            return false;
        }

        public get HasNormals(): boolean
        {
            return false;
        }

        public get ShaderProgram(): WebGLProgram
        {
            return this.shader._shaderProgram;
        }


        private setUniform(uniform: Uniform, gl:WebGL2RenderingContext) {
			let valueType = uniform.type;
			switch (valueType) {
				case ShaderType.INT:
					gl.uniform1i(uniform._gpuPos, uniform.value as number);
					break;
				case ShaderType.SAMPLER_2D:
					gl.uniform1i(uniform._gpuPos, uniform.value as number);
					break;
				case ShaderType.FLOAT:
					gl.uniform1f(uniform._gpuPos, uniform.value as number);
					break;
				case ShaderType.FLOAT_VEC2:
                    let v2 = uniform.value as Vector3;
					gl.uniform2fv(uniform._gpuPos, [v2.x, v2.y, v2.z]);
					break;
				case ShaderType.FLOAT_VEC3:
                    let v3 = uniform.value as Vector3;
					gl.uniform3fv(uniform._gpuPos, [v3.x, v3.y, v3.z]);
					break;
				case ShaderType.FLOAT_VEC4:
                    let v4 = uniform.value as Vector4;
					gl.uniform4fv(uniform._gpuPos, [v4.x, v4.y, v4.z, v4.w]);
					break;
				case ShaderType.FLOAT_MAT4:
                    let mat4x4 = uniform.value as Mat4x4;
					gl.uniformMatrix4fv(uniform._gpuPos, false, mat4x4.elements);
					break;
				default:
					gl.uniform1f(uniform._gpuPos, uniform.value as number);
					break;
			}
		}
    }
}