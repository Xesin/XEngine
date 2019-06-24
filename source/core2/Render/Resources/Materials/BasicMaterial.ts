/// <reference path="Material.ts"/>
/// <reference path="../Shader/Shader.ts"/>
/// <reference path="../Shader/ShaderMaterialLib.ts"/>

namespace XEngine2
{
    export class BasicMaterial extends Material
    {
        public static SharedInstance = new BasicMaterial();

        constructor()
        {
            super(new Shader(ShaderMaterialLib.BasicShader.vertexShader.join('\n'), ShaderMaterialLib.BasicShader.fragmentShader.join('\n')));
        }
    }
}