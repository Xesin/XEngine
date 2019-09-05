namespace XEngine2 {
    export class Component {
        public parent: Component;
        public bCanUpdate: boolean;
        public game: Game;
        public name: string;

        constructor(game: Game, name: string = "")
        {
            this.bCanUpdate = false;
            this.game = game;
            this.name = name;
        }

        public setupAttachtment(parent: Component){
            this.parent = parent;
        }


        public update(deltaTime: number)
        {

        }
    }
}