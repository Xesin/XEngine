namespace XEngine2 {

    export class StaticMeshComponent extends SceneComponent {
       
        public Mesh : StaticMesh;
        
        constructor()
        {
            super();
        }

        public render(renderer: Renderer)
        {
            renderer.renderMeshImmediate(this.Mesh, this.transform);
        }
    }
}