/// <reference path="./ShaderBlocks.ts"/>

namespace XEngine2.ShaderMaterialLib{


    export class BlinnPhongShader {
		public static readonly vertexShader = 
		ShaderBlocks.glVersion300
		.concat(ShaderBlocks.VertexInput)
		.concat(ShaderBlocks.BlinnPhongVertexOutputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat(ShaderBlocks.VertexLightning)
		.concat(
		[
            "void main(void) {",
		]
		)
		.concat(ShaderBlocks.mvpAndPosCalc)
		.concat(
		[
				"vWorldPos = (modelMatrix * aVertexPosition).xyz;",
	   			"uv = aUV;",
				"vColor = aVertexColor;",
				"mat4 viewInverted = inverse(viewMatrix);",
				"viewPos = -transpose(mat3(viewMatrix)) * viewMatrix[3].xyz;",
				"mat4 depthBiasMVP = texUnitConverter * light[0].lightProjection * light[0].lightViewMatrix * modelMatrix;",
				"shadowPos =  depthBiasMVP * vec4(aVertexPosition.xyz, 1.0);",
			"}"
        ]);

		public static readonly fragmentShader =
		ShaderBlocks.glVersion300
		.concat(["precision mediump float;"])
		.concat(ShaderBlocks.Lightning)
		.concat(ShaderBlocks.perturbNormals)
		.concat(ShaderBlocks.BlinnPhongFragmentInputs)
		.concat(ShaderBlocks.MVPUniforms)
		.concat([
			"layout(location = 0) out vec4 fragColor;",
			"layout(location = 1) out vec4 fragNormals;",
			"uniform highp float smoothness;",
			"uniform highp vec4 specularColor;",

			"vec2 poissonDisk[4] = vec2[](",
				"vec2( -0.94201624, -0.39906216 ),",
				"vec2( 0.94558609, -0.76890725 ),",
				"vec2( -0.094184101, -0.92938870 ),",
				"vec2( 0.34495938, 0.29387760 )",
			");",

			"float random(vec4 seed4){",
				"float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));",
				"return fract(sin(dot_product) * 43758.5453);",
			"}",

			"void main(void) {",

				"vec4 albedo = texture(albedoTex, uv) * color;",
				"vec4 opacity = texture(opacityTex, uv);",
				"float alpha = min(albedo.a, opacity.x);",

				"if(alpha < alphaClip) discard;",
				"vec3 finalColor = albedo.xyz;",

				"vec3 lightsColor = vec3(0.0);",
				"vec3 surfaceNormal = perturbNormalPerPixel(vWorldPos, vNormal, uv);",
				"vec3 viewDir = normalize(viewPos - vWorldPos.xyz);",
				"for(int i = 0; i < MAX_LIGHTS; i++)",
				"{",
					"Light curLight = light[i];",
					"vec4 DiffuseLightColor = BlinnPhongLightning(i, surfaceNormal, vWorldPos, viewDir, smoothness, specularColor, albedo.xyz);",
					"if(i == 0){",
						"vec4 fragmentDepth = shadowPos;",
						"float shadowAcneRemover = curLight.shadowBias*tan(acos(DiffuseLightColor.w));",
						"shadowAcneRemover = clamp(shadowAcneRemover, 0.0, 0.1);",
						"float amountInLight = 1.0;",
						  
						"for (int x = 0; x < 4; x++) {",
							"int index = int(16.0*random(vec4(vWorldPos.xyz, x)))%16;",
							"float texelDepth = 1.0 - texture(shadowMap,",
							"vec3(fragmentDepth.xy + poissonDisk[x]/2048.0, (fragmentDepth.z-shadowAcneRemover)/fragmentDepth.w) );",
							"amountInLight -= 0.2 * texelDepth;",
						"}",

						"DiffuseLightColor = DiffuseLightColor * amountInLight;",
					"}",
					"lightsColor += DiffuseLightColor.xyz; ",
				"}",

				"vec3 ambientColor = ambient.xyz * ambient.w;",

				"finalColor = lightsColor",
				"+ albedo.xyz * ambientColor;",

				"fragColor.xyz =finalColor;",
				"fragColor.a = alpha;",
				"fragColor.rgb *= fragColor.a;",
				"fragNormals = vec4(surfaceNormal, 1.0);",
            "}",
        ]);
    }

}