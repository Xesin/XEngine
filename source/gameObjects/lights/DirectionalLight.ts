/// <reference path="Light.ts"/>
namespace XEngine {
	export class DirectionalLight extends Light {

		constructor(game: Game, intensity = 1) {
			super(game, 0, 0, 0);
			this.visible = false;
			this.type = LightType.DIRECTIONAL;
			this.intensity = intensity;
			this.lightColor = new Vector3(1, 1, 1);
			this.range = 1.0;
		}
	}
}
