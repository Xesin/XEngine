XEngine.Texture2D = function(name, width, height, wrapMode){
	this.imageName = name; //Nombre de la imagen
	this.image = null;
	this.frameWidth = width;
	this.frameHeight = height;
	this._texture = null;
	this.ready = false;
	this.wrapMode = wrapMode || 2;
}

XEngine.Texture2D.WRAP_MODES={
	CLAMP:1,
	WRAP:2,
}

XEngine.Texture2D.prototype = {
	createTexture: function(gl){
		if(this.image == null) return;

		this._texture = gl.createTexture();
		const internalFormat = gl.RGBA;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);

		if(this.wrapMode == XEngine.Texture2D.WRAP_MODES.WRAP){
			gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}else{
			gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		this.ready = true;
	},
}