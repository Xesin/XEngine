
/// <reference path="Transform.ts"/>
namespace XEngine {

	export class RectTransform extends Transform {

		public anchor: Vector3;
		public width: number;
		public height: number;

		constructor(width: number, height: number) {
			super();
			this.anchor = new Vector3(0);
			this.width = width;
			this.height = height;
		}

		public calculateMatrix() {
			let translation =  this.position.toArray();
			mat4.identity(this.matrix.elements);
			mat4.translate(this.matrix.elements, this.matrix.elements, translation);
			let anchorOffsetX = Math.round(-(this.width * this.anchor.x));
			let anchorOffsetY = Math.round(-(this.height * this.anchor.y));
			mat4.rotateY(this.matrix.elements, this.matrix.elements, this.rotation.y * XEngine.Mathf.TO_RADIANS);
			mat4.rotateZ(this.matrix.elements, this.matrix.elements, this.rotation.z * XEngine.Mathf.TO_RADIANS);
			mat4.rotateX(this.matrix.elements, this.matrix.elements, this.rotation.x * XEngine.Mathf.TO_RADIANS);
			mat4.scale(this.matrix.elements, this.matrix.elements, this.scale.toArray());
			mat4.translate(this.matrix.elements, this.matrix.elements, [anchorOffsetX, anchorOffsetY, 0.0]);
		}

	}
}
