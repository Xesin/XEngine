import {Vector3, Mat4x4, Quaternion} from "./Mathf";

export class Transform {
    public parent: Transform;
    public position: Vector3;
    public scale: Vector3;
    public rotation: Vector3;

    protected dirty: boolean;
    protected cachedMatrix: Mat4x4;

    protected helperMatrix: Mat4x4;

    constructor () {
        this.dirty = true;
        this.position = new Vector3(0, 0, 0);
        this.scale = new Vector3();
        this.rotation = new Vector3(0, 0, 0);
        this.helperMatrix = new Mat4x4();
    }

    public get Matrix(): Mat4x4 {
        let parentMatrix: Mat4x4;

        if (this.Dirty) {
            let matrix = new Mat4x4();
            matrix.rotateTranslateAndScale(Quaternion.fromEulerVector(this.rotation), this.position, this.scale);
            this.cachedMatrix = matrix;
            this.Dirty = false;
        }

        if (this.parent) {
            parentMatrix = this.parent.Matrix;
        }

        if (parentMatrix) {
            return parentMatrix.clone().multiply(this.cachedMatrix);
        } else {
            return this.cachedMatrix;
        }
    }


    public get Dirty(): boolean {
        return this.dirty
        || this.position.Dirty
        || this.rotation.Dirty
        || this.scale.Dirty
        || this.cachedMatrix === undefined
        || this.cachedMatrix === null;
    }

    public forward(): Vector3 {
        let forwardVector = new Vector3(0, 0, -1);
        this.helperMatrix.identity();

        this.helperMatrix.extractRotation(this.Matrix);

        forwardVector.multiplyMatrix(this.helperMatrix);
        return forwardVector;
    }

    public right(): Vector3 {
        let rightVector = new Vector3(-1, 0, 0);
        this.helperMatrix.identity();

        this.helperMatrix.extractRotation(this.Matrix);

        rightVector.multiplyMatrix(this.helperMatrix);
        return rightVector;
    }

    public up(): Vector3 {
        let rightVector = new Vector3(0, 1, 0);
        this.helperMatrix.identity();

        this.helperMatrix.extractRotation(this.Matrix);

        rightVector.multiplyMatrix(this.helperMatrix);
        return rightVector;
    }


    public set Dirty(v: boolean) {
        this.position.Dirty = v;
        this.rotation.Dirty = v;
        this.scale.Dirty = v;
        this.dirty = v;
    }

    public get WorldPosition(): Vector3 {
        let res = new Vector3(this.position.x, this.position.y, this.position.z);
        if (this.parent) {
            res.add(this.parent.WorldPosition);
        }

        return res;
    }

    public get WorldRotation(): Vector3 {
        let res = new Vector3(this.rotation.x, this.rotation.y, this.rotation.z);
        if (this.parent) {
            res.add(this.parent.WorldRotation);
        }

        return res;
    }

    public get WorldScale(): Vector3 {
        let res = new Vector3(this.scale.x, this.scale.y, this.scale.z);
        if (this.parent) {
            res.add(this.parent.WorldRotation);
        }

        return res;
    }
}
