export module Easing {
    export class Linear {
        public static None(t) {
            return t;
        }
    }

    export class Quad {
        public static In(t): number {
            return t * t;
        }

        public static Out(t): number {
            return t * (2 - t);
        }

        public static InOut(t): number {
            return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
    }

    export class Cubic {
        public static In(t): number {
            return t * t * t;
        }

        public static Out(t): number {
            return (--t) * t * t + 1;
        }

        public static InOut(t): number {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
    }

    export class Quart {
        public static In(t): number {
            return t * t * t * t;
        }

        public static Out(t): number {
            return 1 - (--t) * t * t * t;
        }

        public static InOut(t): number {
            return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        }
    }

    export class Quint {
        public static In(t): number {
            return t * t * t * t * t;
        }

        public static Out(t): number {
            return 1 + (--t) * t * t * t * t;
        }

        public static InOut(t): number {
            return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
        }
    }

    export class Sin {
        public static In(t): number {
            if (t === 0) { return 0; }
            if (t === 1) { return 1; }
            return Math.cos(t * Math.PI / 2);
        }

        public static Out(t): number {
            if (t === 0) { return 0; }
            if (t === 1) { return 1; }
            return Math.sin(t * Math.PI / 2);
        }

        public static InOut(t): number {
            if (t === 0) { return 0; }
            if (t === 1) { return 1; }
            return 0.5 * (1 - Math.cos(Math.PI * t));
        }
    }

    export class Expo {
        public static In(t): number {
            return t === 0 ? 0 : Math.pow(1024, t - 1);
        }

        public static Out(t): number {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        public static InOut(t): number {
            if (t === 0) { return 0; }
            if (t === 1) { return 1; }
            if ((t *= 2) < 1) { return 0.5 * Math.pow(1024, t - 1); }
            return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
        }
    }

    export class Circular {
        public static In(t): number {
            return 1 - Math.sqrt(1 - t * t);
        }

        public static Out(t): number {
            return Math.sqrt(1 - (--t * t));
        }

        public static InOut(t): number {
            if ((t *= 2) < 1) { return -0.5 * (Math.sqrt(1 - t * t) - 1); }
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }
    }

    export class Back {
        public static In(t): number {
            let s = 1.70158;
            return t * t * ((s + 1) * t - s);
        }

        public static Out(t): number {
            let s = 1.70158;
            return --t * t * ((s + 1) * t + s) + 1;
        }

        public static InOut(t): number {
            let s = 1.70158 * 1.525;
            if ((t *= 2) < 1) { return 0.5 * (t * t * ((s + 1) * t - s)); }
            return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
        }
    }

    export class Bounce {
        public static In(t): number {
            return 1 - Bounce.Out(1 - t);
        }

        public static Out(t): number {
            if (t < (1 / 2.75)) {
                return 7.5625 * t * t;
            } else if (t < (2 / 2.75)) {
                return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
            } else if (t < (2.5 / 2.75)) {
                return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
            } else {
                return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
            }
        }

        public static InOut(t): number {
            if (t < 0.5) { return Easing.Bounce.In(t * 2) * 0.5; }
            return Easing.Bounce.Out(t * 2 - 1) * 0.5 + 0.5;
        }
    }
}
