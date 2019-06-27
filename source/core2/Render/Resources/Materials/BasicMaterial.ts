/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="../Shader/BasicShader.ts"/>

namespace XEngine2
{
    export class BasicMaterial extends Material
    {
        public static SharedInstance = new BasicMaterial();

        constructor(shader = new Shader(ShaderMaterialLib.BasicShader.vertexShader.join('\n'), ShaderMaterialLib.BasicShader.fragmentShader.join('\n')))
        {
            super(shader);
        }
    }
}