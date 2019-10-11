/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="./BasicMaterial.ts"/>
/// <reference path="../../../../Math/Vector4.ts"/>
/// <reference path="../Shader/DesaturatePostProcessShader.ts"/>
/// <reference path="./FinalRenderMaterial.ts"/>
/// <reference path="../Shader/Uniform.ts"/>


namespace XEngine2
{
    export class DesaturatePostMaterial extends PostProcessMaterial
    {
        public static SharedInstance = new DesaturatePostMaterial();

        constructor(shader = new Shader(ShaderMaterialLib.DesaturatePostProcessShader.vertexShader, ShaderMaterialLib.DesaturatePostProcessShader.fragmentShader))
        {
            super(shader);
        }
    }
}