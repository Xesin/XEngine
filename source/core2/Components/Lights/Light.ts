/// <reference path="../SceneComponent.ts" />

namespace XEngine2 {
    export class Light extends SceneComponent {
        
        public color: Color;
        public intensity: number;

        constructor(game: Game)
        {
            super(game);
            this.color = new Color(1.0);
            this.intensity = 1.0;
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return null;
        }

        public Equal(otherLight: Light)
        {
            return otherLight.color == this.color && otherLight.intensity == this.intensity && otherLight.transform == this.transform;
        }
    }
}