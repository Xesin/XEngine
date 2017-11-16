XEngine.Texture2D = function(name, width, height){
	this.imageName = name; //Nombre de la imagen
	this.image = null;
	this.frameWidth = width;
	this.frameHeight = height;
	this._texture = null;
	this.ready = false;
}

XEngine.Texture2D.prototype = {
	createTexture: function(gl){
		if(this.image == null) return;

		this._texture = gl.createTexture();
		const internalFormat = gl.RGBA;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);

		if (!this.isPowerOfTwo(this.image.width) || !this.isPowerOfTwo(this.image.height)) {
			// Scale up the texture to the next highest power of two dimensions.
			var canvas = document.createElement("canvas");
			canvas.width = this.nextHighestPowerOfTwo(this.image.width);
			canvas.height = this.nextHighestPowerOfTwo(this.image.height);
			var ctx = canvas.getContext("2d");
			ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
			this.image = canvas;
		}

		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, this.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		this.ready = true;
	},

	isPowerOfTwo:function(x) {
		return (x & (x - 1)) == 0;
	},
	
	nextHighestPowerOfTwo:function(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
}