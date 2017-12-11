
XEngine.ShaderCompiler = {
	compileVertexShader: function(verxtexString){
		return verxtexString.replace("#XBaseParams", "in vec2 aVertexPosition;\nin vec4 aVertexColor;\nin vec2 vUv;\nuniform mat4 mvMatrix;\nuniform mat4 pMatrix;\n",)
	}
}