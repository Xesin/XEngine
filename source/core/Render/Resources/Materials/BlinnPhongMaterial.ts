/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./PhongMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/BlinnPhongShader.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class BlinnPhongMaterial extends PhongMaterial
    {
        public static SharedInstance = new BlinnPhongMaterial();

        public smoothness: number;
        public specularColor: Color;

        public defaults = 
        {
            "color": new Vector4(1,1,1,1),
            "ambient" : new Vector4(1,1,1,0.15),
            "opacity" : "white",
            "normal" : "normal",
            "shadowMap" : "depth",
            "albedo": "white",
            "alphaClip" : 0.6,
            "smoothness" : 0.2,
            "specularColor": new Vector4(1,1,1,0.2),
            "bias": 0.005
        }

        constructor(shader = new Shader(ShaderMaterialLib.BlinnPhongShader.vertexShader, ShaderMaterialLib.BlinnPhongShader.fragmentShader))
        {
            super(shader);
        }
    }
}