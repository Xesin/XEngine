namespace XEngine {
	declare var mat4: any;
	export class TwoDObject extends GameObject {
		protected game: Game;
		public color: number;

		public onClick: Signal;
		public onInputDown: Signal;
		public onInputOver: Signal;
		public onInputUp: Signal;
		public onInputLeft: Signal;
		public inputEnabled: boolean;
		public isInputDown: boolean;
		public isInputOver: boolean;

		public width: number;
		public height: number;
		public isometric: boolean;

		public mask: GameObject;

		private _prevWidth: number;
		private _prevHeight: number;
		private _prevPos: Vector3;


		constructor(game: Game, posX = 0, posY = 0, posZ = 0) {
			super(game, posX, posY, posZ);

			this.onClick = new XEngine.Signal();
			this.onInputDown = new XEngine.Signal();
			this.onInputUp = new XEngine.Signal();
			this.onInputOver = new XEngine.Signal();
			this.onInputLeft = new XEngine.Signal();
			this.inputEnabled = false;
			this._prevPos = new XEngine.Vector3();

			this.color = (0xffffff >> 16) + (0xffffff & 0xff00) + ((0xffffff & 0xff) << 16);
		}

		// public getWorldMatrix (childMatrix: Array<number>) {
		// 	this.parent.getWorldMatrix(childMatrix);
		// 	let translation =  this.transform.position.toArray();
		// 	if (this.fixedToCamera) {
		// 		translation[0] += this.game.camera.transform.position.x;
		// 		translation[1] += this.game.camera.transform.position.y;
		// 		translation[2] += this.game.camera.transform.position.z;
		// 	}
		// 	let anchorX = Math.round(-(this.width * this.anchor.x));
		// 	let anchorY = Math.round(-(this.height * this.anchor.y));
		// 	mat4.translate(childMatrix, childMatrix, translation);
		// 	mat4.rotateX(childMatrix, childMatrix, this.transform.rotation.x * XEngine.Mathf.TO_RADIANS);
		// 	mat4.rotateY(childMatrix, childMatrix, this.transform.rotation.y * XEngine.Mathf.TO_RADIANS);
		// 	mat4.rotateZ(childMatrix, childMatrix, this.transform.rotation.z * XEngine.Mathf.TO_RADIANS);
		// 	mat4.scale(childMatrix, childMatrix, this.transform.scale.toArray());
		// 	mat4.translate(childMatrix, childMatrix, [anchorX, anchorY, 0]);
		// 	return childMatrix;
		// }

		public update(deltaTime: number) {
			super.update(deltaTime);

			if (this._prevHeight !== this.height ||
				this._prevWidth !== this.width ||
				this._prevPos.x !== this.transform.position.x ||
				this._prevPos.y !== this.transform.position.y) {
				this._setVertices(this.width, this.height, this.color, this._uv);
				this._prevHeight = this.height;
				this._prevWidth = this.width;
				this._prevPos.x = this.transform.position.x;
				this._prevPos.y = this.transform.position.y;
			}
		}

		public setColor(value: number, a = 1.0) {
			this.color = value;
			this.alpha = a;
			this._setVertices(this.width, this.height, this.color, this._uv);
		}

		public getTotalAlpha () {
			let totAlpha = this.alpha;
			return totAlpha;
		}

		public rendermask(gl: WebGLRenderingContext) {
			// disable color (u can also disable here the depth buffers)
			gl.colorMask(false, false, false, false);

			// Replacing the values at the stencil buffer to 1 on every pixel we draw
			gl.stencilFunc(gl.ALWAYS, 1, 1);
			gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

			gl.enable(gl.STENCIL_TEST);
			if ((this as Object).hasOwnProperty("sprite")) {
				let cache_image = this.game.cache.image((this as any).sprite);
				(this.materials[0] as SpriteMat)._setTexture(cache_image._texture);
			}

			this.materials[0].baseUniforms.pMatrix.value = this.game.camera.pMatrix;
			this.materials[0].updateUniforms(gl);

			this.vertexBuffer.bind();
			this.indexBuffer.bind();

			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
			// enabling back the color buffer
			// Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
			gl.stencilFunc(gl.EQUAL, 1, 1);
			gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
			gl.colorMask(true, true, true, true);
		}

		public endRendermask(gl: WebGLRenderingContext) {
			gl.disable(gl.STENCIL_TEST);
			gl.clear(gl.STENCIL_BUFFER_BIT);
		}

		public getBounds (): any {
			let width = this.width * this.transform.scale.x;
			let height = this.height * this.transform.scale.y;
			let worldPos = this.transform.position;
			let widthAnchor = width * this.anchor.x;
			let heightAnchor = height * this.anchor.y;
			let minX = worldPos.x - widthAnchor;
			let maxX = worldPos.x + width - widthAnchor;
			let minY = worldPos.y - heightAnchor;
			let maxY = worldPos.y + height - heightAnchor;
			return {
				height: height,
				maxX: maxX,
				maxY: maxY,
				minX: minX,
				minY: minY,
				width: width,
			};
		}

		public isInsideCamera(): boolean {
			let bounds = this.getBounds();
			let worldPos = this.transform.position;
			let cameraPos = this.game.camera.transform.position;
			let viewRect = {width: this.game.width, height: this.game.height};
			if (bounds.maxX < cameraPos.x) { return false; }
			if (bounds.maxY < cameraPos.y) { return false; }
			if (bounds.minX > cameraPos.x + viewRect.width) {return false; }
			if (bounds.minY > cameraPos.y + viewRect.height) { return false; }

			return true;
		}

		public _setVertices(width: number, height: number, color: number, uv: Array<number>) {
			let pos = new XEngine.Vector3(0, 0);
			this._uv = uv;
			this.width = width;
			this.height = height;

			let vertices = [
				// Cara delantera
				0, 0, -1,
				width, 0, -1,
				width, height, -1,
				0, height, -1,
			];

			const indices = [
				2, 1, 0,
				0, 3, 2,
			];

			this.setVertices(vertices, indices, uv);
		}
	}
}
