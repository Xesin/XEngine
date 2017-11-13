XEngine.ShaderLib = {}

XEngine.ShaderLib.SimpleColorShader = {
	vertexShader:[
		"#XBaseParams",
		"varying lowp vec4 vColor;",
	  
		"void main(void) {",
		  "gl_Position = pMatrix * mvMatrix * vec4(aVertexPosition, 1.0);",
		  "vec4 asdf = aVertexColor;",
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

	uniforms: {
	}
}

Object.assign(XEngine.ShaderLib.SimpleColorShader.uniforms, XEngine.Shader.baseUniforms);

XEngine.ShaderLib.SimpleColorShader.shader = new XEngine.Shader(XEngine.ShaderLib.SimpleColorShader.vertexShader, XEngine.ShaderLib.SimpleColorShader.fragmentShader, XEngine.ShaderLib.SimpleColorShader.uniforms);