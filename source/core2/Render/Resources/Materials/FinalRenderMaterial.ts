/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/FinalRenderShader.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class FinalRenderMaterial extends BasicMaterial
    {
        public static SharedInstance = new FinalRenderMaterial();

        public mainTexSamplerName = "mainTex";

        public defaults = 
        {
            "mainTex": "white",
        }

        constructor(shader = new Shader(ShaderMaterialLib.FinalRenderShader.vertexShader, ShaderMaterialLib.FinalRenderShader.fragmentShader))
        {
            super(shader);
        }

        public get mainTex(): Uniform
        {
            return this.shader.uniforms[this.mainTexSamplerName];
        }
    }
}