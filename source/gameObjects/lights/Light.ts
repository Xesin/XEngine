namespace XEngine {
	export class Light extends GameObject {
		public type: LightType;


		private _dirty: boolean;
		private _intensity: number;
		private _lightColor: Vector3;
		private _range: number;

		public constructor(game: Game, posX: number, posY: number, posZ: number) {
			super(game, posX, posY, posZ);
			this.lightColor = new Vector3(1, 1, 1);
		}

		get intensity(): number {
			return this._intensity;
		}

		set intensity(value: number) {
			this._intensity = value;
			this.dirty = true;
		}

		get range(): number {
			return this._range;
		}

		set range(value: number) {
			this._range = value;
			this.dirty = true;
		}

		get lightColor(): Vector3 {
			return this._lightColor;
		}

		set lightColor(value: Vector3) {
			this._lightColor = value;
			this.dirty = true;
		}

		get dirty(): boolean {
			return this._dirty || this.transform.dirty || this.lightColor.dirty;
		}

		set dirty(value: boolean) {
			this._dirty = this.transform.dirty = this.lightColor.dirty =  value;
		}
	}
}
