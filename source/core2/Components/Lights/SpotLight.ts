/// <reference path="Light.ts" />

namespace XEngine2 {
    export class SpotLight extends PointLight {

        public spotAngle: number

        constructor(game: Game)
        {
            super(game);
            this.spotAngle = 45;
        }
    }
}