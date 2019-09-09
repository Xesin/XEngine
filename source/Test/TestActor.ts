/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {

        
        public camera: CameraComponent;

        constructor(game: Game)
        {
            super(game);
            this.canUpdate = true;

            let pointLightColor = new Color(0.9,0.4,0.8,1.0);
            pointLightColor.fromHexString("#f2f7a5");
			
			let pointLight = new PointLight(game);

			this["pointLight"] = pointLight;
			pointLight.transform.position.y = 20;
			pointLight.color = pointLightColor;

            this.camera = new CameraComponent(game);
			this.camera.setupAttachtment(this.rootComponent);

			this.game.input.bindAxis("MoveForward", this, this.moveForward);
			this.game.input.bindAxis("MoveRight", this, this.moveRight);
			this.game.input.bindAxis("LookUp", this, this.lookUp);
			this.game.input.bindAxis("LookLeft", this, this.lookLeft);

			this.game.input.bindAction("Fire", KEY_ACTION.PRESSED, this, () => {
				pointLight.hidden != pointLight.hidden;
			});

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
			this.rootComponent.transform.rotation.y += axisValue * 3 * this.game.time.deltaTime;
		}

        public update(deltaTime: number)
        {
            super.update(deltaTime);

			// if(this.game.input.isDown(KEY_CODE.SPACE))
			// {
			// 	this.rootComponent.transform.position.y += 50 * deltaTime;

			// }
			// else if(this.game.input.isDown(KEY_CODE.CTRL))
			// {
			// 	this.rootComponent.transform.position.y -= 50 * deltaTime;

			// }

			// if(this.game.input.isDown(KEY_CODE.Q))
			// {
			// 	this.rootComponent.transform.rotation.y -= 90 * deltaTime;

			// } 
			// else if(this.game.input.isDown(KEY_CODE.E))
			// {
			// 	this.rootComponent.transform.rotation.y += 90 * deltaTime;
			// }

			// if(this.game.input.isDown(KEY_CODE.D))
			// {
			// 	let rightVector = this.rootComponent.transform.right();
			// 	rightVector.scalar(50 * deltaTime);
			// 	this.rootComponent.transform.position.add(rightVector);

			// }
			// else if(this.game.input.isDown(KEY_CODE.A))
			// {
			// 	let rightVector = this.rootComponent.transform.right();
			// 	rightVector.scalar(50 * deltaTime);
			// 	this.rootComponent.transform.position.sub(rightVector);
			// }
        }
    }
}