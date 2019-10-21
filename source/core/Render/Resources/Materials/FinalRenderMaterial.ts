/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/FinalRenderShader.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class PostProcessMaterial extends BasicMaterial
    {
        public static SharedInstance = new PostProcessMaterial();

        public mainTex: Texture2D;
        public depthTex: Texture2D;

        public defaults = 
        {
            "mainTex": "white",
            "depthTex" : "white"
        }

        constructor(shader = new Shader(ShaderMaterialLib.FinalRenderShader.vertexShader, ShaderMaterialLib.FinalRenderShader.fragmentShader))
        {
            super(shader);
            this.depthTestEnabled = false;
            this.cullMode = CullMode.NONE;
        }
    }
}