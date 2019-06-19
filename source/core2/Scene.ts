namespace XEngine2 
{
    export class Scene
    {
        public actors: Array<Actor>;
        public game: Game;
        public name: string;
        public mainCamera: CameraComponent;

        constructor(name: string, game: Game)
        {
            this.name = name;
            this.game = game;
        }

        public Instantiate(actorToInstantiate : Actor, transform: Transform = null) : Actor
        {
            let instancedActor = Object.create(actorToInstantiate) as Actor;

            if (transform)
            {
                instancedActor.rootComponent.transform = transform;
            }

            this.actors.push(instancedActor);

            return instancedActor;
        }

        public Render(camera = this.mainCamera)
        {
            if(camera != null)
            {
                
            }
        }
    }
}