/// <reference path="Actor.ts" />

namespace XEngine2
{
    export class StaticMeshActor extends Actor
    {
       public staticMesh: StaticMeshComponent;

       constructor(game: Game)
        {
            super(game);

            this.staticMesh = new StaticMeshComponent(game);
            this.rootComponent = this.staticMesh;
        }
    }
}