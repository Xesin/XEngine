/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/ShadowCasterShader.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class ShadowCasterMaterial extends BasicMaterial
    {
        public static SharedInstance = new ShadowCasterMaterial();

        public albedoSamplerName = "albedoTex";
        public opacitySamplerName = "opacityTex";
        public colorName = "color";
        public alphaClipName = "alphaClip";

        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "opacityTex" : "white",
            "albedo": "white",
            "alphaClip" : 0.6
        }

        constructor(shader = new Shader(ShaderMaterialLib.ShadowCasterShader.vertexShader, ShaderMaterialLib.ShadowCasterShader.fragmentShader))
        {
            super(shader);
            this.cullMode = CullMode.FRONT;
        }

        public get color(): Uniform
        {
            return this.shader.uniforms[this.colorName];
        }
        
        public get albedo(): Uniform
        {
            return this.shader.uniforms[this.albedoSamplerName];
        }
        

        public get opacityTex(): Uniform
        {
            return this.shader.uniforms[this.opacitySamplerName];
        }

        public get alphaClip(): Uniform
        {
            return this.shader.uniforms[this.alphaClipName];
        }
    }
}