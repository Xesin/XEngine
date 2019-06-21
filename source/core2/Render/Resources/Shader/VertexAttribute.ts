
namespace XEngine2 {
    export class VertexAttribute{
        public index: number;
        public name: string;
        public type: ShaderType;
        public offset: number;
        public normalized: boolean;
        public numItems: number;
        public value: number | Mat4x4 | Vector3 | Vector4;
        
        public _gpuPos: WebGLUniformLocation;

        constructor(index: number, name: string, type: ShaderType, value: number | Mat4x4 | Vector3 | Vector4, _gpuPos: WebGLUniformLocation, offset: number, normalized = false)
        {
            this.index = index;
            this.name = name;
            this.type = type;
            this.value = value;
            this._gpuPos = _gpuPos;
            this.offset = offset;
            this.normalized = false;

            switch(type)
				{
					case ShaderType.INT:
					case ShaderType.FLOAT:
					case ShaderType.SHORT:
						this.numItems += 1;
						break;
					case ShaderType.INT_VEC2:
					case ShaderType.FLOAT_VEC2:
						this.numItems += 2;
						break;
					case ShaderType.INT_VEC3:
					case ShaderType.FLOAT_VEC3:
						this.numItems += 3;
					case ShaderType.INT_VEC4:
					case ShaderType.FLOAT_VEC4:
					case ShaderType.FLOAT_MAT2:
						this.numItems += 4;
				}
        }
    }
}