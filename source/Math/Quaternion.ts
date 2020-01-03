import {Vector3} from "./Mathf";

export class Quaternion {

    public static readonly Zero = new Quaternion(0);
    public zOffset = 0;

    public x: number;
    public y: number;
    public z: number;
    public w: number;
    private arr: Array<number>;

    constructor (x = 1, y = x, z = x, w = x) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.arr = new Array(3);

        this.zOffset = 0;
    }

    public setTo(x: number, y = x, z = x, w = x): Quaternion {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    public static fromEuler(x: number, y = x, z = x): Quaternion {
        let result = new Quaternion();
        let halfToRad = 0.5 * Math.PI / 180.0;
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;

        let sx = Math.sin(x);
        let cx = Math.cos(x);
        let sy = Math.sin(y);
        let cy = Math.cos(y);
        let sz = Math.sin(z);
        let cz = Math.cos(z);

        result.x = sx * cy * cz - cx * sy * sz;
        result.y = cx * sy * cz + sx * cy * sz;
        result.z = cx * cy * sz - sx * sy * cz;
        result.w = cx * cy * cz + sx * sy * sz;

        return result;
    }

    public static fromEulerVector(vector: Vector3): Quaternion {

        return Quaternion.fromEuler(vector.x, vector.y, vector.z);
    }
}
