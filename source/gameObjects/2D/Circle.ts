namespace XEngine {
	export class Circle extends TwoDObject {

		constructor(game: Game, posX: number, posY: number, width: number, height: number) {
			super(game, posX, posY);
			this.transform.width = width;
			this.transform.height = height;
			this.materials[0] = this.game.resourceManager.createMaterial(CircleMat, "circleShader");
		}

		public getBounds(): any {
			let width = this.transform.width * this.transform.scale.x;
			let height = this.transform.height * this.transform.scale.y;
			return {
				width: width,
				height: height,
			};
		}
	}
}
