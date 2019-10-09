/// <reference path="Light.ts" />

namespace XEngine2 {
    export class PointLight extends Light {

        public radius : number;

        constructor(game: Game)
        {
            super(game);
            this.radius = 100;
            this.castShadow = false;
        }
    }
}