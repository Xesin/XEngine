/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {

        public dirLight: DirectionalLight;
        public pointLight: PointLight;
        public camera: CameraComponent;

        constructor(game: Game)
        {
            super(game);
            let thisAny: any;
            thisAny = this;

            this.canUpdate = true;

            let pointLightColor = new Color(0.9,0.4,0.8,1.0);
            pointLightColor.fromHexString("#f2f7a5");
            this.dirLight = new DirectionalLight(game);
            // this.dirLight.setupAttachtment(this.rootComponent);
            this.dirLight.transform.rotation.y = 45;
            this.dirLight.transform.rotation.z = -75;
            this.dirLight.intensity = 0.7;
            this.pointLight = new PointLight(game);
            // this.pointLight.setupAttachtment(this.rootComponent);

            this.pointLight.transform.position.y = 15;
            this.pointLight.transform.position.x = 110;
            this.pointLight.transform.position.z = 40;
            this.pointLight.color = pointLightColor;
            this.pointLight.intensity = 2.0;
            for (const meshName in this.game.cache.geometries) 
            {
                
                const mesh = this.game.cache.geometries[meshName];
                thisAny[meshName] = new StaticMeshComponent(this.game);
                thisAny[meshName].transform.scale.setTo(0.10);
                thisAny[meshName].Mesh = mesh;
            }

            this.camera = new CameraComponent(game);
            this.camera.setupAttachtment(this.rootComponent);

            game.sceneManager.currentScene.mainCamera = this.camera;
        }

        public update(deltaTime: number)
        {
            super.update(deltaTime);

			if( this.game.input.isDown(KEY_CODE.W) )
			{
				let fwVector = this.rootComponent.transform.forward();
				fwVector.scalar(50 * deltaTime);
				this.rootComponent.transform.position.add(fwVector);

			}
			else if(this.game.input.isDown(KEY_CODE.S))
			{
				let fwVector = this.rootComponent.transform.forward();
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

			if(this.game.input.isDown(KEY_CODE.Q))
			{
				this.rootComponent.transform.rotation.y -= 90 * deltaTime;

			} 
			else if(this.game.input.isDown(KEY_CODE.E))
			{
				this.rootComponent.transform.rotation.y += 90 * deltaTime;
			}

			if(this.game.input.isDown(KEY_CODE.D))
			{
				let rightVector = this.rootComponent.transform.right();
				rightVector.scalar(50 * deltaTime);
				this.rootComponent.transform.position.add(rightVector);

			}
			else if(this.game.input.isDown(KEY_CODE.A))
			{
				let rightVector = this.rootComponent.transform.right();
				rightVector.scalar(50 * deltaTime);
				this.rootComponent.transform.position.sub(rightVector);
			}
        }
    }
}