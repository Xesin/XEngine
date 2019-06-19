namespace XEngine2 {
    export class Component {
        public parent: Component;
        public bCanUpdate: boolean;

        constructor()
        {
            this.bCanUpdate = false;
        }

        public setupAttachtment(parent: Component){
            this.parent = parent;
        }


        public update(deltaTime: number)
        {

        }
    }
}