namespace XEngine2
{
    export class StaticMeshActor extends Actor
    {
       public staticMesh: StaticMeshComponent;

        constructor()
        {
            super();

            this.staticMesh = new StaticMeshComponent();
            this.staticMesh.setupAttachtment(this.rootComponent);
        }
    }
}