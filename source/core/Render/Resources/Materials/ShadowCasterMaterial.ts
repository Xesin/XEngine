import {Shader} from "../Shader/Shader";
import {BasicMaterial} from "./BasicMaterial";
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib";
import {Texture2D} from "../Texture/Texture2D";
import {Color, Vector4} from "../../../../Math/Mathf";
import {CullMode} from "../Enums/_module/Enums";

export class ShadowCasterMaterial extends BasicMaterial {
    public static SharedInstance;

    public albedo: Texture2D;
    public opacity: Texture2D;
    public color: Color;
    public alphaClip: number;

    public defaults =
    {
        "albedo": "white",
        "alphaClip" : 0.6,
        "color": new Vector4(1, 1, 1, 1),
        "opacity" : "white",
    };

    constructor(
        shader = new Shader(ShaderMaterialLib.ShadowCasterShader.vertexShader, ShaderMaterialLib.ShadowCasterShader.fragmentShader)) {
        super(shader);
        this.cullMode = CullMode.FRONT;
    }
}
