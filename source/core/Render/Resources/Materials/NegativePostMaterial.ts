import {Shader} from "../Shader/Shader";
import {PostProcessMaterial} from "./PostProcessMaterial"
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib"

export class NegativePostMaterial extends PostProcessMaterial
{
    public static SharedInstance;

    constructor(shader = new Shader(ShaderMaterialLib.NegativePostProcessShader.vertexShader, ShaderMaterialLib.NegativePostProcessShader.fragmentShader))
    {
        super(shader);
    }
}
