import {ShaderBlocks} from "./ShaderBlocks"

export class ShadowCasterShader {
	public static readonly vertexShader =
	ShaderBlocks.glVersion300
	.concat(ShaderBlocks.VertexInput)
	.concat(ShaderBlocks.VertexOutput)
	.concat(ShaderBlocks.MVPUniforms)
	.concat(
	[
		"out highp vec3 vWorldPos;",
		"void main(void) {",
	]
	)
	.concat(ShaderBlocks.mvpAndPosCalc)
	.concat(
	[
		"vWorldPos = gl_Position.xyz;",
		// "gl_Position.z = max(gl_Position.z, gl_Position.w);",
		"vColor = aVertexColor;",
		"uv = aUV;",
	"}",
	]);

	public static readonly fragmentShader =
	ShaderBlocks.glVersion300
	.concat(["precision mediump float;"])
	.concat(ShaderBlocks.FragmentInput)
	.concat(ShaderBlocks.MVPUniforms)
	.concat([
		"vec4 encodeFloat (float depth) {",
			"const vec4 bitShift = vec4(",
				"256 * 256 * 256,",
				"256 * 256,",
				"256,",
				"1.0",
			");",
			"const vec4 bitMask = vec4(",
				"0,",
				"1.0 / 256.0,",
				"1.0 / 256.0,",
				"1.0 / 256.0",
			");",
			"vec4 comp = fract(depth * bitShift);",
			"comp -= comp.xxyz * bitMask;",
			"return comp;",
		"}",
		"in highp vec3 vWorldPos;",

		"out highp vec4 fragColor;",

		"uniform sampler2D albedo;",
		"uniform sampler2D opacity;",
		"uniform vec4 color;",
		"uniform float alphaClip;",

		"void main(void) {",
			"float albedoAlpha = texture(albedo, uv).a * color.a * vColor.a;",
			"float opacity = texture(opacity, uv).x;",
			"float alpha = min(albedoAlpha, opacity);",

			"if(alpha < alphaClip) discard;",
			"fragColor = vec4(vec3(gl_FragCoord.z * alpha), 1.0);",
		"}",
	]);
}
