XEngine.ShaderLib = {}

XEngine.ShaderLib.SimpleColor = {
	vertexShader:[
		'#version 300 es',
		"#XBaseParams",
		"out lowp vec4 vColor;",
	  
		"void main(void) {",
		  "gl_Position = pMatrix * mvMatrix * vec4(aVertexPosition, -1.0, 1.0);",
		  "vec2 uv = vUv;",
		  "vColor = aVertexColor;",
		"}"
	],
	fragmentShader:[
		'#version 300 es',
		"precision mediump float;",
		"in lowp vec4 vColor;",
		"out vec4 fragColor;",

		"void main(void) {",
			"fragColor = vColor;",
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