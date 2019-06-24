/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends StaticMeshActor
    {
        public boxMesh: StaticMeshComponent;
        constructor()
        {
            super();
            this.boxMesh = new StaticMeshComponent();
            this.staticMesh.Mesh = new XEngine2.BasicGeometries.SphereMesh(BasicMaterial.SharedInstance, 1.25, 64, 64);

            this.boxMesh.Mesh = new XEngine2.BasicGeometries.BoxMesh(BasicMaterial.SharedInstance);
            this.boxMesh.transform.position.x = -2;
            this.boxMesh.transform.position.y = -0.5;
            this.boxMesh.transform.position.z = -5;
        }
    }
}