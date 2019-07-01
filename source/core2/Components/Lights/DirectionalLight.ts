/// <reference path="Light.ts" />

namespace XEngine2 {
    export class DirectionalLight extends Light {

        constructor(game: Game)
        {
            super(game);
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return null;
        }
    }
}