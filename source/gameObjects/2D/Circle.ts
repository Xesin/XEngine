namespace XEngine {
	export class Circle extends GameObject {
		public width: number;
		public height: number;

		constructor(game: Game, posX: number, posY: number, width: number, height: number) {
			super(game, posX, posY);
			this.width = width;
			this.height = height;
			this.shader = this.game.resourceManager.createMaterial(CircleMat, "circleShader");
		}

		public getBounds(): any {
			let width = this.width * this.transform.scale.x;
			let height = this.height * this.transform.scale.y;
			return {
				width: width,
				height: height,
			};
		}
	}
}
