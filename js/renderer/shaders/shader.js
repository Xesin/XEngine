XEngine.ShaderUniforms ={
	mvMatrix:{ 
		value: null,
	},
	pMatrix:{
		value: null
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
		gl.useProgram(this.shaderProgram);
	},

	_setUniform(uniform, gl){
		var valueType = uniform.value.constructor
		if(valueType === Number){
			if(uniform.value % 1 === 0){
				gl.uniform1i(uniform.gpuPosition, uniform.value);
			}else{
				gl.uniform1f(uniform.gpuPosition, uniform.value);
			}
		}else if(valueType === Array){
			var length = uniform.value.length;
			switch(length){
				case 2:
					gl.uniform2fv(uniform.gpuPosition, uniform.value);
				break;
				case 3:
					gl.uniform3fv(uniform.gpuPosition, uniform.value);
				break;
				case 4:
					gl.uniform4fv(uniform.gpuPosition, uniform.value);
				break;
			}
		}else if(valueType === Float32Array){
			var length = uniform.value.length;
			switch(length){
			case 5:
				var value = new Array(4);
				for(var i = 0; i < 4; i++){
					value[i] = uniform.value[i];
				}
				gl.uniformMatrix2fv(uniform.gpuPosition, false, value);
				break;
			case 9:
				gl.uniformMatrix3fv(uniform.gpuPosition, false, uniform.value);
				break;
			case 16:
				gl.uniformMatrix4fv(uniform.gpuPosition, false, uniform.value);
				break;
			}
			
		}
	},

	updateUniforms: function(gl){
		for (var property in this.uniforms) {
			if (this.uniforms.hasOwnProperty(property)) {
				this._setUniform(this.uniforms[property], gl);
			}
		}
		for (var property in this.baseUniforms) {
			if (this.baseUniforms.hasOwnProperty(property)) {
				this._setUniform(this.baseUniforms[property], gl);
			}
		}
	}
	
}