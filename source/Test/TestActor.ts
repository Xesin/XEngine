/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {

        public dirLight: DirectionalLight;
        public camera: CameraComponent;

        constructor(game: Game)
        {
            super(game);
            this.canUpdate = true;

            let pointLightColor = new Color(0.9,0.4,0.8,1.0);
            pointLightColor.fromHexString("#f2f7a5");
            this.dirLight = new DirectionalLight(game);
            // this.dirLight.setupAttachtment(this.rootComponent);
            this.dirLight.transform.rotation.y = 45;
            this.dirLight.transform.rotation.z = -75;
            this.dirLight.intensity = 0.7;
            

            this.camera = new CameraComponent(game);
            this.camera.setupAttachtment(this.rootComponent);

            game.sceneManager.currentScene.mainCamera = this.camera;
        }

        public update(deltaTime: number)
        {
            super.update(deltaTime);

			if( this.game.input.isDown(KEY_CODE.W) )
			{
				let fwVector = this.getActorForwardVector();
				fwVector.scalar(50 * deltaTime);
				this.rootComponent.transform.position.add(fwVector);

			}
			else if(this.game.input.isDown(KEY_CODE.S))
			{
				let fwVector = this.getActorForwardVector();
				fwVector.scalar(50 * deltaTime);
				this.rootComponent.transform.position.sub(fwVector);
			}

			if(this.game.input.isDown(KEY_CODE.SPACE))
			{
				this.rootComponent.transform.position.y += 50 * deltaTime;

			}
			else if(this.game.input.isDown(KEY_CODE.CTRL))
			{
				this.rootComponent.transform.position.y -= 50 * deltaTime;

			}

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