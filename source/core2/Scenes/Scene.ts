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
            this.actors = new Array();
            this.mainCamera = new CameraComponent(game);
        }

        public Instantiate(actorToInstantiate : typeof Actor, transform: Transform = null) : Actor
        {
            let instancedActor = new actorToInstantiate(this.game) as Actor;

            if (transform)
            {
                instancedActor.rootComponent.transform = transform;
            }

            this.actors.push(instancedActor);

            return instancedActor;
        }

        public preload()
        {
            
        }

        public start()
        {

        }

        public update(deltaTime: number)
        {
            this.actors.forEach(actor => {
                actor.update(deltaTime);
            });
        }

        public Render(renderer: Renderer, camera = this.mainCamera)
        {
            if(camera != null)
            {
                renderer.render(this, camera);
            }
        }
    }
}