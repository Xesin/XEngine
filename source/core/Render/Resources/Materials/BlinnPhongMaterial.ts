import {Shader} from "../Shader/Shader";
import {PhongMaterial} from "./PhongMaterial"
import {Vector4,Color} from "../../../../Math/Mathf";
import * as ShaderMaterialLib from "../Shader/ShaderMaterialLib"

export class BlinnPhongMaterial extends PhongMaterial
{
    public static SharedInstance;

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
        "bias": 0.005,
        "lightMap": "black",
    }

    constructor(shader = new Shader(ShaderMaterialLib.BlinnPhongShader.vertexShader, ShaderMaterialLib.BlinnPhongShader.fragmentShader))
    {
        super(shader);
    }
}