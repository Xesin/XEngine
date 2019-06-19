namespace XEngine2 {

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

		constructor (game: Game, canvas: HTMLCanvasElement) {
			this.game = game;
			this.clearColor = {r: 0.0 , g: 0.0, b: 0.0, a: 0.0 };
			// Tratar de tomar el contexto estandar. Si falla, probar otros.
			let options = {stencil: true, antialias: true};
			this.gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
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

		public render() {
			// Clear the canvas before we start drawing on it.
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}

		private OnResize(width: number, height: number)
		{
			this.game.context.viewport(0, 0, width, height);
			console.log("Resized ", width, height);
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

		public Render(scene: Scene, camera: CameraComponent)
		{
			this.currentCamera = camera;
			this.currentScene = scene;

			let actors = scene.actors;
			for (let i = 0; i < actors.length; i++) {
				const actor = actors[i];
				if (!actor.hidden)
				{
					let components = actor.GetComponents<SceneComponent>();
					for (let j = 0; j < components.length; j++) {
						const sceneComponent = components[j];
						
						sceneComponent.render(this);
					}
				}
			}
		}

		public renderMeshImmediate(Mesh: StaticMesh, transform: Transform, camera = this.currentCamera)
		{
			if(!Mesh.initialized)
				Mesh.initialize(this);

			for (let i = 0; i < Mesh.groups.length; i++) {
				const group = Mesh.groups[i];
				Mesh.bind(Mesh.groups[i].materialIndex);
				
				let gl = this.gl;

				let material = Mesh.materials[Mesh.groups[i].materialIndex];

				material.modelMatrix.value = transform.Matrix;
				material.viewMatrix.value = camera.transform.Matrix;
				material.projectionMatrix.value = camera.projectionMatrix;

				gl.useProgram(material.ShaderProgram);

				gl.drawArrays(Mesh.topology, group.start, group.count);

				gl.useProgram(null);
				Mesh.unBind(Mesh.groups[i].materialIndex);
			}
		}
	}
}
