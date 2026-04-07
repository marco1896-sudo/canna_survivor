// Generic object pool — avoids GC churn for frequently-created objects

class ObjectPool {
    constructor(factory, reset, initialSize) {
        this._factory = factory;
        this._reset = reset;
        this._pool = [];
        this.active = [];

        const size = initialSize || 0;
        for (let i = 0; i < size; i++) {
            this._pool.push(factory());
        }
    }

    acquire() {
        const obj = this._pool.length > 0 ? this._pool.pop() : this._factory();
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            this._reset(obj);
            this._pool.push(obj);
        }
    }

    // Release all active objects at once (e.g. on scene reset)
    releaseAll() {
        for (const obj of this.active) {
            this._reset(obj);
            this._pool.push(obj);
        }
        this.active = [];
    }

    get size() { return this.active.length; }
}
