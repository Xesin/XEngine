/// <reference path="SceneComponent.ts" />

namespace XEngine2 {
    export class CameraComponent extends SceneComponent {
        
        private _projectionMatrix: Mat4x4;

        constructor()
        {
            super();
            this.bCanUpdate = true;
            this._projectionMatrix = new Mat4x4;
        }

        public update(deltaTime: number)
        {
            
        }

        
        public get projectionMatrix() : Mat4x4 {
            let game = Game.GetInstance();
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = game.width / game.height;
            const zNear = 0.1;
            const zFar = 2500.0;

        
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