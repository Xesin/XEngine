XEngine.ShaderLib.Gimp = {
	vertexShader:[
		'#version 300 es',
		'#XBaseParams',

		'void mainPass() {',
		'}'
	],
	fragmentShader:[
		'#version 300 es',
		'precision mediump float;',
		"#XBaseParams",
		'uniform sampler2D texSampler;',
		'uniform float brightness;',
		'uniform float contrast;',
		'uniform float hue;',
		'uniform float saturation;',
		'uniform float inMin;',
		'uniform float inMax;',
		'uniform float outMin;',
		'uniform float outMax;',
		'uniform float inGamma;',
		'uniform float distorsion;',
		'uniform float blurAmount;',
		"uniform float time;",

		'#define BLUR_IT 32.0',
		'#define BLUR_DISTANCE 0.0005',

		'vec3 applyHue(vec3 aColor, float aHue)',
		'{',
			'float angle = radians(aHue);',
			'vec3 k = vec3(0.57735, 0.57735, 0.57735);',
			'float cosAngle = cos(angle);',
			'return aColor * cosAngle + cross(k, aColor) * sin(angle) + k * dot(k, aColor) * (1.0 - cosAngle);',
		'}',
		 
		 
		'vec4 applyHSBEffect(vec4 startColor, vec4 hbcs)',
		'{',
			'float _Hue = 360.0 * hbcs.r;',
			'float _Brightness = hbcs.g * 2.0 - 1.0;',
			'float _Contrast = hbcs.b * 2.0;',
			'float _Saturation = hbcs.a * 2.0;',

			'vec4 outputColor = startColor;',
			'outputColor.rgb = applyHue(outputColor.rgb, _Hue);',
			'outputColor.rgb = (outputColor.rgb - 0.5f) * (_Contrast) + 0.5f;',
			'outputColor.rgb = outputColor.rgb + _Brightness;',
			'vec3 intensity = vec3(dot(outputColor.rgb, vec3(0.299,0.587,0.114)));',
			'outputColor.rgb = mix(intensity, outputColor.rgb, _Saturation);',

			'return outputColor;',
		'}',

		'vec4 GammaCorrection(vec4 color, float gamma){',
			'return pow(color, vec4(1.0 / gamma));',
		'}',

		'vec4 LevelsControlInputRange(vec4 color, float minInput, float maxInput){',
			'return min(max(color - vec4(minInput), vec4(0.0)) / (vec4(maxInput) - vec4(minInput)), vec4(1.0));',
		'}',

		'vec4 LevelsControlInput(vec4 color, float minInput, float gamma, float maxInput){',
			'return GammaCorrection(LevelsControlInputRange(color, minInput, maxInput), gamma);',
		'}', 

		'vec4 LevelsControlOutputRange(vec4 color, float minOutput, float maxOutput){',
			'return mix(vec4(minOutput), vec4(maxOutput), color);',
		'}',

		'vec4 LevelsControl(vec4 color, float minInput, float gamma, float maxInput, float minOutput, float maxOutput) {',
			'return LevelsControlOutputRange(LevelsControlInput(color, minInput, gamma, maxInput), minOutput, maxOutput);',
		'}',

		'vec4 blur(vec4 color, vec2 UVs, float amount) {',
			'vec4 finalCol = color;',
			'float distance = BLUR_DISTANCE * amount;',
			'vec2 bUVs = UVs;',
			'bUVs.x -= (BLUR_IT / 2.0) * distance;',
			'for(float i = 0.0; i < BLUR_IT; i++){',
				'finalCol += texture(texSampler, bUVs)* vColor;',
				'bUVs.x += distance;',
			'}',

			'bUVs = UVs;',
			'bUVs.y -= (BLUR_IT / 2.0) * distance;',
			'for(float i = 0.0; i < BLUR_IT; i++){',
				'finalCol += texture(texSampler, bUVs)* vColor;',
				'bUVs.y += distance;',
			'}',

			'bUVs = UVs;',
			'bUVs.x -= (BLUR_IT / 2.0) * distance;',
			'bUVs.y -= (BLUR_IT / 2.0) * distance;',
			'for(float i = 0.0; i < BLUR_IT; i++){',
				'finalCol += texture(texSampler, bUVs)* vColor;',
				'bUVs.x += distance;',
				'bUVs.y += distance;',
			'}',

			'bUVs = UVs;',
			'bUVs.y -= (BLUR_IT / 2.0) * distance;',
			'bUVs.x += (BLUR_IT / 2.0) * distance;',
			'for(float i = 0.0; i < BLUR_IT; i++){',
				'finalCol += texture(texSampler, bUVs) * vColor;',
				'bUVs.y += distance;',
				'bUVs.x -= distance;',
			'}',

			'finalCol /= BLUR_IT * 4.0 + 1.0;',
			'return finalCol;',
		'}',

		'void main(void) {',
			'vec2 uvF = uv;',
			'uvF.x += cos((uvF.y + time / 3.0) * 11.0) / 10.0 * distorsion;',
			'vec4 texCol = texture(texSampler, uvF) * vColor;',
			'texCol.rgb *= texCol.w;',
			'if(texCol.a <= 0.05) discard;',
			'vec4 hbcs = vec4(hue, brightness, contrast, saturation);',
			'fragColor = (texCol*vColor);',
			'fragColor = blur(fragColor, uvF, blurAmount);',
			'fragColor = applyHSBEffect(fragColor, hbcs);',
			'fragColor = LevelsControl(fragColor, inMin, inGamma, inMax, outMin, outMax);',
		'}'
	],

}

XEngine.GimpShader = function(){
	this.uniforms = {
		texSampler:{
			value:0
		},
		brightness:{
			value:0.5
		},

		contrast:{
			value:0.5
		},
		hue:{
			value:0.0001
		},
		saturation:{
			value:0.5
		},
		inGamma:{
			value:1.00001
		},
		inMax:{
			value:1.01
		},
		inMin:{
			value:0.0001
		},
		outMax:{
			value:1.01
		},
		outMin:{
			value:0.0001
		},

		time:{
			value:0
		},

		distorsion:{
			value:0.00001
		},
		blurAmount:{
			value:0.00001
		}
	};
	XEngine.Shader.call(this, XEngine.ShaderLib.Gimp.vertexShader, XEngine.ShaderLib.Gimp.fragmentShader, this.uniforms);
}

XEngine.GimpShader.prototype = Object.create(XEngine.Shader.prototype);
XEngine.GimpShader.constructor = XEngine.GimpShader;

XEngine.GimpShader.prototypeExtends = {
	_setTexture: function(texture){
		this.texture = texture;
	},

	_beginRender: function(gl){
		XEngine.Shader.prototype._beginRender.call(this, gl);
		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);
		
		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}
}

Object.assign(XEngine.GimpShader.prototype, XEngine.GimpShader.prototypeExtends);

XEngine.ShaderLib.Gimp.shader = new XEngine.GimpShader();