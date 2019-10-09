/// <reference path="../SceneComponent.ts" />

namespace XEngine2 {
    export class Light extends SceneComponent {
        
        public color: Color;
        public intensity: number;
        public shadowBias: number;
        public castShadow: boolean;

        public _shadowMap: RenderTarget;
        private _projectionMatrix: Mat4x4;

        constructor(game: Game)
        {
            super(game);
            this.color = new Color(1.0);
            this.intensity = 1.0;
            this._projectionMatrix = new Mat4x4();
            this.castShadow = true;
            this.shadowBias = 0.005;
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
            let translationVector = this.transform.forward();
            translationVector.z *= -1;
            let translation = translationVector.scalar(200);
            let matrix = new Mat4x4();

            matrix.lookAt(translation, new Vector3(0,0,0), new Vector3(0,1,0));

            // mat4.translate(matrix.elements, matrix.elements, new Vector3(0).toArray());
            // mat4.invert(matrix.elements, matrix.elements);

            return matrix;
        }

        public get dirLight() : Vector4 {
            let matrix = new Mat4x4();
            
            mat4.rotateY(matrix.elements, matrix.elements, this.transform.WorldRotation.y * XEngine.Mathf.TO_RADIANS);
            mat4.rotateX(matrix.elements, matrix.elements, this.transform.WorldRotation.x * XEngine.Mathf.TO_RADIANS);
            mat4.rotateZ(matrix.elements, matrix.elements, this.transform.WorldRotation.z * XEngine.Mathf.TO_RADIANS);
            // mat4.translate(matrix.elements, matrix.elements, new Vector3(0).toArray());
            // mat4.invert(matrix.elements, matrix.elements);

            return matrix.getColumn(2);
        }

        
        public get projectionMatrix() : Mat4x4 {
            const zNear = -40.0;
            const zFar = 256.0;
            
            this._projectionMatrix.ortho(
                -256,
                256,
                -256,
                256,
                zNear,
                zFar
            )

            return this._projectionMatrix;
        }
    }
}