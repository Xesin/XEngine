import {Shader} from "../Shader/Shader";
import {BasicMaterial} from "./BasicMaterial";
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib";
import {Texture2D} from "../Texture/Texture2D";
import {CullMode} from "../Enums/_module/Enums";

export class PostProcessMaterial extends BasicMaterial {
    public static SharedInstance;

    public mainTex: Texture2D;
    public depthTex: Texture2D;

    public defaults =
    {
        "depthTex" : "white",
        "mainTex": "white",
    };

    constructor(shader = new Shader(ShaderMaterialLib.FinalRenderShader.vertexShader, ShaderMaterialLib.FinalRenderShader.fragmentShader)) {
        super(shader);
        this.depthTestEnabled = false;
        this.cullMode = CullMode.NONE;
    }
}
