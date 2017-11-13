
XEngine.ShaderCompiler = {
	compileVertexShader: function(verxtexString){
		return verxtexString.replace("#XBaseParams", "attribute vec3 aVertexPosition;\nuniform mat4 mvMatrix;\nuniform mat4 pMatrix;\n",)
	}
}