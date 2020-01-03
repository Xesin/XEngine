
export class EObject {
    public pendingDestroy: boolean;

    constructor() {
        this.pendingDestroy = false;
    }

    public destroy() {
        this.pendingDestroy = true;
    }
}
