
namespace XEngine2 {
    export class Uniform{
        public name: string;
        public type: ShaderType;
        public bDirty: boolean;
        public samplerNumber: number;
        
        public _gpuPos: WebGLUniformLocation;
        private _value: number | Mat4x4 | Vector3 | Vector4 | Texture2D | boolean;

        constructor(name: string, type: ShaderType, value: number | Mat4x4 | Vector3 | Vector4 | Texture2D | boolean, _gpuPos: WebGLUniformLocation, samplerNumber = -1)
        {
            this.name = name;
            this.type = type;
            this._value = value;
            this._gpuPos = _gpuPos;
            this.bDirty = true;
            this.samplerNumber = samplerNumber;
        }

        
        public get value() : number | Mat4x4 | Vector3 | Vector4 | Texture2D | boolean {
            return this._value;
        }

        public get Dirty()
        {
            return this.bDirty || ((this.value instanceof Vector3 || this.value instanceof Vector4) ? (this.value as Vector3 | Vector4).Dirty : false)
        }

        public set Dirty(newValue: boolean)
        {
            this.bDirty = newValue;
            if(this.value instanceof Vector3 || this.value instanceof Vector4) 
                 (this.value as Vector3 | Vector4).Dirty = newValue;

        }

        
        public set value(v : number | Mat4x4 | Vector3 | Vector4 | Texture2D | boolean ) {
            switch(this.type)
            {
                case ShaderType.FLOAT_MAT4:
                    let tmpVal = v as Mat4x4;
                    if(!tmpVal.Equals(this.value as Mat4x4))
                    {
                        this.Dirty = true;
                        this._value = v;
                    }
                    break;
                case ShaderType.FLOAT_VEC3:
                    let vec3 = v as Vector3;
                    if(!vec3.Equals(this.value as Vector3))
                    {
                        this.Dirty = true;
                        this._value = v;
                    }
                    break;
                case ShaderType.FLOAT_VEC4:
                    let vec4 = v as Vector4;
                    if(!vec4.Equals(this.value as Vector4))
                    {
                        this.Dirty = true;
                        this._value = v;
                    }
                    break;
                case ShaderType.SAMPLER_2D:
                case ShaderType.SAMPLER_2D_SHADOW:
                    let sampler = v as Texture2D;
                    if(!sampler.Equals(this.value as Texture2D))
                    {
                        this.Dirty = true;
                        this._value = v;
                    }
                    break;
                case ShaderType.BOOL:
                        let boolean = v as boolean;
                        if(boolean != (this.value as boolean))
                        {
                            this.Dirty = true;
                            this._value = v;
                        }
                        break;
                default:
                    if(v != this._value){
                        this._value = v;
                        this.Dirty = true;
                    }
            }
        }   
        
        
    }
}