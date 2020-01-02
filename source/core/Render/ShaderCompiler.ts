export class ShaderCompiler {


	public static compileShader(gl: WebGL2RenderingContext, vertextCode: string, fragmentCode: string): WebGLProgram {
		// if (material.shaderProgram !== undefined) {
		// 	gl.deleteProgram(material.shaderProgram);
		// }

		let vertexShader;
		let fragmentShader;
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		vertexShader = gl.createShader(gl.VERTEX_SHADER);

		gl.shaderSource(vertexShader, vertextCode);
		gl.compileShader(vertexShader);
		gl.shaderSource(fragmentShader, fragmentCode);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error(("vertex shader error: " + gl.getShaderInfoLog(vertexShader) + "\n" + vertexShader));
			return null;
		}

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			console.error(("fragment shader error: " + gl.getShaderInfoLog(fragmentShader) + "\n" + fragmentShader));
			return null;
		}

		let shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error("Could not initialise shaders" + gl.getProgramInfoLog(shaderProgram));
			shaderProgram = null;
		}
		return shaderProgram;
	}
}
