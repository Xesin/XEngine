XEngine.ShaderLib.Sprite = {
	vertexShader:[
		"#XBaseParams",
		"varying lowp vec4 vColor;",
		"varying highp vec2 uv;",

		"void main(void) {",
		  "gl_Position = pMatrix * mvMatrix * vec4(aVertexPosition, 1.0);",
		  "uv = vUv;",
		  "vColor = aVertexColor;",
		"}"
	],
	fragmentShader:[
		"precision mediump float;",
		"uniform sampler2D texSampler;",
		"varying lowp vec4 vColor;",
		"varying highp vec2 uv;",

		"void main(void) {",
			"vec4 texCol = texture2D(texSampler, uv);",
			"texCol.rgb *= texCol.w;",
			//"if(texCol.a >= 0.8){",
			"if(texCol.a <= 0.05) discard;",
			"gl_FragColor = texCol*vColor;",
			//"}else{",
			//	"gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);",
			//"}",
		"}"
	],

}

XEngine.SpriteShader = function(){
	this.uniforms = {
		texSampler:{
			value:0
		}
	};
	XEngine.Shader.call(this, XEngine.ShaderLib.Sprite.vertexShader, XEngine.ShaderLib.Sprite.fragmentShader, this.uniforms);
}

XEngine.SpriteShader.prototype = Object.create(XEngine.Shader.prototype);
XEngine.SpriteShader.constructor = XEngine.SpriteShader;

XEngine.SpriteShader.prototypeExtends = {
	_setTexture: function(texture){
		this.texture = texture;
	},

	_beginRender: function(gl){
		gl.useProgram(this.shaderProgram);
		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);
		
		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}
}

Object.assign(XEngine.SpriteShader.prototype, XEngine.SpriteShader.prototypeExtends);

XEngine.ShaderLib.Sprite.shader = new XEngine.SpriteShader();