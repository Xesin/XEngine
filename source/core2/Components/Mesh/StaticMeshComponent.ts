namespace XEngine2 {

    export class StaticMeshComponent extends SceneComponent {
       
        public Mesh : StaticMesh;
        
        private speed: number;

        constructor()
        {
            super();
            this.speed = Mathf.randomRange(-60, 60);
            this.bCanUpdate = true;
        }

        public update(deltaTime: number)
        {
            super.update(deltaTime);
            this.transform.rotation.y += this.speed * deltaTime;
            this.transform.rotation.x += this.speed * deltaTime;
            this.transform.rotation.z += this.speed * deltaTime;
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return new Array<MeshGroup>().concat(this.Mesh.groups);
        }
    }
}