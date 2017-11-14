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
			"float res = 1.0 - floor(sqrt(dot(uvOffset, uvOffset)) + 0.51);",
			"if(res < 1.0) discard;",
			"gl_FragColor = vec4(res, res, res, 1.0) * vColor;",
		"}"
	],

	uniforms: {
	}
}

Object.assign(XEngine.ShaderLib.CircleColor.uniforms, XEngine.Shader.baseUniforms);

XEngine.ShaderLib.CircleColor.shader = new XEngine.Shader(XEngine.ShaderLib.CircleColor.vertexShader, XEngine.ShaderLib.CircleColor.fragmentShader, XEngine.ShaderLib.CircleColor.uniforms);