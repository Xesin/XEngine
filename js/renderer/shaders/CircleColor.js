XEngine.ShaderLib.CircleColor = {
	vertexShader:[
		"#XBaseParams",

		"varying lowp vec4 vColor;",
		"varying highp vec2 uv;",
	  
		"void main(void) {",
		  "gl_Position = pMatrix * mvMatrix * vec4(aVertexPosition, 1.0);",
		  "vec4 asdf = aVertexColor;",
		  "vColor = aVertexColor;",
		  "uv = vUv;",
		"}"
	],
	fragmentShader:[
		"precision mediump float;",
		"varying lowp vec4 vColor;",
		"varying highp vec2 uv;",
		
		"void main(void) {",
			"vec2 uvOffset = uv - 0.5;",
			"float distance = length(uvOffset);",
			"float res = smoothstep(distance,distance+0.04,0.5);",
			"gl_FragColor = vec4(1.0, 1.0, 1.0, res) * res * vColor;",
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