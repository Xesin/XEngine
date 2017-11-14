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

	uniforms: {
	}
}

Object.assign(XEngine.ShaderLib.SimpleColor.uniforms, XEngine.Shader.baseUniforms);

XEngine.ShaderLib.SimpleColor.shader = new XEngine.Shader(XEngine.ShaderLib.SimpleColor.vertexShader, XEngine.ShaderLib.SimpleColor.fragmentShader, XEngine.ShaderLib.SimpleColor.uniforms);