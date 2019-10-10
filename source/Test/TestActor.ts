/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {

        public mesh: StaticMeshComponent;
		public camera: CameraComponent;

        constructor(game: Game)
        {
            super(game);
            this.canUpdate = true;

            
			this.mesh = new StaticMeshComponent(game, "meshComp");
			this.rootComponent = this.mesh;
			this.mesh.Mesh = new XEngine2.BasicGeometries.SphereMesh(BlinnPhongMaterial.SharedInstance, 5, 25,25);
			this.camera = new CameraComponent(game);
			this.camera.transform.position.z = 10;
			this.camera.setupAttachtment(this.rootComponent);

			this.game.input.bindAxis("MoveForward", this, this.moveForward);
			this.game.input.bindAxis("MoveRight", this, this.moveRight);
			this.game.input.bindAxis("LookUp", this, this.lookUp);
			this.game.input.bindAxis("LookLeft", this, this.lookLeft);

            game.sceneManager.currentScene.mainCamera = this.camera;
		}
		
		private moveForward(axisValue: number)
		{
			let fwVector = this.getActorForwardVector();
			fwVector.scalar(50 * axisValue * this.game.time.deltaTime);
			this.rootComponent.transform.position.add(fwVector);
		}

		private moveRight(axisValue: number)
		{
			let fwVector = this.getActorRightVector();
			fwVector.scalar(50 * axisValue * this.game.time.deltaTime);
			this.Transform.position.add(fwVector);
		}

		private lookUp(axisValue: number)
		{
			this.rootComponent.transform.rotation.x += axisValue * 3 * this.game.time.deltaTime;
		}

		private lookLeft(axisValue: number)
		{
			this.rootComponent.transform.rotation.y -= axisValue * 3 * this.game.time.deltaTime;
		}
    }
}