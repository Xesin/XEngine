XEngine.ShaderLib.CircleColor = {
	vertexShader:[
		'#version 300 es',
		"#XBaseParams",
	  
		"void mainPass(void) {",
		"}"
	],
	fragmentShader:[
		'#version 300 es',
		"precision mediump float;",
		"#XBaseParams",
		
		"void main(void) {",
			"vec2 uvOffset = uv - 0.5;",
			"float distance = length(uvOffset);",
			"float res = smoothstep(distance,distance+0.04,0.5);",
			"if(res < 0.1) discard;",
			"fragColor = vec4(1.0, 1.0, 1.0, res) * res * vColor;",
		"}"
	],
}



XEngine.CircleColorShader = function(){
	this.uniforms = {};
	XEngine.Shader.call(this, XEngine.ShaderLib.CircleColor.vertexShader, XEngine.ShaderLib.CircleColor.fragmentShader, this.uniforms);
}

XEngine.CircleColorShader.prototype = Object.create(XEngine.Shader.prototype);
XEngine.CircleColorShader.constructor = XEngine.CircleColorShader;

XEngine.CircleColorShader.prototypeExtends = {
	
}

Object.assign(XEngine.CircleColorShader.prototype, XEngine.CircleColorShader.prototypeExtends);

XEngine.ShaderLib.CircleColor.shader = new XEngine.CircleColorShader();