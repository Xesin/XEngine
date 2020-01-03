import {Shader} from "../Shader/Shader";
import {PhongMaterial} from "./PhongMaterial";
import {Vector4, Color} from "../../../../Math/Mathf";
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib";

export class BlinnPhongMaterial extends PhongMaterial {
    public static SharedInstance;

    public smoothness: number;
    public specularColor: Color;

    public defaults =
    {
        "albedo": "white",
        "alphaClip" : 0.6,
        "ambient" : new Vector4(1, 1, 1, 0.15),
        "bias": 0.005,
        "color": new Vector4(1, 1, 1, 1),
        "normal" : "normal",
        "opacity" : "white",
        "shadowMap" : "depth",
        "smoothness" : 0.2,
        "specularColor": new Vector4(1, 1, 1, 0.2),
    };

    constructor(shader = new Shader(ShaderMaterialLib.BlinnPhongShader.vertexShader, ShaderMaterialLib.BlinnPhongShader.fragmentShader)) {
        super(shader);
    }
}
