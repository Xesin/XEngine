namespace XEngine {

	export enum Uniforms {
		FLOAT = 0,
		INTEGER = 1,
		MAT2X2 = 2,
		MAT3X3 = 3,
		MAT4X4 = 4,
		VECTOR2 = 5,
		VECTOR3 = 6,
		VECTOR4 = 7,
		SAMPLER = 8,
	}

	export class ShaderCompiler {

		public static readonly vertexBaseParams = [
			"#define MAX_LIGHTS 5",
			"in vec3 aVertexPosition;",
			"in vec2 vUv;",
			"in vec4 aVertexColor;",
			"uniform highp mat4 pMatrix;",
			"uniform highp mat4 modelMatrix;",
			"uniform highp mat4 viewMatrix;",
			"uniform highp mat4 normalMatrix;",
			"out highp vec2 uv;",
			"out vec4 vObjectPos;",
			"out vec4 vWorldPos;",
			"out vec4 vClipPos;",
			"out vec4 vViewPos;",
			"out highp vec4 vColor;",
			"out highp float alpha;",
			"out highp mat4 mvpMatrix;",
			"out highp mat4 mvMatrix;",
		];

		public static readonly fragmentBaseParams = [
			"#define MAX_LIGHTS 5",
			"in highp vec4 vColor;",
			"in highp vec2 uv;",
			"in float alpha;",
			"in vec4 vObjectPos;",
			"in vec4 vWorldPos;",
			"in vec4 vViewPos;",
			"in vec4 vClipPos;",
			"uniform highp mat4 pMatrix;",
			"uniform highp mat4 modelMatrix;",
			"uniform highp mat4 viewMatrix;",
			"uniform highp mat4 normalMatrix;",
			"in mat4 mvpMatrix;",
			"in mat4 mvMatrix;",
			"out vec4 fragColor;",
		];

		public static readonly vertexMain = [
			"void main(void) {",
				"vObjectPos = vec4(aVertexPosition, 1.0);",
				"vWorldPos = modelMatrix * vObjectPos;",
				"mvMatrix = viewMatrix * modelMatrix;",
				"mvpMatrix = pMatrix * mvMatrix;",
				"vClipPos = mvpMatrix * vObjectPos;",
				"vViewPos = -(mvMatrix * vObjectPos);",
				"gl_Position = vClipPos;",
				"uv = vUv;",
				"vColor = aVertexColor;",
				"alpha = 1.0;//in_alpha;",
				"mainPass();",
			"}",
		];

		public static compileVertexShader(verxtexString: string, defines: Array<String>) {
			verxtexString = verxtexString.replace("#XBaseParams", this.vertexBaseParams.join("\n"));
			verxtexString += this.vertexMain.join("\n");
			return verxtexString;
		}

		public static compileFragmentShader(fragmentString: string, defines: Array<String>) {
			// tslint:disable-next-line:max-line-length
			fragmentString = fragmentString.replace("#XBaseParams", this.fragmentBaseParams.join("\n")).replace("#include DEFINES", defines.join("\n"));
			return fragmentString;
		}

		public static compileShader(gl: WebGL2RenderingContext, material: Material, defines: Array<String>): WebGLProgram {
			let vertString = "";
			let fragmentString = "";
			if (material.shaderProgram !== undefined) {
				gl.deleteProgram(material.shaderProgram);
			}

			for (let i = 0; i < material.vertexCode.length; i++) {
				vertString += material.vertexCode[i] + "\n";
			}

			vertString = XEngine.ShaderCompiler.compileVertexShader(vertString, defines);

			for (let j = 0; j < material.fragmentCode.length; j++) {
				fragmentString += material.fragmentCode[j] + "\n";
			}

			fragmentString = XEngine.ShaderCompiler.compileFragmentShader(fragmentString, defines);

			let vertexShader;
			let fragmentShader;
			fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			vertexShader = gl.createShader(gl.VERTEX_SHADER);

			gl.shaderSource(vertexShader, vertString);
			gl.compileShader(vertexShader);
			gl.shaderSource(fragmentShader, fragmentString);
			gl.compileShader(fragmentShader);

			if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
				alert("vertex shader error: " + gl.getShaderInfoLog(vertexShader) + "\n" + vertexShader);
				material.compiled = true;
				return null;
			}

			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				alert("fragment shader error: " + gl.getShaderInfoLog(fragmentShader) + "\n" + fragmentShader);
				material.compiled = true;
				return null;
			}

			let shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				alert("Could not initialise shaders" + gl.getProgramInfoLog(shaderProgram));
				material.compiled = true;
			}
			material.compiled = true;
			return shaderProgram;
		}
	}
}
