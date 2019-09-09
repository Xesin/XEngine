/// <reference path="SceneComponent.ts" />

namespace XEngine2 {
    export class CameraComponent extends SceneComponent {
        
        private _projectionMatrix: Mat4x4;

        constructor(game: Game)
        {
            super(game);
            this.bCanUpdate = true;
            this._projectionMatrix = new Mat4x4;
        }

        public update(deltaTime: number)
        {
            
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
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = game.width / game.height;
            const zNear = 0.1;
            const zFar = 1000.0;

        
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