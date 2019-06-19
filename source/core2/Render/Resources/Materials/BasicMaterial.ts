/// <reference path="Material.ts"/>

namespace XEngine2
{
    export class BasicMaterial extends Material
    {
        constructor()
        {
            super(new Shader(ShaderMaterialLib.BasicShader.vertexShader.join('\n'), ShaderMaterialLib.BasicShader.fragmentShader.join('\n')));
        }
    }
}