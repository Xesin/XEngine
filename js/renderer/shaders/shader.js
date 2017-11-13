XEngine.Shader = function(vertexCode, fragmentCode, uniforms = XEngine.Shader.baseUniforms){
	this.uniforms = uniforms;
	this.vertPostAtt = null;
	this.shaderProgram = null;
	this.compiled = false;
	this.vertexCode = vertexCode;
	this.fragmentCode = fragmentCode;
}

XEngine.Shader.baseUniforms ={
	mvMatrix:{ 
		value: null,
	},
	pMatrix:{
		value: null
	}
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

		gl.enableVertexAttribArray(this.vertPostAtt);
		for (var property in this.uniforms) {
			if (this.uniforms.hasOwnProperty(property)) {
				this.uniforms[property].gpuPosition = gl.getUniformLocation(this.shaderProgram, property);
			}
		}
	},

	updateUniforms: function(gl){
		gl.useProgram(this.shaderProgram);
		for (var property in this.uniforms) {
			if (this.uniforms.hasOwnProperty(property)) {
				var valueType = this.uniforms[property].value.constructor
				if(valueType === Number){
					gl.uniform1f(this.uniforms[property].gpuPosition, this.uniforms[property].value);
				}else if(valueType === Array){
					var length = this.uniforms[property].value.length;
					switch(length){
						case 2:
							gl.uniform2fv(this.uniforms[property].gpuPosition, this.uniforms[property].value);
						break;
						case 3:
							gl.uniform3fv(this.uniforms[property].gpuPosition, this.uniforms[property].value);
						break;
						case 4:
							gl.uniform4fv(this.uniforms[property].gpuPosition, this.uniforms[property].value);
						break;
					}
				}else if(valueType === Float32Array){
					var length = this.uniforms[property].value.length;
					switch(length){
					case 5:
						var value = new Array(4);
						for(var i = 0; i < 4; i++){
							value[i] = this.uniforms[property].value[i];
						}
						gl.uniformMatrix2fv(this.uniforms[property].gpuPosition, false, value);
						break;
					case 9:
						gl.uniformMatrix3fv(this.uniforms[property].gpuPosition, false, this.uniforms[property].value);
						break;
					case 16:
						gl.uniformMatrix4fv(this.uniforms[property].gpuPosition, false, this.uniforms[property].value);
						break;
					}
					
				}
			}
		}
	}
	
}