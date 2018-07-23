namespace XEngine {
	export class RenderTarget {
		public attachedTextures: IHash<WebGLTexture>;
		public frameBuffer: WebGLFramebuffer;
		public renderRenderBuffer: WebGLRenderbuffer;
		public widht: number;
		public height: number;

		private gl: WebGL2RenderingContext;
		private resourceManager: ResourceManager;

		constructor(renderer: Renderer, widht: number, height: number) {
			this.gl = renderer.context;
			let gl = this.gl;
			this.widht = widht;
			this.height = height;
			this.resourceManager = renderer.resourceManager;
			this.frameBuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
			// create a depth renderbuffer
			const depthBuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
			this.attachedTextures = new IHash();

			this.addAttachment(gl.COLOR_ATTACHMENT0);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, widht, height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		public addAttachment(attachmentType: number) {
			let gl = this.gl;
			let texture = this.resourceManager.createTexture(this.widht, this.height, null, WRAP_MODE.CLAMP, false);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentType, gl.TEXTURE_2D, texture, 0);
			this.attachedTextures[attachmentType] = texture;
		}
	}
}
