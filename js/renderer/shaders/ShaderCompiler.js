
XEngine.ShaderCompiler = {
	compileVertexShader: function(verxtexString){
		return verxtexString.replace("#XBaseParams", "attribute vec3 aVertexPosition;\nattribute vec4 aVertexColor;\nattribute vec2 vUv;\nuniform mat4 mvMatrix;\nuniform mat4 pMatrix;\n",)
	}
}