namespace XEngine2
{
    export class Actor
    {
        public rootComponent: SceneComponent;
        public hidden: boolean;
        public game: Game;

        constructor(game: Game)
        {
            this.rootComponent = new SceneComponent(game);
            this.hidden = false;
            this.game = game;
        }

        public OnSpawn(): void
        {

        }

        public OnBeginPlay(): void
        {

        }

        public OnDestroy(): void
        {

        }

        public update(deltaTime: number) 
        {
            let components = this.GetComponents<Component>(Component);
            components.forEach(component => {
                if(component.bCanUpdate)
                    component.update(deltaTime);
            });
        }

        public GetComponents<T extends Component>(className: typeof Component): Array<T>{
            let result = new Array<Component>();
            Object.keys(this).forEach(key => {
                let object = this[key] as Component;
                if((object instanceof className) && result.indexOf(object) === -1)
                {
                    result.push(object);
                }
            });
            return result as Array<T>;
        }

        public GetComponent<T extends Component>(): T{
            let result = new Array<T>();
            Object.keys(this).forEach(key => {
                let object = this[key];
                if(object as T)
                {
                    return object;
                }
            });
            return null;
        }
    }
}