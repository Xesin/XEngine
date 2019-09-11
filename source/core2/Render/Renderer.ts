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

		public clearColor: any;
		public gl: WebGL2RenderingContext;

		public depthWriteEnabled: boolean;
		public depthTestEnabled: boolean;
		public transparencyEnabled: boolean;
		public cullFaceEnabled: boolean;
		public currentCullMode: CullMode;

		public game: Game;

		private currentScene: Scene;
		private currentCamera: CameraComponent;

		private opaqueRenderQueue: Array<RenderObject>;
		private transparentRenderQueue: Array<RenderObject>;
		private shadowCasterRenderQueue: Array<RenderObject>;
		private shadowMap : RenderTarget;

		private errorMat: Material;

		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 1.0 };
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true, alpha: false, premultipliedAlpha: false};
			this.gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
			
			this.opaqueRenderQueue = new Array();
			this.transparentRenderQueue = new Array();
			this.shadowCasterRenderQueue = new Array();
			this.shadowMap = new RenderTarget(1280, 720, WRAP_MODE.CLAMP, false);
			this.init();
		}

		private init() {
			// Si no tenemos ningun contexto GL, date por vencido ahora
			if (!this.gl) {
				alert("Imposible inicializar WebGL. Tu navegador puede no soportarlo.");
				this.gl = null;
			} else {
				this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT
					| this.gl.DEPTH_BUFFER_BIT); // Limpiar el buffer de color asi como el de profundidad
					this.gl.colorMask(true, true, true, true);
				this.gl.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));

				this.errorMat = new Material(new Shader(ShaderMaterialLib.ErrorShader.vertexShader, ShaderMaterialLib.ErrorShader.fragmentShader))
				this.errorMat.initialize(this.gl);
			}

			this.game.scale.onResized.add(this.OnResize, this);
			Texture2D.CreateDefaultTextures(this.gl);
			Material.initStaticMaterials(this.gl);
			this.shadowMap.addAttachment(this.gl, this.gl.COLOR_ATTACHMENT0);
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

			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.cullFace(this.gl.BACK);
			this.gl.enable(this.gl.CULL_FACE);

			this.PopulateRenderQueues(scene, sceneLights);

			for (let i = 0; i < this.opaqueRenderQueue.length; i++) {
				const opaqueObject = this.opaqueRenderQueue[i];
				this.renderMeshImmediate(opaqueObject, this.currentCamera.viewMatrix, this.currentCamera.projectionMatrix);
			}

			for (let i = 0; i < this.transparentRenderQueue.length; i++) {
				const transparentObject = this.transparentRenderQueue[i];
				this.renderMeshImmediate(transparentObject, this.currentCamera.viewMatrix, this.currentCamera.projectionMatrix);
			}
		}

		private PopulateRenderQueues(scene: Scene, sceneLights : Array<Light>)
		{
			let actors = scene.actors;
			for (let i = 0; i < actors.length; i++) {
				const actor = actors[i];
				if (!actor.hidden)
				{
					let components = actor.GetComponents<SceneComponent>(SceneComponent);
					for (let j = 0; j < components.length; j++) {
						const sceneComponent = components[j];
						if(!sceneComponent.hidden){
							let groups = sceneComponent.getAllRenderableGroups();
							if(groups != null)
							{
								for (let k = 0; k < groups.length; k++) 
								{
									const group = groups[k];
									let affectedLights = this.findAffectedLights(group, sceneLights);
									let renderObject = new RenderObject(group, sceneComponent.transform.Matrix, affectedLights);
									if(group.Mesh.castShadows)
									{
										this.shadowCasterRenderQueue.push(renderObject);
									}
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
				}
			}
		}

		private findAffectedLights(meshGroup: MeshGroup, sceneLights : Array<Light>)
		{
			return sceneLights.filter((light) => !light.hidden).slice(0,4);
		}

		private renderMeshImmediate(renderObject: RenderObject, viewMatrix: Mat4x4, projectionMatrix: Mat4x4, material : Material = null)
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
			meshGroup.Mesh.bind(meshGroup.materialIndex);
			material.bind(gl);
			material.modelMatrix.value = modelMatrix;
			material.viewMatrix.value = viewMatrix;
			material.projectionMatrix.value = projectionMatrix;
			if(material.normalMatrix)
				material.normalMatrix.value = modelMatrix.transposed();

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
					spotLightDirectionUniform.value = new Vector4(0,0,0,0);
					lightAttenuationUniform.value = new Vector4(0,0,0,1.0);
					if(light){
						if(light instanceof DirectionalLight)
						{
							let dirLight = light.transform.Matrix.getColumn(2);
							dirLight.x = -dirLight.x;
							dirLight.y = -dirLight.y;
							dirLight.z = -dirLight.z;
							lightPositionUniform.value =  dirLight;
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
