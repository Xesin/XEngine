
namespace XEngine2 {

	export class ShaderVariant {
        public program: WebGLProgram;
        public uniforms: IDict<Uniform>;
        public vertexAttrs: IDict<VertexAttribute>;
        public samplers: Uniform[];

        constructor()
        {
            this.uniforms = new IDict<Uniform>();
            this.vertexAttrs = new IDict<VertexAttribute>();
            this.samplers = new Array<Uniform>();
        }
    }
}
