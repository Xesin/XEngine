/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends StaticMeshActor
    {
        constructor()
        {
            super();
            this.staticMesh.Mesh = XEngine2.Game.GetInstance().cache.geometries["sponza_117.000"];
            let thisAny: any;
            thisAny = this;
            let numItems = 0;
            // for (const meshName in XEngine2.Game.GetInstance().cache.geometries) 
            // {
                
            //     const mesh = XEngine2.Game.GetInstance().cache.geometries[meshName];
            //     thisAny[meshName] = new StaticMeshComponent();
            //     thisAny[meshName].Mesh = mesh;
            // }            
        }
    }
}