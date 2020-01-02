import {Shader} from "../Shader/Shader";
import {Mat4x4, Vector3, Vector4} from "../../../../Math/Mathf";
import {RenderQueue, CullMode, BlendMode, ShaderType} from "../Enums/_module/Enums"
import {Texture2D} from "../Texture/Texture2D"
import {VertexAttribute} from "../Shader/VertexAttribute"
import {IDict} from "../../../Game"
import {Uniform} from "../Shader/Uniform"
import {BasicMaterial, PhongMaterial, BlinnPhongMaterial, PostProcessMaterial, ShadowCasterMaterial, NegativePostMaterial, DesaturatePostMaterial} from "./_module/Materials"

export class Material {

    public shader : Shader;

    public vertexPositionName = "aVertexPosition";
    public colorsAttrName = "aVertexColor";
    public normalAttrName = "aVertexNormal";
    public uvAttrName = "aUV";
    public secondUVsAttrName = "aUV2";
    public modelMatrix: Mat4x4;
    public viewMatrix: Mat4x4;
    public pMatrix: Mat4x4;
    public normalMatrix: Mat4x4;
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
        this.modelMatrix = new Mat4x4().identity();
        this.viewMatrix = new Mat4x4().identity();
        this.pMatrix = new Mat4x4().identity();
        this.normalMatrix = new Mat4x4().identity();
    }

    public initialize(gl: WebGL2RenderingContext)
    {
        this.shader.updateShader(gl);
        for (const key in this.defaults) {
            if (this.defaults.hasOwnProperty(key)) {
                const defValue = this.defaults[key];
                if(this.hasUniform(key))
                {
                    if(this.getUniform(key).type == ShaderType.SAMPLER_2D || this.getUniform(key).type == ShaderType.SAMPLER_2D_SHADOW )
                    {
                        
                        switch(defValue )
                        {
                            case "white":
                                this[key] = Texture2D.whiteTexture;
                                break;
                            case "black":
                                this[key] = Texture2D.blackTexture;
                                break;
                            case "normal":
                                this[key] = Texture2D.normalture;
                                break;
                            case "depth":
                                this[key] = Texture2D.depthTexture; 
                                break;
                        }
                    }
                    else
                    this[key] = defValue;
                }
            }
        }
    }

    public updateUniforms(gl: WebGL2RenderingContext)
    {
        this.bind(gl);
        for (let key in this.shader.currentVariant.uniforms) {
            const uniform = this.shader.currentVariant.uniforms[key];
            if(this.hasOwnProperty(key))
            {
                uniform.value = this[key];
            }
            if(uniform.value != null)
                this.setUniformData(uniform, gl);
        }
        for (let i = 0; i < this.shader.currentVariant.samplers.length; i++) {
            const sampler = this.shader.currentVariant.samplers[i];
            if(sampler != undefined && sampler.value != undefined){
                gl.activeTexture(this.sampleIndexToGL_Sample(sampler.samplerNumber, gl));
                gl.bindTexture(gl.TEXTURE_2D, (sampler.value as Texture2D)._texture);
            }
            else
            {
                gl.activeTexture(this.sampleIndexToGL_Sample(i, gl));
                gl.bindTexture(gl.TEXTURE_2D, Texture2D.normalture._texture);
            }
        }
    }

    private sampleIndexToGL_Sample(samplerIndex: number, gl: WebGL2RenderingContext)
    {
        return gl.TEXTURE0 + samplerIndex;
    }
    
    public get vPosition() : VertexAttribute {
        return this.shader.currentVariant.vertexAttrs[this.vertexPositionName];
    }

    public get vColor() : VertexAttribute {
        return this.shader.currentVariant.vertexAttrs[this.colorsAttrName];
    }

    public get vNormal() : VertexAttribute {
        return this.shader.currentVariant.vertexAttrs[this.normalAttrName];
    }

    public get vUv() : VertexAttribute {
        return this.shader.currentVariant.vertexAttrs[this.uvAttrName];
    }

    public get vUv2() : VertexAttribute {
        return this.shader.currentVariant.vertexAttrs[this.secondUVsAttrName];
    }

    public get AttrStride() : number
    {
        return this.shader.attrStride;
    }

    public get VertexAttributes() : IDict<VertexAttribute>
    {
        return this.shader.currentVariant.vertexAttrs;
    }

    public get HasPosition(): boolean
    {
        return this.vertexPositionName in this.shader.currentVariant.vertexAttrs;
    }

    public get HasUVs(): boolean
    {
        return this.uvAttrName in this.shader.currentVariant.vertexAttrs;
    }

    public get HasSecondUVs(): boolean
    {
        return this.secondUVsAttrName in this.shader.currentVariant.vertexAttrs;
    }

    public get HasColor(): boolean
    {
        return this.colorsAttrName in this.shader.currentVariant.vertexAttrs;
    }

    public get HasNormals(): boolean
    {
        return this.normalAttrName in this.shader.currentVariant.vertexAttrs;
    }

    public get ShaderProgram(): WebGLProgram
    {
        return this.shader.currentVariant.program;
    }

    public updateVariants(gl: WebGL2RenderingContext)
    {
        this.shader.updateShader(gl);
    }

    public bind(gl: WebGL2RenderingContext): boolean
    {
        if(Material.currentMaterial !== this)
        {
            if(this.ShaderProgram){
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
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.BACK);
                        break;
                    case CullMode.FRONT:
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.FRONT);
                        break;
                    case CullMode.BOTH:
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.FRONT_AND_BACK);
                        break;
                    case CullMode.NONE:
                        gl.disable(gl.CULL_FACE);
                        break;
                }
            }
            return false;
        }    
        return true;
    }

    public getLightUniform(index: number, name: string)
    {
        return this.shader.currentVariant.uniforms[this.lightsUniformName+'[' + index + '].'+name];            
    }


    private setUniformData(uniform: Uniform, gl:WebGL2RenderingContext) {
        if(!uniform.Dirty) return;
        let valueType = uniform.type;
        switch (valueType) {
            case ShaderType.INT:
                gl.uniform1i(uniform._gpuPos, uniform.value as number);
                break;
            case ShaderType.SAMPLER_2D:
            case ShaderType.SAMPLER_2D_SHADOW:
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
        uniform.Dirty = false;
    }
    
    public static initStaticMaterials(gl: WebGL2RenderingContext)
    {
        BasicMaterial.SharedInstance = new BasicMaterial();
        BasicMaterial.SharedInstance.initialize(gl);
        PhongMaterial.SharedInstance = new PhongMaterial();
        PhongMaterial.SharedInstance.initialize(gl);
        BlinnPhongMaterial.SharedInstance = new BlinnPhongMaterial();
        BlinnPhongMaterial.SharedInstance.initialize(gl);
        PostProcessMaterial.SharedInstance = new PostProcessMaterial();
        PostProcessMaterial.SharedInstance.initialize(gl);
        ShadowCasterMaterial.SharedInstance = new ShadowCasterMaterial();
        ShadowCasterMaterial.SharedInstance.initialize(gl);
        NegativePostMaterial.SharedInstance = new NegativePostMaterial();
        NegativePostMaterial.SharedInstance.initialize(gl);
        DesaturatePostMaterial.SharedInstance = new DesaturatePostMaterial();
        DesaturatePostMaterial.SharedInstance.initialize(gl);
    }

    public hasUniform(name: string): boolean
    {
        return this.shader.currentVariant.uniforms[name] != null || this.shader.currentVariant.uniforms[name] != undefined;
    }

    public setUniform(name: string, value: any)
    {
        if(this.hasUniform(name))
        {
            this.shader.currentVariant.uniforms[name].value = value;
        }
    }

    public getUniform(name: string): Uniform
    {
        return this.shader.currentVariant.uniforms[name];
    }

    public hasSampler(samplerPos: number): boolean
    {
        return this.shader.currentVariant.samplers[samplerPos ] != null || this.shader.currentVariant.samplers[name] != undefined;
    }

    public setShaderSampler(samplerPos: number, value: any)
    {
        if(this.hasSampler(samplerPos))
        {
            this.shader.currentVariant.samplers[samplerPos].value = value;
        }
    }

    public enableKeyword(newKeyword: string)
    {
        if(this.shader.enabledWords.indexOf(newKeyword) == -1)
        {
            this.shader.enabledWords.push(newKeyword)
        }
    }

    public disableKeyword(keyword: string)
    {
        if(this.shader.enabledWords.indexOf(keyword) != -1)
        {
            this.shader.enabledWords.splice(this.shader.enabledWords.indexOf(keyword), 1);
        }
    }
}