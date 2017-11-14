XEngine.ShaderLib = {}

XEngine.ShaderLib.SimpleColor = {
	vertexShader:[
		"#XBaseParams",
		"varying lowp vec4 vColor;",
	  
		"void main(void) {",
		  "gl_Position = pMatrix * mvMatrix * vec4(aVertexPosition, 1.0);",
		  "vec2 uv = vUv;",
		  "vColor = aVertexColor;",
		"}"
	],
	fragmentShader:[
		"precision mediump float;",
		"varying lowp vec4 vColor;",

		"void main(void) {",
			"gl_FragColor = vColor;",
		"}"
	],

}

XEngine.SimpleColorShader = function(){
	this.uniforms = {};
	XEngine.Shader.call(this, XEngine.ShaderLib.SimpleColor.vertexShader, XEngine.ShaderLib.SimpleColor.fragmentShader, this.uniforms);
}

XEngine.SimpleColorShader.prototype = Object.create(XEngine.Shader.prototype);
XEngine.SimpleColorShader.constructor = XEngine.SimpleColorShader;

XEngine.SimpleColorShader.prototypeExtends = {
	
}

Object.assign(XEngine.SimpleColorShader.prototype, XEngine.SimpleColorShader.prototypeExtends);

XEngine.ShaderLib.SimpleColor.shader = new XEngine.SimpleColorShader();