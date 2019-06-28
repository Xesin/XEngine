/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="../Shader/PhongShader.ts"/>

namespace XEngine2
{
    export class PhongMaterial extends BasicMaterial
    {
        public static SharedInstance = new PhongMaterial();

        public albedoSamplerName = "albedoTex";
        public opacitySamplerName = "opacityTex";
        public colorName = "color";
        public ambientName = "ambient";

        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "ambient" : new Vector4(1,1,1,0.2),
        }

        constructor(shader = new Shader(ShaderMaterialLib.PhongShader.vertexShader.join('\n'), ShaderMaterialLib.PhongShader.fragmentShader.join('\n')))
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
        
        public get albedo(): Uniform{
            return this.shader.uniforms[this.albedoSamplerName];
        }
        
        public get opacityMask(): Uniform{
            return this.shader.uniforms[this.opacitySamplerName];
        }
    }
}