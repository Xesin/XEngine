/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/PhongShader.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class PhongMaterial extends BasicMaterial
    {
        public static SharedInstance = new PhongMaterial();

        public albedoSamplerName = "albedoTex";
        public normalSamplerName = "normalTex";
        public opacitySamplerName = "opacityTex";
        public colorName = "color";
        public ambientName = "ambient";
        public alphaClipName = "alphaClip"

        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "ambient" : new Vector4(1,1,1,0.025),
            "opacityTex" : "white",
            "normal" : "normal",
            "albedo": "white",
            "alphaClip" : 0.6
        }

        constructor(shader = new Shader(ShaderMaterialLib.PhongShader.vertexShader, ShaderMaterialLib.PhongShader.fragmentShader))
        {
            super(shader);
        }

        public get color(): Uniform
        {
            return this.shader.uniforms[this.colorName];
        }

        public get ambient(): Uniform
        {
            return this.shader.uniforms[this.ambientName];
        }
        
        public get albedo(): Uniform
        {
            return this.shader.uniforms[this.albedoSamplerName];
        }
        
        public get normal(): Uniform
        {
            return this.shader.uniforms[this.normalSamplerName];
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