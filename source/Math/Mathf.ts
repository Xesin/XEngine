
export class Mathf {

	public static readonly TO_RADIANS = 0.0174532925199432957;
	public static readonly TO_DEGREES = 57.2957795130823208767;

	public static randomRange(min: number, max: number): number {
		return min + (Math.random() * (max - min));
	}

	public static randomIntRange(min: number, max: number): number {
		return Math.round(min + Math.random() * (max - min));
	}

	public static clamp(number: number, min: number, max: number) {
		return Math.max(Math.min(number, max), min);
	}

	public static lerp(a: number, b: number, t: number) {
		t = Mathf.clamp(t, 0, 1);
		return (1 - t) * a + t * b;
	}

	public static lerpColor(a: string, b: string, amount: number) {
		let ah = parseInt(a.replace(/#/g, ""), 16),
			ar = ah >> 16,
			ag = ah >> 8 & 0xff,
			ab = ah & 0xff,
			bh = parseInt(b.replace(/#/g, ""), 16),
			br = bh >> 16,
			bg = bh >> 8 & 0xff,
			bb = bh & 0xff,
			rr = ar + amount * (br - ar),
			rg = ag + amount * (bg - ag),
			rb = ab + amount * (bb - ab);

		return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
	}

	public static angleBetween(originX: number, originY: number, targetX: number, targetY: number) {
		let x = targetX - originX;
		let y = targetY - originY;

		return (Math.atan2(y, x));
	}

	public static hypot(...args: number[])
	{
		var y = 0, i = args.length;
		while (i--) y += args[i] * args[i];
		return Math.sqrt(y);
	}
}

export {Vector3} from "./Vector3"
export {Vector4} from "./Vector4"
export {Color} from "./Color"
export {Frustum} from "./Frustum"
export {Mat4x4} from "./Mat4x4"
export {Plane} from "./Plane"
export {Quaternion} from "./Quaternion"
export {Transform} from "./Transform"
export {Box} from "./Box"