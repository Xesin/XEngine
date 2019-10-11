/// <reference path="../SceneComponent.ts" />

namespace XEngine2 {
    export class Light extends SceneComponent {
        
        public color: Color;
        public intensity: number;
        public shadowBias: number;
        public castShadow: boolean;

        public _shadowMap: RenderTarget;
        private _projectionMatrix: Mat4x4;
        private frustum: Frustum;

        constructor(game: Game)
        {
            super(game);
            this.color = new Color(1.0);
            this.intensity = 1.0;
            this._projectionMatrix = new Mat4x4();
            this.castShadow = true;
            this.shadowBias = 0.005;
            this.frustum = new Frustum();
        }

        public getAllRenderableGroups(): Array<MeshGroup>
        {
            return null;
        }

        public Equal(otherLight: Light)
        {
            return otherLight.color == this.color && otherLight.intensity == this.intensity && otherLight.transform == this.transform;
        }

        public get viewMatrix() : Mat4x4 {
            let translationVector = this.transform.forward();
            let translation = translationVector.scalar(200);
            translation.z *= -1.0;
            let matrix = new Mat4x4();

            matrix.lookAt(translation, new Vector3(0,0,0), new Vector3(0,1,0));

            // mat4.translate(matrix.elements, matrix.elements, new Vector3(0).toArray());
            // mat4.invert(matrix.elements, matrix.elements);

            return matrix;
        }

        public get dirLight() : Vector4 {
            let matrix = new Mat4x4();

            matrix.rotateAndTranslate(Quaternion.fromEulerVector(this.transform.rotation), this.transform.position);

            return matrix.getColumn(2);
        }

        public cull(scene: Scene) : Array<SceneComponent>
        {
            this.frustum.setFromMatrix(this.projectionMatrix.multiply(this.viewMatrix));
            let actors = scene.actors;
            let result = new Array<SceneComponent>();
			for (let i = 0; i < actors.length; i++) {
				const actor = actors[i];
				if (!actor.hidden)
				{
                    let components = actor.GetComponents<SceneComponent>(SceneComponent);
                    for (let j = 0; j < components.length; j++) {
                        const sceneComponent = components[j];
						if(!sceneComponent.hidden && this.frustum.intersectsBox(sceneComponent.getBounds())){
                            result.push(sceneComponent);
                        }
                    }
                }
            }
            return result;
        }

        
        public get projectionMatrix() : Mat4x4 {
            const zNear = -40.0;
            const zFar = 256.0;
            
            this._projectionMatrix.ortho(
                -256,
                256,
                -256,
                256,
                zNear,
                zFar
            )

            return this._projectionMatrix;
        }
    }
}