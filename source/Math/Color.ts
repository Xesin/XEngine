import {Vector3} from "./Mathf";

export class Color {

    public zOffset = 0;

    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor (r = 1, g = r, b = r, a = r) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public setTo(x: number, y = x, z = x, w = x): Color {
        this.r = x;
        this.g = y;
        this.b = z;
        this.a = w;
        return this;
    }

    public sub(color: Color): Color {
        this.r -= color.r;
        this.g -= color.g;
        this.b -= color.b;
        this.a -= color.a;

        return this;
    }

    public add(color: Color): Color {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        this.a += color.a;

        return this;
    }

    public multiply(color: Color): Color {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;
        this.a *= color.a;
        return this;
    }

    public getHexString(): string {
        return (this.r * 255).toString(16) + (this.g * 255).toString(16) + (this.b * 255).toString(16);
    }

    public fromHexString(hexValue: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
            this.r = parseInt(result[1], 16) / 255;
            this.g = parseInt(result[2], 16) / 255;
            this.b = parseInt(result[3], 16) / 255;
    }

    public getVector3(): Vector3 {
        return new Vector3(this.r, this.g, this.b);
    }
}

