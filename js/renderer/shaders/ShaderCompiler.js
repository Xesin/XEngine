
XEngine.Uniforms = {
	FLOAT: 0,
	INTEGER: 1,
	MAT2X2: 2,
	MAT3X3: 3,
	MAT4X4: 4,
	VECTOR2: 5,
	VECTOR3: 6,
	VECTOR4: 7,
	SAMPLER: 8,
}

XEngine.ShaderCompiler = {

	vertexBaseParams:[
		"in vec2 aVertexPosition;",
		"in vec2 vUv;",
		"in vec3 aVertexColor;",
		"in float in_alpha;",
		"uniform mat4 pMatrix;",
		"out highp vec2 uv;",
		"vec4 vertPos;",
		"out lowp vec3 vColor;",
		"out lowp float alpha;"
	],

	fragmentBaseParams:[
		"in lowp vec3 vColor;",
		"in highp vec2 uv;",
		"in float alpha;",
		"out vec4 fragColor;",
	],

	vertexMain: [
		"void main(void) {",
			"vertPos = pMatrix * vec4(aVertexPosition, -1.0, 1.0);",
			"uv = vUv;",
			"vColor = aVertexColor;",
			"alpha = in_alpha;",
			"mainPass();",
			"gl_Position = vertPos;",
		"}"
	],

	compileVertexShader: function(verxtexString){
		var verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
		verxtexString += this.vertexMain.join("\n");
		return verxtexString;
	},

	compileFragmentShader: function(fragmentString){
		var fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n"));
		return fragmentString;
	}
}