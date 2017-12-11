XEngine.ShaderUniforms ={
	mvMatrix:{ 
		value: null,
		type: XEngine.Uniforms.MAT4X4
	},
	pMatrix:{
		value: null,
		type: XEngine.Uniforms.MAT4X4
	},
}

XEngine.Shader = function(vertexCode, fragmentCode, uniforms){
	this.uniforms = uniforms || {};
	this.baseUniforms = JSON.parse(JSON.stringify(XEngine.ShaderUniforms));
	this.vertPostAtt = null;
	this.vertColAtt = null;
	this.shaderProgram = null;
	this.compiled = false;
	this.vertexCode = vertexCode;
	this.fragmentCode = fragmentCode;
}


XEngine.Shader.prototype = {
	initializeShader: function(gl) {
		var vertString = "";
		var fragmentString = "";

		for(var i = 0; i < this.vertexCode.length; i++){
			vertString += this.vertexCode[i]+"\n";
		}

		vertString = XEngine.ShaderCompiler.compileVertexShader(vertString);

		for(var j = 0; j < this.fragmentCode.length; j++){
			fragmentString += this.fragmentCode[j]+"\n";
		}

		fragmentString = XEngine.ShaderCompiler.compileFragmentShader(fragmentString);
	
		var vertexShader;
		var fragmentShader
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
	
		gl.shaderSource(vertexShader, vertString);
		gl.compileShader(vertexShader);
		gl.shaderSource(fragmentShader, fragmentString);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vertexShader));
			this.compiled = true;
			return null;
		}

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(fragmentShader));
			this.compiled = true;
			return null;
		}

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vertexShader);
		gl.attachShader(this.shaderProgram, fragmentShader);
		gl.linkProgram(this.shaderProgram);
	  
		if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
		  alert("Could not initialise shaders");
		  this.compiled = true;
		}
		this.compiled = true;
		this.setUniforms(gl);
	},

	setUniforms: function(gl){
		gl.useProgram(this.shaderProgram);

		this.vertPostAtt = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.vertColAtt = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
		this.vertUvAtt = gl.getAttribLocation(this.shaderProgram, "vUv");
		
		gl.enableVertexAttribArray(this.vertPostAtt);
		gl.enableVertexAttribArray(this.vertColAtt);
		gl.enableVertexAttribArray(this.vertUvAtt);
		for (var property in this.uniforms) {
			if (this.uniforms.hasOwnProperty(property)) {
				this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
			}
		}

		for (var property in this.baseUniforms) {
			if (this.baseUniforms.hasOwnProperty(property)) {
				this.baseUniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
			}
		}
	},

	_beginRender: function(gl){
		if(!this.compiled) this.initializeShader(gl);
		gl.useProgram(this.shaderProgram);
	},

	_setUniform(uniform, gl){
		var valueType = uniform.type;
		switch(valueType){
			case XEngine.Uniforms.INTEGER:
				gl.uniform1i(uniform.gpuPosition, uniform.value);
				break;
			case XEngine.Uniforms.FLOAT:
				gl.uniform1f(uniform.gpuPosition, uniform.value);
				break;
			case XEngine.Uniforms.VECTOR2:
				gl.uniform2fv(uniform.gpuPosition, uniform.value);
				break;
			case XEngine.Uniforms.VECTOR3:
				gl.uniform3fv(uniform.gpuPosition, uniform.value);
				break;
			case XEngine.Uniforms.VECTOR4:
				gl.uniform4fv(uniform.gpuPosition, uniform.value);
				break;
			case XEngine.Uniforms.MAT2X2:
				gl.uniformMatrix2fv(uniform.gpuPosition, false, value);
				break;
			case XEngine.Uniforms.MAT3X3:
				gl.uniformMatrix3fv(uniform.gpuPosition, false, uniform.value);
				break;
			case XEngine.Uniforms.MAT4X4:
				gl.uniformMatrix4fv(uniform.gpuPosition, false, uniform.value);
				break;
			default:
				gl.uniform1f(uniform.gpuPosition, uniform.value);
				break;
		}
	},

	updateUniforms: function(gl){
		for (var property in this.uniforms) {
			//if(this.uniforms[property].value != this.uniforms[property].prevVal){
				this._setUniform(this.uniforms[property], gl);
				this.uniforms[property].prevVal = this.uniforms[property].value;
			//}
		}
		for (var property in this.baseUniforms) {
			//if(this.baseUniforms[property].value != this.baseUniforms[property].prevVal){
				this._setUniform(this.baseUniforms[property], gl);
				this.baseUniforms[property].prevVal = this.baseUniforms[property].value;
			//}
		}
	}
	
}