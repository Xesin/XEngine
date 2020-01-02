import {Shader} from "../Shader/Shader";
import {BasicMaterial} from "./BasicMaterial"
import {Texture2D} from "../Texture/Texture2D"
import {Vector4,Color} from "../../../../Math/Mathf";
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib"

export class PhongMaterial extends BasicMaterial
{
    public static SharedInstance;

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
