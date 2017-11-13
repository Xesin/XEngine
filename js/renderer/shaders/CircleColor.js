XEngine.ShaderLib.CircleColor = {
	vertexShader:[
		"#XBaseParams",

		"attribute vec2 vUv;",

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
			"gl_FragColor = vec4(uv.y, uv.y, 0.0, 1.0);",
		"}"
	],

	uniforms: {
	}
}

Object.assign(XEngine.ShaderLib.CircleColor.uniforms, XEngine.Shader.baseUniforms);

XEngine.ShaderLib.CircleColor.shader = new XEngine.Shader(XEngine.ShaderLib.CircleColor.vertexShader, XEngine.ShaderLib.CircleColor.fragmentShader, XEngine.ShaderLib.CircleColor.uniforms);