namespace XEngine2 {

	export class RenderTarget{
		
		public width: number;
		public height: number;
		public generateMipmaps: boolean;
		public wrapMode: WRAP_MODE;

		public frameBuffer: WebGLFramebuffer;
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
			if(!this.attachedTextures[attachmentType]){
				if(!this.frameBuffer)
				{
					this.frameBuffer = gl.createFramebuffer();
				}

				gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
				if (attachmentType == gl.DEPTH_ATTACHMENT){
					let texture = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F , this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

					gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentType, gl.TEXTURE_2D, texture, 0);
					
					let texture2D = new Texture2D("", this.width, this.height, WRAP_MODE.CLAMP, false);
					texture2D._texture = texture;
					this.attachedTextures[attachmentType] = texture2D;

					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
					gl.bindTexture(gl.TEXTURE_2D, null);
				}
				else
				{
					let texture = Texture2D.createTexture("", this.width, this.height, null, this.wrapMode, this.generateMipmaps, gl, false);
				
					gl.bindTexture(gl.TEXTURE_2D, texture._texture);

					gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentType, gl.TEXTURE_2D, texture._texture, 0);
					this.attachedTextures[attachmentType] = texture;

					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
					gl.bindTexture(gl.TEXTURE_2D, null);
				}
				
			} else
			{
				console.warn("Attachment of type ", attachmentType, " already attached");
			}
		}

		public bind(gl: WebGL2RenderingContext)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		}

		public unBind(gl: WebGL2RenderingContext)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		public release(gl: WebGL2RenderingContext)
		{
			gl.deleteFramebuffer(this.frameBuffer);

			for (const key in this.attachedTextures) {
				if (this.attachedTextures.hasOwnProperty(key)) {
					const element = this.attachedTextures[key];
					element.release(gl);
				}
			}
		}
	}
}
