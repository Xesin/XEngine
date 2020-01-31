import {IHash} from "../../../Game";
import {Texture2D, WRAP_MODE} from "./Texture2D";

export class RenderTarget {

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

    public addAttachment(gl: WebGL2RenderingContext ,
        attachmentType: number, internalFormat: number = gl.RGBA,
        srcFormat: number = gl.RGBA, type: number =  gl.UNSIGNED_BYTE, textureCompare = false) {
        if (!this.attachedTextures[attachmentType]) {
            if (!this.frameBuffer) {
                this.frameBuffer = gl.createFramebuffer();
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

            let texture = Texture2D.createTexture(
                "", this.width, this.height, null, this.wrapMode, this.generateMipmaps, gl, false, internalFormat, srcFormat, type);

            gl.bindTexture(gl.TEXTURE_2D, texture._texture);

            if (textureCompare) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
            }

            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentType, gl.TEXTURE_2D, texture._texture, 0);
            this.attachedTextures[attachmentType] = texture;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            console.warn("Attachment of type ", attachmentType, " already attached");
        }
    }

    public bind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    public unBind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public release(gl: WebGL2RenderingContext) {
        gl.deleteFramebuffer(this.frameBuffer);

        for (const key in this.attachedTextures) {
            if (this.attachedTextures.hasOwnProperty(key)) {
                const element = this.attachedTextures[key];
                element.release(gl);
            }
        }
    }
}
