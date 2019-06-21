namespace XEngine2 
{
    export class MeshGroup
    {
        public materialIndex: number;
        public firstVertex: number;
        public vertexCount: number;
        public Mesh: StaticMesh;
        public transform: Transform;

        constructor(materialIndex: number, firstVertex: number, vertexCount: number, Mesh: StaticMesh)
        {
            this.materialIndex = materialIndex;
            this.firstVertex = firstVertex;
            this.vertexCount = vertexCount;
            this.Mesh = Mesh;
        }
    }
}