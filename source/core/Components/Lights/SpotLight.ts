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
            let translationVector = this.transform.forward();
            let translation = translationVector.scalar(-5);
            let target = this.transform.position.Clone().add(translation);
            let matrix = new Mat4x4();

            return matrix.lookAt(this.transform.position, target, new Vector3(0,1,0));
        }

        public get projectionMatrix(): Mat4x4 {
            let game = Game.GetInstance();
            const fieldOfView = this.spotAngle * Mathf.TO_RADIANS;   // in radians
            const aspect = game.width / game.height;
            const zNear = 1;
            const zFar = 256;

        
            return new Mat4x4().perspective(
                fieldOfView,
                aspect,
                zNear,
                zFar
            );
        }
    }
}