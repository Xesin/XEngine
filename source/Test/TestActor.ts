/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends StaticMeshActor
    {
        constructor()
        {
            super();

            this.staticMesh.Mesh = new XEngine2.BasicGeometries.BoxMesh(new BasicMaterial());
        }
    }
}