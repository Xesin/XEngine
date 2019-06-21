/// <reference path="Component.ts" />

namespace XEngine2 {
    export class SceneComponent extends Component {
        public transform: Transform;

        constructor()
        {
            super();
            this.transform = new Transform();
        }

        public render(renderer: Renderer)
        {
            
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return null;
        }
    }
}