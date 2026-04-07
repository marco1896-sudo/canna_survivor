// Camera — smooth follow + screen shake
// Depends on: math.js (lerp, randomRange)

class Camera {
    constructor(width, height) {
        this.x = 0; // top-left of view in world space
        this.y = 0;
        this.width = width;
        this.height = height;

        this._shakeTimer = 0;
        this._shakeMag = 0;
        this._shakeX = 0;
        this._shakeY = 0;
    }

    // Add screen shake (magnitude in pixels, duration in seconds)
    shake(magnitude, duration) {
        this._shakeMag = Math.max(this._shakeMag, magnitude || 6);
        this._shakeTimer = Math.max(this._shakeTimer, duration || 0.25);
    }

    update(dt, targetX, targetY) {
        // Exponential smoothing toward player center
        const speed = 9;
        const tCamX = targetX - this.width * 0.5;
        const tCamY = targetY - this.height * 0.5;
        const t = 1 - Math.exp(-speed * dt);
        this.x = lerp(this.x, tCamX, t);
        this.y = lerp(this.y, tCamY, t);

        // Decay shake
        if (this._shakeTimer > 0) {
            this._shakeTimer -= dt;
            const intensity = this._shakeMag * Math.max(0, this._shakeTimer / 0.25);
            this._shakeX = randomRange(-intensity, intensity);
            this._shakeY = randomRange(-intensity, intensity);
            if (this._shakeTimer <= 0) {
                this._shakeX = 0;
                this._shakeY = 0;
                this._shakeMag = 0;
            }
        }
    }

    // Call before drawing world-space elements
    apply(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(this.x) + Math.round(this._shakeX),
            -Math.round(this.y) + Math.round(this._shakeY)
        );
    }

    // Call after drawing world-space elements
    unapply(ctx) {
        ctx.restore();
    }

    // Convert world position to screen position
    worldToScreen(wx, wy) {
        return {
            x: wx - this.x + this._shakeX,
            y: wy - this.y + this._shakeY
        };
    }

    // Convert screen position to world position
    screenToWorld(sx, sy) {
        return {
            x: sx + this.x - this._shakeX,
            y: sy + this.y - this._shakeY
        };
    }

    // Is a world-space point visible on screen? (with optional margin)
    isVisible(wx, wy, margin) {
        const m = margin || 80;
        const sx = wx - this.x;
        const sy = wy - this.y;
        return sx > -m && sx < this.width + m && sy > -m && sy < this.height + m;
    }
}
