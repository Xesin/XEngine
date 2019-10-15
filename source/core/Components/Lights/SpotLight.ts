/// <reference path="Light.ts" />

namespace XEngine2 {
    export class SpotLight extends PointLight {

        public spotAngle: number

        constructor(game: Game)
        {
            super(game);
            this.spotAngle = 45;
            this.castShadow = false;
        }

        public get viewMatrix() : Mat4x4 {
            return this.transform.Matrix.clone().invert();
        }

        public get projectionMatrix(): Mat4x4 {
            return new Mat4x4().perspective(Mathf.TO_RADIANS * this.spotAngle, 1.0, 1.0, 2000);
        }
    }
}