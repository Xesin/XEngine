
namespace XEngine2 {
    export class VertexAttribute{
        public name: string;
        public type: ShaderType;
        public value: number | Mat4x4 | Vector3 | Vector4;
        
        public _gpuPos: WebGLUniformLocation;

        constructor(name: string, type: ShaderType, value: number | Mat4x4 | Vector3 | Vector4, _gpuPos: WebGLUniformLocation)
        {
            this.name = name;
            this.type = type;
            this.value = value;
            this._gpuPos = _gpuPos;
        }
    }
}