/// <reference path="../SceneComponent.ts" />

import {Game} from "../../Game"
import {SceneComponent} from "../SceneComponent"
import {Mat4x4, Frustum, Mathf} from "../../../Math/Mathf"
import {Scene} from "../../Scenes/Scene"
import {RenderTarget} from "../../Render/Resources/Texture/RenderTarget"

export class CameraComponent extends SceneComponent {
    
    private _projectionMatrix: Mat4x4;
    public renderTarget : RenderTarget;
    public far: number;
    public near: number;
    public fov: number;
    private frustrum: Frustum;

    constructor(game: Game)
    {
        super(game);
        this.bCanUpdate = true;
        this._projectionMatrix = new Mat4x4;
        this.renderTarget = null;
        this.fov = 60;
        this.near = 1.0;
        this.far = 1000;
        this.frustrum = new Frustum();
    }        

    public cull(scene: Scene) : Array<SceneComponent>
    {
        this.frustrum.setFromMatrix(this.projectionMatrix.multiply(this.viewMatrix));
        let actors = scene.actors;
        let result = new Array<SceneComponent>();
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (!actor.hidden && !actor.pendingDestroy)
            {
                let components = actor.GetComponents<SceneComponent>(SceneComponent);
                for (let j = 0; j < components.length; j++) {
                    const sceneComponent = components[j];
                    if(!sceneComponent.hidden && !sceneComponent.pendingDestroy && this.frustrum.intersectsBox(sceneComponent.getBounds())){
                        result.push(sceneComponent);
                    }
                }
            }
        }
        return result;
    }

    public get viewMatrix() : Mat4x4 {
        return this.transform.Matrix.clone().invert();
    }

    
    public get projectionMatrix() : Mat4x4 {
        let game = Game.GetInstance();
        const fieldOfView = this.fov * Mathf.TO_RADIANS;   // in radians
        const aspect = game.width / game.height;
        const zNear = this.near;
        const zFar = this.far;

    
        this._projectionMatrix.perspective(
            fieldOfView,
            aspect,
            zNear,
            zFar
        );

        return this._projectionMatrix;
    }
    
}
