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

        public albedo: Texture2D;
        public opacity: Texture2D;
        public color: Color;
        public alphaClip: number;

        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "opacity" : "white",
            "albedo": "white",
            "alphaClip" : 0.6
        }

        constructor(shader = new Shader(ShaderMaterialLib.ShadowCasterShader.vertexShader, ShaderMaterialLib.ShadowCasterShader.fragmentShader))
        {
            super(shader);
            this.cullMode = CullMode.FRONT;
        }
    }
}