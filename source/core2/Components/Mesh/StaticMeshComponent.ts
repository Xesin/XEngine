namespace XEngine2 {

    export class StaticMeshComponent extends SceneComponent {
       
        public Mesh : StaticMesh;
        
        private speed: number;

        constructor(game: Game)
        {
            super(game);
            this.speed = Mathf.randomRange(-60, 60);
            this.bCanUpdate = true;
        }

        public update(deltaTime: number)
        {
            super.update(deltaTime);
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            if(this.Mesh)
                return new Array<MeshGroup>().concat(this.Mesh.groups);
            else
                return null;
        }
    }
}