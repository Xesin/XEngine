import { Transform, Vector3 } from "../Math/Mathf";

export class Particle {

    public transform: Transform;
    public alive: boolean;
    public ttl: number;

    constructor() {
        this.transform = new Transform();
    }

    public kill() {
        this.alive = false;
    }

    public reset(ttl: number, position: Vector3, rotation: Vector3, scale: Vector3) {
        this.alive = true;
        this.ttl = ttl;
        this.transform.position = position;
        this.transform.rotation = rotation;
        this.transform.scale = scale;
    }
}
