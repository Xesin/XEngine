namespace XEngine2 {

	export class RenderTarget{
		
		public width: number;
		public height: number;
		public generateMipmaps: boolean;
		public wrapMode: WRAP_MODE;

		public frameBuffer: WebGLFramebuffer;
		private renderBuffer: WebGLRenderbuffer;
		public attachedTextures: IHash<Texture2D>;

		constructor (width: number, height: number, wrapMode = WRAP_MODE.REPEAT, generateMipmaps = true) {
			this.width = width;
			this.height = height;
			this.wrapMode = wrapMode;
			this.generateMipmaps = generateMipmaps;
			this.attachedTextures = new IHash();
		}

		public addAttachment(gl: WebGL2RenderingContext ,attachmentType: number)
		{
			let texture = Texture2D.createTexture("", this.width, this.height, null, this.wrapMode, this.generateMipmaps, gl, false);


			if(!this.frameBuffer)
			{
				this.frameBuffer = gl.createFramebuffer();
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

			if(!this.renderBuffer)
			{
				this.renderBuffer = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
			}
			else
			{
				gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
			}

			

			gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentType, gl.TEXTURE_2D, texture._texture, 0);
			this.attachedTextures[attachmentType] = texture;
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}

		public bind(gl: WebGL2RenderingContext)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
		}

		public unBind(gl: WebGL2RenderingContext)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}

		public release(gl: WebGL2RenderingContext)
		{
			gl.deleteFramebuffer(this.frameBuffer);
			gl.deleteRenderbuffer(this.renderBuffer);

			for (const key in this.attachedTextures) {
				if (this.attachedTextures.hasOwnProperty(key)) {
					const element = this.attachedTextures[key];
					element.release(gl);
				}
			}
		}
	}
}
