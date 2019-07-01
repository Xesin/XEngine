/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="../Shader/BasicShader.ts"/>

namespace XEngine2
{
    export class BasicMaterial extends Material
    {
        public static SharedInstance = new BasicMaterial();

        constructor(shader = new Shader(ShaderMaterialLib.BasicShader.vertexShader, ShaderMaterialLib.BasicShader.fragmentShader))
        {
            super(shader);
        }
    }
}