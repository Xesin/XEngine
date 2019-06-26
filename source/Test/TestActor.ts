/// <reference path="../core2/GameObjects/StaticMeshActor.ts" />

namespace XEngine2
{
    export class TestActor extends Actor
    {
        constructor(game: Game)
        {
            super(game);
            let thisAny: any;
            thisAny = this;
            let numItems = 0;
            for (const meshName in this.game.cache.geometries) 
            {
                
                const mesh = this.game.cache.geometries[meshName];
                thisAny[meshName] = new StaticMeshComponent(this.game);
                thisAny[meshName].Mesh = mesh;
            }            
        }
    }
}