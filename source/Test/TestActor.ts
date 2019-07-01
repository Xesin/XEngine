/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {

        public dirLight: DirectionalLight;

        constructor(game: Game)
        {
            super(game);
            let thisAny: any;
            thisAny = this;

            this.dirLight = new DirectionalLight(game);
            for (const meshName in this.game.cache.geometries) 
            {
                
                const mesh = this.game.cache.geometries[meshName];
                thisAny[meshName] = new StaticMeshComponent(this.game);
                thisAny[meshName].transform.scale.setTo(0.10);
                thisAny[meshName].Mesh = mesh;
            }            
        }
    }
}