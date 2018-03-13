namespace XEngine {
	export class PointLight extends Light {

		constructor(game: Game, intensity = 1, range = 1) {
			super(game, 0, 0, 0);
			this.render = false;
			this.type = LightType.POINT;
			this.intensity = intensity;
			this.lightColor = new Vector3(1, 1, 1);
			this.range = range;
		}
	}
}
