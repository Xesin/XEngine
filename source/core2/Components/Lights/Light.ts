/// <reference path="../SceneComponent.ts" />

namespace XEngine2 {
    export class Light extends SceneComponent {
        
        public color: Color;
        public intensity: number;
        private _projectionMatrix: Mat4x4;

        constructor(game: Game)
        {
            super(game);
            this.color = new Color(1.0);
            this.intensity = 1.0;
            this._projectionMatrix = new Mat4x4();
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return null;
        }

        public Equal(otherLight: Light)
        {
            return otherLight.color == this.color && otherLight.intensity == this.intensity && otherLight.transform == this.transform;
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
            const zNear = 0.1;
            const zFar = 1000.0;
            
            this._projectionMatrix.ortho(
                0,
                game.width,
                0,
                game.height,
                zNear,
                zFar
            )

            return this._projectionMatrix;
        }
    }
}