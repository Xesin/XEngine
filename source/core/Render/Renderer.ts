namespace XEngine2 {

	class RenderObject
	{
		public group: MeshGroup;
		public modelMatrix: Mat4x4;
		public affectedLights: Array<Light>;

		constructor(group: MeshGroup, modelMatrix: Mat4x4, affectedLights: Array<Light>)
		{
			this.group = group;
			this.modelMatrix = modelMatrix;
			this.affectedLights = affectedLights;
		}
	}

	export class Renderer {

		public clearColor: Color;
		public gl: WebGL2RenderingContext;

		public depthWriteEnabled: boolean;
		public depthTestEnabled: boolean;
		public transparencyEnabled: boolean;
		public cullFaceEnabled: boolean;
		public currentCullMode: CullMode;
		public shadowSize: number;

		public game: Game;

		private currentScene: Scene;
		private currentCamera: CameraComponent;

		private opaqueRenderQueue: Array<RenderObject>;
		private transparentRenderQueue: Array<RenderObject>;
		private shadowCasterRenderQueue: Array<RenderObject>;
		private dstRenderTarget : RenderTarget;
		private srcRenderTarget : RenderTarget;
		private quadMesh : StaticMeshComponent;

		private errorMat: Material;

		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true, alpha: false};
			this.gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
			
			this.opaqueRenderQueue = new Array();
			this.transparentRenderQueue = new Array();
			this.shadowCasterRenderQueue = new Array();
			this.shadowSize = 1024;
			this.init();
		}

		private init() {
			// Si no tenemos ningun contexto GL, date por vencido ahora
			if (!this.gl) {
				alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
				this.gl = null;
			} else {
				this.dstRenderTarget = new RenderTarget(this.game.width, this.game.height, WRAP_MODE.CLAMP, false);
				this.dstRenderTarget.addAttachment(this.gl, this.gl.COLOR_ATTACHMENT0);
				this.dstRenderTarget.addAttachment(this.gl, this.gl.COLOR_ATTACHMENT1);
				this.dstRenderTarget.addAttachment(this.gl, this.gl.DEPTH_ATTACHMENT, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT);
				this.dstRenderTarget.unBind(this.gl);
				
				this.srcRenderTarget = new RenderTarget(this.game.width, this.game.height, WRAP_MODE.CLAMP, false);
				this.srcRenderTarget.addAttachment(this.gl, this.gl.COLOR_ATTACHMENT0);
				this.srcRenderTarget.addAttachment(this.gl, this.gl.COLOR_ATTACHMENT1);
				this.srcRenderTarget.addAttachment(this.gl, this.gl.DEPTH_ATTACHMENT, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT);

				this.srcRenderTarget.bind(this.gl);
				this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);

				this.gl.colorMask(true, true, true, true);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT
					| this.gl.DEPTH_BUFFER_BIT); // Limpiar el buffer de color asi como el de profundidad

				this.gl.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));

				this.errorMat = new Material(new Shader(ShaderMaterialLib.ErrorShader.vertexShader, ShaderMaterialLib.ErrorShader.fragmentShader))
				this.errorMat.initialize(this.gl);
				this.srcRenderTarget.unBind(this.gl);

				
			}

			this.game.scale.onResized.add(this.OnResize, this);
			Texture2D.CreateDefaultTextures(this.gl);
			Material.initStaticMaterials(this.gl);

			PostProcessMaterial.SharedInstance.mainTex.value = this.srcRenderTarget.attachedTextures[this.gl.COLOR_ATTACHMENT0];
			PostProcessMaterial.SharedInstance.depthTex.value = this.srcRenderTarget.attachedTextures[this.gl.DEPTH_ATTACHMENT];
			this.quadMesh = new StaticMeshComponent(this.game);
			this.quadMesh.Mesh = new BasicGeometries.QuadMesh(PostProcessMaterial.SharedInstance, 2, 2);
		}

		private OnResize(width: number, height: number)
		{
			this.gl.viewport(0, 0, width, height);
		}

		public setClearColor(r, g, b, a) {
			this.clearColor.r = r;
			this.clearColor.g = g;
			this.clearColor.b = b;
			this.clearColor.a = a;
			this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
		}

		public render(scene: Scene, camera: CameraComponent)
		{
			this.currentCamera = camera;
			this.currentScene = scene;
			this.opaqueRenderQueue = new Array();
			this.transparentRenderQueue = new Array();
			this.shadowCasterRenderQueue = new Array();

			let sceneLights = this.currentScene.FindComponents<Light>(Light);

			this.PopulateRenderQueues(scene, sceneLights);

			this.renderShadowmaps(sceneLights, scene);

			if(camera.renderTarget)
			{
				camera.renderTarget.bind(this.gl);
			}
			else
			{
				this.srcRenderTarget.bind(this.gl);
			}
			
			this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1]);
			this.gl.clearColor(this.clearColor.r, this.clearColor.g,this.clearColor.b, 0.0);
			this.gl.viewport(0, 0, this.srcRenderTarget.width, this.srcRenderTarget.height);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

			for (let i = 0; i < this.opaqueRenderQueue.length; i++) {
				const opaqueObject = this.opaqueRenderQueue[i];
				this.renderMeshImmediate(opaqueObject, this.currentCamera.viewMatrix, this.currentCamera.projectionMatrix);
			}

			for (let i = 0; i < this.transparentRenderQueue.length; i++) {
				const transparentObject = this.transparentRenderQueue[i];
				this.renderMeshImmediate(transparentObject, this.currentCamera.viewMatrix, this.currentCamera.projectionMatrix);
			}

			if(camera.renderTarget)
			{
				camera.renderTarget.unBind(this.gl);
			}
			else
			{
				this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0]);
				this.srcRenderTarget.unBind(this.gl);
				this.currentScene.onWillRenderImage(this, this.srcRenderTarget, this.dstRenderTarget);

				this.gl.viewport(0, 0, this.game.scale.currentWidth, this.game.scale.currentHeight);
				this.gl.clearColor(this.clearColor.r, this.clearColor.g,this.clearColor.b, this.clearColor.a);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

				PostProcessMaterial.SharedInstance.bind(this.gl);
				PostProcessMaterial.SharedInstance.setShaderSampler(0, this.srcRenderTarget.attachedTextures[this.gl.COLOR_ATTACHMENT0]);
				PostProcessMaterial.SharedInstance.setShaderParameter("mainTex", this.srcRenderTarget.attachedTextures[this.gl.COLOR_ATTACHMENT0]);
				PostProcessMaterial.SharedInstance.setShaderSampler(1, this.srcRenderTarget.attachedTextures[this.gl.DEPTH_ATTACHMENT]);
				PostProcessMaterial.SharedInstance.setShaderParameter("depthTex", this.srcRenderTarget.attachedTextures[this.gl.DEPTH_ATTACHMENT]);
				PostProcessMaterial.SharedInstance.updateUniforms(this.gl);
										
				let quadRenderObject = new RenderObject(this.quadMesh.Mesh.groups[0], new Mat4x4().identity(), new Array());
				this.renderMeshImmediate(quadRenderObject, this.currentCamera.viewMatrix, this.currentCamera.projectionMatrix, PostProcessMaterial.SharedInstance);
			}
		}

		private renderShadowmaps(sceneLights: Light[], scene: Scene) {
			for (let l = 0; l < sceneLights.length; l++) {
				const light = sceneLights[l];
				if (!light.hidden && light.castShadow) {
					let shadowCasterComponents = new Array<SceneComponent>();
					shadowCasterComponents = light.cull(scene);
					this.shadowCasterRenderQueue = new Array<RenderObject>();
					if (!light._shadowMap) {
						light._shadowMap = new RenderTarget(this.shadowSize, this.shadowSize, WRAP_MODE.CLAMP, false);
						light._shadowMap.addAttachment(this.gl, this.gl.DEPTH_ATTACHMENT, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT, true);
					}
					light._shadowMap.bind(this.gl);
					this.gl.clearColor(1, 1, 1, 0.0);
					this.gl.viewport(0, 0, this.shadowSize, this.shadowSize);
					this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
					for (let j = 0; j < shadowCasterComponents.length; j++) {
						const sceneComponent = shadowCasterComponents[j];
						let groups = sceneComponent.getAllRenderableGroups();
						if (groups != null) {
							for (let k = 0; k < groups.length; k++) {
								const group = groups[k];
								let renderObject = new RenderObject(group, sceneComponent.transform.Matrix, null);
								if (group.Mesh.castShadows) {
									this.renderMeshImmediate(renderObject, light.viewMatrix, light.projectionMatrix, ShadowCasterMaterial.SharedInstance, true);
								}
							}
						}
					}
					light._shadowMap.unBind(this.gl);
				}
			}
		}

		public blit(src: RenderTarget, dst: RenderTarget, material: PostProcessMaterial = PostProcessMaterial.SharedInstance)
		{
			src.unBind(this.gl);
			dst.bind(this.gl);

			material.bind(this.gl);
			material.setShaderSampler(0, src.attachedTextures[this.gl.COLOR_ATTACHMENT0]);
			material.setShaderParameter("mainTex", src.attachedTextures[this.gl.COLOR_ATTACHMENT0]);
			material.setShaderSampler(1, src.attachedTextures[this.gl.DEPTH_ATTACHMENT]);
			material.setShaderParameter("depthTex", src.attachedTextures[this.gl.DEPTH_ATTACHMENT]);
			material.updateUniforms(this.gl);

			this.gl.viewport(0, 0, src.width, src.height);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			
			let identityMat = new Mat4x4().identity();
			let quadRenderObject = new RenderObject(this.quadMesh.Mesh.groups[0], identityMat, new Array());
			this.renderMeshImmediate(quadRenderObject, identityMat, identityMat, material);

			this.srcRenderTarget = dst;
			this.dstRenderTarget = src;
			dst.unBind(this.gl);
		}

		private PopulateRenderQueues(scene: Scene, sceneLights : Array<Light>)
		{
			let components = this.currentCamera.cull(scene);
			
			for (let j = 0; j < components.length; j++) {
				const sceneComponent = components[j];

				let groups = sceneComponent.getAllRenderableGroups();
				if(groups != null)
				{
					for (let k = 0; k < groups.length; k++) 
					{
						const group = groups[k];
						let affectedLights = this.findAffectedLights(group, sceneLights);
						let renderObject = new RenderObject(group, sceneComponent.transform.Matrix, affectedLights);
						switch(group.Mesh.materials[group.materialIndex].renderQueue)
						{
							case RenderQueue.OPAQUE:
								if(this.opaqueRenderQueue.indexOf(renderObject) === -1)
									this.opaqueRenderQueue.push(renderObject);
								break;
							case RenderQueue.TRANSPARENT:
								if(this.transparentRenderQueue.indexOf(renderObject) === -1)
									this.transparentRenderQueue.push(renderObject);
								break;
						}
					}
				}
			}
		}

		private findAffectedLights(meshGroup: MeshGroup, sceneLights : Array<Light>)
		{
			return sceneLights.filter((light) => !light.hidden).slice(0,4);
		}

		private renderMeshImmediate(renderObject: RenderObject, viewMatrix: Mat4x4, projectionMatrix: Mat4x4, material : Material = null, skipLights = false)
		{
			let meshGroup = renderObject.group;
			let modelMatrix = renderObject.modelMatrix;
			let gl = this.gl;
			material = material || meshGroup.Mesh.materials[meshGroup.materialIndex];

			if(!material.ShaderProgram)
			{
				material = this.errorMat;
			}

			meshGroup.Mesh.updateResources(this, material);
			material.bind(gl);
			meshGroup.Mesh.bind(this.gl, material, meshGroup.materialIndex);
			if(material.modelMatrix)
				material.modelMatrix.value = modelMatrix;
			if(material.viewMatrix)
				material.viewMatrix.value = viewMatrix;
			if(material.projectionMatrix)
				material.projectionMatrix.value = projectionMatrix;
			if(material.normalMatrix)
				material.normalMatrix.value = modelMatrix.clone().invert().transpose();

			if(!skipLights)
			{
				for(let i = 0; i < 5; i++)
				{
					let light = renderObject.affectedLights[i];
					let lightPositionUniform = material.getLightUniform(i, 'position');
					if(lightPositionUniform)
					{
						let lightColorUniform = material.getLightUniform(i, 'color');
						let lightIntensityUniform = material.getLightUniform(i, 'intensity');
						let lightAttenuationUniform = material.getLightUniform(i, 'lightAttenuation');
						let spotLightDirectionUniform = material.getLightUniform(i, 'spotLightDirection');
						let lightViewMatrixUniform = material.getLightUniform(i, 'lightViewMatrix');
						let lightProjectionUniform = material.getLightUniform(i, 'lightProjection');
						let lightShadowBiasUniform = material.getLightUniform(i, 'shadowBias');
						spotLightDirectionUniform.value = new Vector4(0,0,0,0);
						lightAttenuationUniform.value = new Vector4(0,0,0,1.0);
						if(light){
							if(light instanceof DirectionalLight)
							{
								let dirLight = light.dirLight;
								dirLight.x = -dirLight.x;
								dirLight.y = -dirLight.y;
								dirLight.z = -dirLight.z;
								lightPositionUniform.value =  dirLight;
								lightViewMatrixUniform.value = light.viewMatrix;
								lightProjectionUniform.value = light.projectionMatrix;
								if(light.castShadow){
									lightShadowBiasUniform.value = light.shadowBias;
									if(material instanceof BlinnPhongMaterial)
									{
										(material as BlinnPhongMaterial).shadowMap.value = light._shadowMap.attachedTextures[gl.DEPTH_ATTACHMENT];
									}
								}
								else if(light._shadowMap)
								{
									if(material instanceof BlinnPhongMaterial)
									{
										(material as BlinnPhongMaterial).shadowMap.value = Texture2D.depthTexture;
									}
								}	
							}
							else if(light instanceof PointLight)
							{
								lightPositionUniform.value = light.transform.Matrix.getColumn(3);;
								lightAttenuationUniform.value.x = 1 / Math.max(light.radius * light.radius, 0.00001);
								if(light instanceof SpotLight)
								{
									let v = light.transform.Matrix.getColumn(2);
									v.x = -v.x;
									v.y = -v.y;
									v.z = -v.z;
									spotLightDirectionUniform.value = v;

									let outerRad = Mathf.TO_RADIANS * 0.5 * light.spotAngle;
									let outerCos = Math.cos(outerRad);
									let outerTan = Math.tan(outerRad);
									let innerCos =
										Math.cos(Math.atan(((46 / 64) * outerTan)));

									let angleRange = Math.max(innerCos - outerCos, 0.001);
									lightAttenuationUniform.value.z = 1 / angleRange;
									lightAttenuationUniform.value.w = -outerCos * lightAttenuationUniform.value.z;
								}
							}
							lightIntensityUniform.value = light.intensity;
							lightColorUniform.value = light.color.getVector3();
						}
						else
						{
							lightColorUniform.value = new Vector3(0,0,0);
						}
					}
				}
			}

			material.updateUniforms(gl);

			if(meshGroup.indices){
				gl.drawElements(gl.TRIANGLES, meshGroup.indices.length, gl.UNSIGNED_SHORT, 0);
			}
			else
			{
				gl.drawArrays(gl.TRIANGLES, 0, meshGroup.vertexCount);
			}
		}
	}
}