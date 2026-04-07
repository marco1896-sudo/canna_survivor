// Fixed-timestep game loop with delta-time capping

class GameLoop {
    constructor(update, render) {
        this._update = update;
        this._render = render;
        this._running = false;
        this._lastTime = 0;
        this._raf = null;
        this.fps = 0;
        this._fpsTimer = 0;
        this._fpsCount = 0;
    }

    start() {
        this._running = true;
        this._lastTime = performance.now();
        this._raf = requestAnimationFrame((t) => this._tick(t));
    }

    stop() {
        this._running = false;
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }
    }

    _tick(now) {
        if (!this._running) return;

        let dt = (now - this._lastTime) / 1000;
        this._lastTime = now;

        // Cap delta to prevent spiral-of-death (e.g. on tab switch)
        dt = Math.min(dt, 0.1);

        // FPS tracking
        this._fpsTimer += dt;
        this._fpsCount++;
        if (this._fpsTimer >= 1) {
            this.fps = this._fpsCount;
            this._fpsCount = 0;
            this._fpsTimer -= 1;
        }

        this._update(dt);
        this._render(dt);

        this._raf = requestAnimationFrame((t) => this._tick(t));
    }
}
