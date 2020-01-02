import {Shader} from "../Shader/Shader";
import {Material} from "./Material"
import * as ShaderMaterialLib from "../Shader/ShaderCode/ShaderMaterialLib"

export class BasicMaterial extends Material
{
    public static SharedInstance;

    constructor(shader = new Shader(ShaderMaterialLib.BasicShader.vertexShader, ShaderMaterialLib.BasicShader.fragmentShader))
    {
        super(shader);
    }
}
