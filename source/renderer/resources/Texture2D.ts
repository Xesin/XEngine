namespace XEngine {
	export enum WRAP_MODE {
		CLAMP,
		REPEAT,
	}

	export class Texture2D {
		private _imageName: string;
		private _image: any;
		private _frameWidth: number;
		private _frameHeight: number;
		private _texture: WebGLTexture;
		public readonly isNormal: boolean;
		private _dirty: boolean;
		private _generateMipmaps: boolean;
		private _wrapMode: WRAP_MODE;

		constructor (name: string, width: number, height: number, wrapMode = WRAP_MODE.REPEAT, isNormal: boolean, generateMipmaps = true) {
			this.imageName = name;
			this.frameWidth = width;
			this.frameHeight = height;
			this._texture = null;
			this.dirty = true;
			this.wrapMode = wrapMode;
			this.isNormal = isNormal;
			this.generateMipmaps = generateMipmaps;
		}

		get imageName():string{
			return this._imageName;
		}

		set imageName(name: string){
			this._imageName = name;
		}

		get frameWidth():number{
			return this._frameWidth;
		}

		set frameWidth(width: number){
			this.dirty = true;
			this._frameWidth = width;
		}

		get frameHeight():number{
			return this._frameHeight;
		}

		set frameHeight(height: number){
			this.dirty = true;
			this._frameHeight = height;
		}

		get image():any{
			return this._image;
		}

		set image(image){
			this.dirty = true;
			this._image = image;
		}

		get texture():WebGLTexture{
			return this._texture;
		}

		set texture(texture : WebGLTexture){
			this.dirty = true;
			this._texture = texture;
		}

		get dirty():boolean{
			return this._dirty;
		}

		set dirty(dirty: boolean){
			this._dirty = dirty;
		}

		get wrapMode():WRAP_MODE{
			return this._wrapMode;
		}

		set wrapMode(mode: WRAP_MODE){
			this.dirty = true;
			this._wrapMode = mode;
		}

		get generateMipmaps():boolean{
			return this._generateMipmaps;
		}

		set generateMipmaps(generateMipmaps: boolean){
			this._generateMipmaps = generateMipmaps;
		}
	}
}
