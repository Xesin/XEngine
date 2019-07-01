/// <reference path="Component.ts" />

namespace XEngine2 {
    export class SceneComponent extends Component {
        public transform: Transform;
        public hidden: boolean;

        constructor(game: Game)
        {
            super(game);
            this.transform = new Transform();
            this.hidden = false;
        }

        public setupAttachtment(component: SceneComponent)
        {
            super.setupAttachtment(component);
            this.transform.parent = component.transform;
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