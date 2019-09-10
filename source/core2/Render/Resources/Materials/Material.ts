
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
        public normalMatrixName = "normalMatrix";
        public lightsUniformName = "light";

        public renderQueue = RenderQueue.OPAQUE;
        public cullMode = CullMode.BACK;
        public blendMode = BlendMode.Multiply;
        public writeDepthEnabled = true;
        public depthTestEnabled = true;

        public static currentMaterial: Material;

        public defaults: any;

        constructor(shader: Shader)
        {
            this.shader = shader;
        }

        public initialize(gl: WebGL2RenderingContext)
        {
           this.shader.initializeShader(gl);
           for (const key in this.defaults) {
               if (this.defaults.hasOwnProperty(key)) {
                   const defValue = this.defaults[key];
                   if(this[key])
                   {
                        if(this[key].type == ShaderType.SAMPLER_2D)
                        {
                            
                            switch(defValue )
                            {
                                case "white":
                                    this[key].value = Texture2D.whiteTexture;
                                    break;
                                case "black":
                                this[key].value = Texture2D.blackTexture;
                                    break;
                                case "normal":
                                this[key].value = Texture2D.normalTexture;
                                    break;
                            }
                        }
                        else
                        this[key].value = defValue;
                   }
               }
           }
        }

        public updateUniforms(gl: WebGL2RenderingContext)
        {
            for (let key in this.shader.uniforms) {
                const uniform = this.shader.uniforms[key];
                if(uniform.value != null)
                    this.setUniform(uniform, gl);
            }
            for (let i = 0; i < this.shader.samplers.length; i++) {
                const sampler = this.shader.samplers[i];
                if(sampler != undefined && sampler.value != undefined){
                    gl.activeTexture(this.sampleIndexToGL_Sample(sampler.samplerNumber, gl));
                    gl.bindTexture(gl.TEXTURE_2D, (sampler.value as Texture2D)._texture);
                }
                else
                {
                    gl.activeTexture(this.sampleIndexToGL_Sample(i, gl));
                    gl.bindTexture(gl.TEXTURE_2D, Texture2D.normalTexture._texture);
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
        
        public get normalMatrix() : Uniform {
            return this.shader.uniforms[this.normalMatrixName];
        }

        public get AttrStride() : number
        {
            return this.shader.attrStride;
        }

        public get VertexAttributes() : IDict<VertexAttribute>
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
                
                gl.depthMask(this.writeDepthEnabled);
                if(this.depthTestEnabled)
                {
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(gl.LEQUAL);
                }
                else
                {
                    gl.disable(gl.DEPTH_TEST);
                }

                if(this.renderQueue == RenderQueue.TRANSPARENT)
                {
                    gl.enable(gl.BLEND);
                    gl.blendEquation(gl.FUNC_ADD);
                    switch (this.blendMode) {
    					case BlendMode.Multiply:
                            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            break;
                        case BlendMode.Add:
                            gl.blendFunc(gl.ONE, gl.ONE);
                            break;
                        case BlendMode.Substract:
                            gl.blendFunc(gl.ONE, gl.ONE);
                            gl.blendEquation(gl.FUNC_SUBTRACT);
                            break;
                        case BlendMode.None:
                            gl.disable(gl.BLEND);
    				}
                }
                else
                {
                    gl.disable(gl.BLEND);
                }

                switch (this.cullMode) {
                    case CullMode.BACK:
                        gl.cullFace(gl.BACK);
                        break;
                    case CullMode.FRONT:
                        gl.cullFace(gl.FRONT);
                        break;
                    case CullMode.BOTH:
                        gl.cullFace(gl.FRONT_AND_BACK);
                        break;
                    case CullMode.NONE:
                        gl.cullFace(gl.NONE);
                        break;
                }                
            }    
        }

        public getLightUniform(index: number, name: string)
        {
            return this.shader.uniforms[this.lightsUniformName+'[' + index + '].'+name];            
        }


        private setUniform(uniform: Uniform, gl:WebGL2RenderingContext) {
            if(!uniform.Dirty) return;
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
                case ShaderType.BOOL:
                    let boolean = uniform.value as boolean;
                    gl.uniform1i(uniform._gpuPos, boolean ? 1 : 0);
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
            PhongMaterial.SharedInstance.initialize(gl);
            BlinnPhongMaterial.SharedInstance.initialize(gl);
        }
    }
}