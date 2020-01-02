import {Shader} from "../Shader/Shader";
import {PostProcessMaterial} from "./PostProcessMaterial"
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib"

export class DesaturatePostMaterial extends PostProcessMaterial
{
    public static SharedInstance;

    constructor(shader = new Shader(ShaderMaterialLib.DesaturatePostProcessShader.vertexShader, ShaderMaterialLib.DesaturatePostProcessShader.fragmentShader))
    {
        super(shader);
    }
}
