namespace XEngine2 {
    export class Component {
        public parent: Component;
        public bCanUpdate: boolean;
        public game: Game;

        constructor(game: Game)
        {
            this.bCanUpdate = false;
            this.game = game;
        }

        public setupAttachtment(parent: Component){
            this.parent = parent;
        }


        public update(deltaTime: number)
        {

        }
    }
}