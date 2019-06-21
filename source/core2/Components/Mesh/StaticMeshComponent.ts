namespace XEngine2 {

    export class StaticMeshComponent extends SceneComponent {
       
        public Mesh : StaticMesh;
        
        constructor()
        {
            super();
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return new Array<MeshGroup>().concat(this.Mesh.groups);
        }
    }
}