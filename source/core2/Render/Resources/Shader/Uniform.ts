
namespace XEngine2 {
    export class Uniform{
        public name: string;
        public type: ShaderType;
        public bDirty: boolean;
        
        public _gpuPos: WebGLUniformLocation;
        private _value: number | Mat4x4 | Vector3 | Vector4;

        constructor(name: string, type: ShaderType, value: number | Mat4x4 | Vector3 | Vector4, _gpuPos: WebGLUniformLocation)
        {
            this.name = name;
            this.type = type;
            this._value = value;
            this._gpuPos = _gpuPos;
            this.bDirty = true;
        }

        
        public get value() : number | Mat4x4 | Vector3 | Vector4 {
            return this._value;
        }

        
        public set value(v : number | Mat4x4 | Vector3 | Vector4) {
            if((v as number) && v != this._value){
                this._value = v;
                this.bDirty = true;
            }
            else if ((v as Mat4x4))
            {
                let tmpVal = v as Mat4x4;
                if(!tmpVal.Equal(this.value as Mat4x4))
                {
                    this.bDirty = true;
                    this.value = v;
                }
            }
            else if(v as Vector3)
            {
                let tmpVal = v as Vector3;
                if(!tmpVal.Equal(this.value as Vector3))
                {
                    this.bDirty = true;
                    this.value = v;
                }
            } else if(v as Vector4)
            {
                let tmpVal = v as Vector4;
                if(!tmpVal.Equal(this.value as Vector4))
                {
                    this.bDirty = true;
                    this.value = v;
                }
            }
        }
        
        
    }
}