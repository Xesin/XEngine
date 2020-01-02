import {StaticMesh} from "./StaticMesh"
import {Transform} from "../../../../Math/Mathf"

export class MeshGroup
{
    public materialIndex: number;
    public firstVertex: number;
    public vertexCount: number;
    public Mesh: StaticMesh;
    public transform: Transform;
    public indices: Array<number>

    constructor(materialIndex: number, firstVertex: number, vertexCount: number, Mesh: StaticMesh, indices: Array<number> = null)
    {
        this.materialIndex = materialIndex;
        this.firstVertex = firstVertex;
        this.vertexCount = vertexCount;
        this.Mesh = Mesh;
        this.indices = indices;
    }

    
    public get castShadows() : boolean {
        return this.Mesh.castShadows;
    }
    
}
