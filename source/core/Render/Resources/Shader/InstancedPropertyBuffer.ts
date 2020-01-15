import {VertexAttribute} from "./VertexAttribute";

export class InstancedPropertyBuffer {


    public bufferType: number;
    public buffer: WebGLBuffer;
    private gl: WebGL2RenderingContext;
    public attributes: Array<any>;
    public mode: number;

    public static SetDiry() {
    }

    constructor(gl: WebGL2RenderingContext, buffer: WebGLBuffer, mode: number = gl.DYNAMIC_DRAW) {
        this.gl = gl;
        this.bufferType = gl.ARRAY_BUFFER;
        this.buffer = buffer;
        this.attributes = new Array<any>();
        this.mode = mode;
    }

    public addAttribute(vertexAttribute: VertexAttribute, stride: number, offset: number, locOffset: number) {
        let gl = this.gl;
        let loc = vertexAttribute.index + locOffset;
        this.bind();
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(
            loc,
            vertexAttribute.numItems,
            vertexAttribute.type,
            vertexAttribute.normalized,
            stride,
            offset,
        );
        gl.vertexAttribDivisor(loc, 1);
    }

    public updateResource(bufferData: Float32Array | Uint32Array) {
        let gl = this.gl;

        gl.bindBuffer(this.bufferType, this.buffer);
        gl.bufferSubData(this.bufferType, 0, bufferData);
        gl.bindBuffer(this.bufferType, null);
    }

    public bind() {
        let gl = this.gl;

        gl.bindBuffer(this.bufferType, this.buffer);
    }

    public unbind() {
        let gl = this.gl;
        gl.bindBuffer(this.bufferType, null);
    }

    public destroy() {
        let gl = this.gl;
        this.unbind();
        gl.deleteBuffer(this.buffer);
    }

    public static Create(target: number, initialDataOrSize: number, usage: number, gl: WebGL2RenderingContext): InstancedPropertyBuffer {
        let buffer = gl.createBuffer();

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, initialDataOrSize, usage);

        return new InstancedPropertyBuffer(gl, buffer);
    }
}
