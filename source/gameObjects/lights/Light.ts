namespace XEngine {
	export class Light extends GameObject {
		public type: LightType;
		public intensity: number;
		public lightColor: Vector3;
		public range: number;
	}
}
