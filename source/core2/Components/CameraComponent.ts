/// <reference path="SceneComponent.ts" />

namespace XEngine2 {
    export class CameraComponent extends SceneComponent {
        
        public projectionMatrix: Mat4x4;

        constructor()
        {
            super();
            this.bCanUpdate = true;
        }

        public update(deltaTime: number)
        {
            let game = Game.GetInstance();
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = game.width / game.height;
            const zNear = 0.1;
            const zFar = 2500.0;

        
            this.projectionMatrix.perspective(
                fieldOfView,
                aspect,
                zNear,
                zFar
            );
        }
    }
}