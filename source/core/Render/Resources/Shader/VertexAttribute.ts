import {ShaderType} from "../Enums/ShaderType";

export class VertexAttribute {
    public index: number;
    public name: string;
    public offset: number;
    public normalized: boolean;
    public numItems: number;
    public itemSize: number;

    public _gpuPos: WebGLUniformLocation;
    private _type: ShaderType;

    constructor(index: number, name: string, type: ShaderType, _gpuPos: WebGLUniformLocation, offset: number, normalized = false) {
        this.index = index;
        this.name = name;
        this._type = type;
        this._gpuPos = _gpuPos;
        this.offset = offset;
        this.normalized = normalized;
        this.numItems = 0;

        switch (type) {
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
                    break;
                case ShaderType.INT_VEC4:
                case ShaderType.FLOAT_VEC4:
                case ShaderType.FLOAT_MAT2:
                case ShaderType.FLOAT_MAT4:
                    this.numItems += 4;
                    break;
            }
    }


    public get type(): ShaderType {
        switch (this._type) {
                case ShaderType.INT:
                case ShaderType.INT_VEC2:
                case ShaderType.INT_VEC3:
                case ShaderType.INT_VEC4:
                    return ShaderType.INT;
                case ShaderType.FLOAT:
                case ShaderType.FLOAT_VEC2:
                case ShaderType.FLOAT_VEC3:
                case ShaderType.FLOAT_VEC4:
                case ShaderType.FLOAT_MAT2:
                case ShaderType.FLOAT_MAT4:
                    return ShaderType.FLOAT;
            }
    }

}
