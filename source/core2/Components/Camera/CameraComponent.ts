/// <reference path="../SceneComponent.ts" />

namespace XEngine2 {
    export class CameraComponent extends SceneComponent {
        
        private _projectionMatrix: Mat4x4;
        public renderTarget : RenderTarget;
        public far: number;
        public near: number;
        public fov: number;
        private frustrum: Frustum;

        constructor(game: Game)
        {
            super(game);
            this.bCanUpdate = true;
            this._projectionMatrix = new Mat4x4;
            this.renderTarget = null;
            this.fov = 60;
            this.near = 1.0;
            this.far = 1000;
            this.frustrum = new Frustum();
        }        

        public cull(scene: Scene) : Array<SceneComponent>
        {
            this.frustrum.setFromMatrix(this.projectionMatrix);
            let actors = scene.actors;
            let result = new Array<SceneComponent>();
			for (let i = 0; i < actors.length; i++) {
				const actor = actors[i];
				if (!actor.hidden)
				{
                    let components = actor.GetComponents<SceneComponent>(SceneComponent);
                    for (let j = 0; j < components.length; j++) {
						const sceneComponent = components[j];
						if(!sceneComponent.hidden){
                            result.push(sceneComponent);
                        }
                    }
                }
            }
            return result;
        }

        public get viewMatrix() : Mat4x4 {
            let translation =  this.transform.WorldPosition.toArray();
            let matrix = new Mat4x4();
            
            mat4.rotateX(matrix.elements, matrix.elements, this.transform.WorldRotation.x * XEngine.Mathf.TO_RADIANS);
            mat4.rotateY(matrix.elements, matrix.elements, this.transform.WorldRotation.y * XEngine.Mathf.TO_RADIANS);
            mat4.rotateZ(matrix.elements, matrix.elements, this.transform.WorldRotation.z * XEngine.Mathf.TO_RADIANS);
            mat4.translate(matrix.elements, matrix.elements, translation);
            // mat4.translate(matrix.elements, matrix.elements, new Vector3(0).toArray());
            // mat4.invert(matrix.elements, matrix.elements);

            return matrix;
        }

        
        public get projectionMatrix() : Mat4x4 {
            let game = Game.GetInstance();
            const fieldOfView = this.fov * Math.PI / 180;   // in radians
            const aspect = game.width / game.height;
            const zNear = this.near;
            const zFar = this.far;

        
            this._projectionMatrix.perspective(
                fieldOfView,
                aspect,
                zNear,
                zFar
            );

            return this._projectionMatrix;
        }
        
    }
}