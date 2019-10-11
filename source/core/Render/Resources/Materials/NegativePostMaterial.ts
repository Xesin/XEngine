/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/NegativePostProcess.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class NegativePostMaterial extends PostProcessMaterial
    {
        public static SharedInstance = new NegativePostMaterial();

        constructor(shader = new Shader(ShaderMaterialLib.NegativePostProcessShader.vertexShader, ShaderMaterialLib.NegativePostProcessShader.fragmentShader))
        {
            super(shader);
        }
    }
}