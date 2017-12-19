XEngine.ShaderLib.Sprite = {
	vertexShader:[
		'#version 300 es',
		"#XBaseParams",

		"void mainPass() {",
		"}"
	],
	fragmentShader:[
		'#version 300 es',
		"precision mediump float;",
		"uniform sampler2D texSampler;",
		"#XBaseParams",

		"void main(void) {",
			"vec4 texCol = texture(texSampler, uv);",
			"texCol.rgb *= texCol.w;",
			//"if(texCol.a >= 0.8){",
			"if(texCol.a <= 0.05) discard;",
			"texCol.xyz *= vColor;",
			"fragColor = texCol*alpha;",
			//"}else{",
			//	"gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);",
			//"}",
		"}"
	],

}

XEngine.SpriteShader = function(){
	XEngine.Shader.call(this, XEngine.ShaderLib.Sprite.vertexShader, XEngine.ShaderLib.Sprite.fragmentShader, this.uniforms);
}

XEngine.SpriteShader.prototype = Object.create(XEngine.Shader.prototype);
XEngine.SpriteShader.constructor = XEngine.SpriteShader;

XEngine.SpriteShader.prototypeExtends = {
	_setTexture: function(texture){
		this.texture = texture;
	},

	bind:function(gl){
		XEngine.Shader.prototype.bind.call(this, gl);
	},

	_beginRender: function(gl){
		XEngine.Shader.prototype._beginRender.call(this, gl);
		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);
		
		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}
}

Object.assign(XEngine.SpriteShader.prototype, XEngine.SpriteShader.prototypeExtends);

XEngine.ShaderLib.Sprite.shader = new XEngine.SpriteShader();