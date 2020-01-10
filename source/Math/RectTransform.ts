import {Vector3} from "./Mathf";
import { Transform } from "./Transform";

export class RectTransform extends Transform {

    public anchor: Vector3;

    constructor () {
        super();
        this.anchor = new Vector3();
    }
}
