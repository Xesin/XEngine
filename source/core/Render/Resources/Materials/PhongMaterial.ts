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

        public albedo: Texture2D;
        public normal: Texture2D;
        public opacity: Texture2D;
        public color: Color;
        public ambient: Color;
        public alphaClip: number;
        public shadowMap: Texture2D;

        public lightMap: Texture2D;


        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "ambient" : new Vector4(1,1,1,0.025),
            "opacity" : "white",
            "normal" : "normal",
            "shadowMap" : "depth",
            "albedo": "white",
            "alphaClip" : 0.6,
            "lightMap": "black",
        }

        constructor(shader = new Shader(ShaderMaterialLib.PhongShader.vertexShader, ShaderMaterialLib.PhongShader.fragmentShader))
        {
            super(shader);
            this.enableKeyword("LIGHTNING_ON");
        }
    }
}