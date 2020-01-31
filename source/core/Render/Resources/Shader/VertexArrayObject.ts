
export class VertexArrayobject {

    private static CurrentVertexBuffer: VertexArrayobject;

    public vao: WebGLVertexArrayObject;
    private gl: WebGL2RenderingContext;

    public static SetDiry() {
        VertexArrayobject.CurrentVertexBuffer = null;
    }

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
    }

    public bind() {
        if (VertexArrayobject.CurrentVertexBuffer !== this) {
            this.gl.bindVertexArray(this.vao);
            VertexArrayobject.CurrentVertexBuffer = this;
        }
    }

    public unbind() {
        if (VertexArrayobject.CurrentVertexBuffer !== this) {
            this.gl.bindVertexArray(null);
            VertexArrayobject.CurrentVertexBuffer = null;
        }
    }

    public destroy() {
        if (VertexArrayobject.CurrentVertexBuffer === this) {
            this.unbind();
            this.gl.deleteVertexArray(this.vao);
        }
    }

    public static Create(gl: WebGL2RenderingContext): VertexArrayobject {
        return new VertexArrayobject(gl);
    }
}
