namespace XEngine2
{
    export class Actor
    {
        public rootComponent: SceneComponent;
        public hidden: boolean;

        constructor()
        {
            this.rootComponent = new SceneComponent;
            this.hidden = false;
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

        public Tick(deltaTime: number) : void
        {
            
        }

        public GetComponents<T extends Component>(): Array<T>{
            let result = new Array<T>();
            Object.keys(this).forEach(key => {
                let object = this[key];
                if((object as T) && result.indexOf(object) === -1)
                {
                    result.push(object);
                }
            });
            return result;
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