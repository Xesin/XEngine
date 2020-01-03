import {Shader} from "../Shader/Shader";
import {BasicMaterial} from "./BasicMaterial";
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib";
import { Texture2D } from "../../Renderer";
import { RenderQueue } from "../Enums/RenderQueue";

export class FontMaterial extends BasicMaterial {
    public static SharedInstance;

    public fontMap: Texture2D;

    public defaults =
    {
        "fontMap": "white",
    };

    constructor(shader = new Shader(ShaderMaterialLib.FontShader.vertexShader, ShaderMaterialLib.FontShader.fragmentShader)) {
        super(shader);
        this.renderQueue = RenderQueue.INTERFACE;
    }
}
