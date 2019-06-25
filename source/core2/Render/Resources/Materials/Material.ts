
namespace XEngine2 {

	export class Material {

        public shader : Shader;

        public vertexPositionName = "aVertexPosition";
        public colorsAttrName = "aVertexColor";
        public normalAttrName = "aVertexNormal";
        public uvAttrName = "aUV";
        public modelMatrixName = "modelMatrix";
        public viewMatrixName = "viewMatrix";
        public projMatrixName = "pMatrix";
        public mvpMatrixName = "mvpMatrix";

        public renderQueue = RenderQueue.OPAQUE;

        public static currentMaterial: Material;

        constructor(shader: Shader)
        {
            this.shader = shader;
        }

        public initialize(gl: WebGL2RenderingContext)
        {
            this.shader.initializeShader(gl);
           
        }

        public updateUniforms(gl: WebGL2RenderingContext)
        {
            for (let key in this.shader.uniforms) {
                const uniform = this.shader.uniforms[key];
                this.setUniform(uniform, gl);
            }
            for (let i = 0; i < this.shader.samplers.length; i++) {
                const sampler = this.shader.samplers[i];
                gl.activeTexture(this.sampleIndexToGL_Sample(i, gl));
                if(sampler != undefined && sampler.value != undefined){
                    gl.bindTexture(gl.TEXTURE_2D, (sampler.value as Texture2D)._texture);
                }
                else
                {
                    gl.bindTexture(gl.TEXTURE_2D, Texture2D.whiteTexture._texture);
                }
            }
        }

        private sampleIndexToGL_Sample(samplerIndex: number, gl: WebGL2RenderingContext)
        {
            return gl.TEXTURE0 + samplerIndex;
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

        public get mvpMatrix() : Uniform
        {
            return this.shader.uniforms[this.mvpMatrixName];
        }

        public get AttrStride() : number
        {
            return this.shader.attrStride;
        }

        public get VertexAttributes() : Array<VertexAttribute>
        {
            return this.shader.vertexAttrs;
        }

        public get HasPosition(): boolean
        {
            return this.vertexPositionName in this.shader.vertexAttrs;
        }

        public get HasUVs(): boolean
        {
            return this.uvAttrName in this.shader.vertexAttrs;
        }

        public get HasColor(): boolean
        {
            return this.colorsAttrName in this.shader.vertexAttrs;;
        }

        public get HasNormals(): boolean
        {
            return this.normalAttrName in this.shader.vertexAttrs;
        }

        public get ShaderProgram(): WebGLProgram
        {
            return this.shader._shaderProgram;
        }

        public bind(gl: WebGL2RenderingContext)
        {
            if(Material.currentMaterial !== this)
            {
                gl.useProgram(this.ShaderProgram);
                Material.currentMaterial = this;

                // for (let i = 0; i < this.shader.samplers.length; i++) {
                //     const sampler = this.shader.samplers[i];
                //     gl.bindTexture(sampler.samplerNumber, (sampler.value as Texture2D)._texture);
                // }
            }    
        }


        private setUniform(uniform: Uniform, gl:WebGL2RenderingContext) {
            // if(!uniform.bDirty) return;
			let valueType = uniform.type;
			switch (valueType) {
				case ShaderType.INT:
					gl.uniform1i(uniform._gpuPos, uniform.value as number);
					break;
				case ShaderType.SAMPLER_2D:
					gl.uniform1i(uniform._gpuPos, uniform.samplerNumber);
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
            uniform.bDirty = false;
        }
        
        public static initStaticMaterials(gl: WebGL2RenderingContext)
        {
            BasicMaterial.SharedInstance.initialize(gl);
        }
    }
}