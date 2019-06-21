namespace XEngine2 {

	class RenderObject
	{
		group: MeshGroup;
		modelMatrix: Mat4x4;

		constructor(group: MeshGroup, modelMatrix: Mat4x4)
		{
			this.group = group;
			this.modelMatrix = modelMatrix;
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

		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 0.0 };
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true};
			this.gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
			this.opaqueRenderQueue = new Array();
			this.transparentRenderQueue = new Array();
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
				this.gl.viewport(0, 0, Number(this.game.canvas.getAttribute("width")), Number(this.game.canvas.getAttribute("height")));
			}

			this.game.scale.onResized.add(this.OnResize, this);
		}

		private OnResize(width: number, height: number)
		{
			this.gl.viewport(0, 0, width, height);
		}

		// public bindMaterial(material: Material) {
		// 	if (this.currentMaterial !== material || this.currentMaterial.dirty) {
		// 		this.currentMaterial = material;
		// 		this.currentMaterial.dirty = false;
		// 		this.context.useProgram(material.shaderProgram);
		// 		this.currentMaterial.bind(this);

		// 		if (this.currentMaterial.depthWrite !== this.depthWriteEnabled) {
		// 			this.depthWriteEnabled = this.currentMaterial.depthWrite;
		// 			this.context.depthMask(this.currentMaterial.depthWrite);
		// 		}

		// 		if (this.currentMaterial.depthTest !== this.depthTestEnabled) {
		// 			this.depthTestEnabled = this.currentMaterial.depthTest;
		// 			if (this.currentMaterial.depthTest) {
		// 				this.context.enable(this.context.DEPTH_TEST);
		// 				this.context.depthFunc(this.context.LEQUAL);
		// 			} else {
		// 				this.context.disable(this.context.DEPTH_TEST);
		// 			}
		// 		}

		// 		if (this.currentMaterial.transparent !== this.transparencyEnabled) {
		// 			this.transparencyEnabled = this.currentMaterial.transparent;
		// 			if (this.currentMaterial.transparent) {
		// 				switch (this.currentMaterial.blendMode) {
		// 					case BlendMode.Multiply:
		// 						this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
		// 				}
		// 				this.context.enable(this.context.BLEND);
		// 			} else {
		// 				this.context.disable(this.context.BLEND);
		// 			}
		// 		}

		// 		if (this.currentMaterial.cullFace) {
		// 			if (this.currentMaterial.cullMode !== this.currentCullMode) {
		// 				this.currentCullMode = this.currentMaterial.cullMode;
		// 				switch (this.currentMaterial.cullMode) {
		// 					case CullMode.BACK:
		// 						this.context.cullFace(this.context.BACK);
		// 						break;
		// 					case CullMode.FRONT:
		// 						this.context.cullFace(this.context.FRONT);
		// 						break;
		// 					case CullMode.BOTH:
		// 						this.context.cullFace(this.context.FRONT_AND_BACK);
		// 						break;
		// 					case CullMode.NONE:
		// 						this.context.cullFace(this.context.NONE);
		// 						break;
		// 				}
		// 				if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
		// 					this.cullFaceEnabled = this.currentMaterial.cullFace;
		// 					this.context.enable(this.context.CULL_FACE);
		// 				}
		// 			}
		// 		} else {
		// 			if (this.currentMaterial.cullFace !== this.cullFaceEnabled) {
		// 				this.cullFaceEnabled = this.currentMaterial.cullFace;
		// 				this.context.disable(this.context.CULL_FACE);
		// 			}
		// 		}
		// 	}
		// }

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

			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

			this.PopulateRenderQueues(scene);

			for (let i = 0; i < this.opaqueRenderQueue.length; i++) {
				const opaqueObject = this.opaqueRenderQueue[i];
				this.renderMeshImmediate(opaqueObject);
			}

			for (let i = 0; i < this.transparentRenderQueue.length; i++) {
				const transparentObject = this.transparentRenderQueue[i];
				this.renderMeshImmediate(transparentObject);
			}
		}

		private PopulateRenderQueues(scene: Scene)
		{
			let actors = scene.actors;
			for (let i = 0; i < actors.length; i++) {
				const actor = actors[i];
				if (!actor.hidden)
				{
					let components = actor.GetComponents<SceneComponent>();
					for (let j = 0; j < components.length; j++) {
						const sceneComponent = components[j];
						
						let groups = sceneComponent.getAllRenderableGroups();
						if(groups != null)
						{
							for (let k = 0; k < groups.length; k++) 
							{
								const group = groups[k];
								let renderObject = new RenderObject(group, sceneComponent.transform.Matrix);
								switch(group.Mesh.materials[group.materialIndex].renderQueue)
								{
									case RenderQueue.OPAQUE:
										this.opaqueRenderQueue.push(renderObject);
										break;
									case RenderQueue.TRANSPARENT:
										this.transparentRenderQueue.push(renderObject);
										break;
								}
							}
						}
					}
				}
			}
		}

		public renderMeshImmediate(renderObject: RenderObject, camera = this.currentCamera)
		{
			let meshGroup = renderObject.group;
			let modelMatrix = renderObject.modelMatrix;
			if(!meshGroup.Mesh.initialized)
				meshGroup.Mesh.initialize(this);

				meshGroup.Mesh.bind(meshGroup.materialIndex);
				
				let gl = this.gl;

				let material = meshGroup.Mesh.materials[meshGroup.materialIndex];

				material.modelMatrix.value = modelMatrix;
				material.viewMatrix.value = camera.transform.Matrix;
				material.projectionMatrix.value = camera.projectionMatrix;

				gl.useProgram(material.ShaderProgram);

				gl.drawArrays(meshGroup.Mesh.topology, meshGroup.firstVertex, meshGroup.vertexCount);

				gl.useProgram(null);
				meshGroup.Mesh.unBind(meshGroup.materialIndex);
			
		}
	}
}
