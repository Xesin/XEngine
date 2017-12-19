XEngine.ShaderLib = {}

XEngine.ShaderLib.SimpleColor = {
	vertexShader:[
		'#version 300 es',
		"#XBaseParams",
	  
		"void mainPass() {",
		"}"
	],
	fragmentShader:[
		'#version 300 es',
		"precision mediump float;",
		"#XBaseParams",

		"void main(void) {",
			"fragColor = vec4(vColor, alpha) * alpha;",
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