
XEngine.ShaderCompiler = {
	compileVertexShader: function(verxtexString){
		return verxtexString.replace("#XBaseParams", "attribute vec3 aVertexPosition;\nattribute vec4 aVertexColor;\nuniform mat4 mvMatrix;\nuniform mat4 pMatrix;\n",)
	}
}