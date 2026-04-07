// Particle system — pooled, lightweight particles for all visual effects

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.life = 0; this.maxLife = 0;
        this.radius = 2; this.endRadius = 0;
        this.color = '#fff';
        this.alpha = 1;
        this.gravity = 0;
        this.active = false;
    }
}

class ParticleSystem {
    constructor() {
        this._pool = [];
        this._active = [];
        this._sporePool = [];
        this._activeSpores = [];

        // Pre-allocate
        for (let i = 0; i < 600; i++) this._pool.push(new Particle());
        for (let i = 0; i < 60; i++) this._sporePool.push({
            x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, active: false
        });
    }

    _acquire() {
        const p = this._pool.length > 0 ? this._pool.pop() : new Particle();
        p.active = true;
        this._active.push(p);
        return p;
    }

    // Hit effect — small burst on enemy damage
    hit(x, y, color, count) {
        const n = count || 5;
        for (let i = 0; i < n; i++) {
            const p = this._acquire();
            const a = Math.random() * Math.PI * 2;
            const spd = randomRange(40, 120);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.life = p.maxLife = randomRange(0.1, 0.25);
            p.radius = randomRange(2, 4);
            p.endRadius = 0;
            p.color = color || '#ffcc44';
            p.gravity = 20;
        }
    }

    // Burst — death explosion
    burst(x, y, color, count, range) {
        const n = count || 10;
        for (let i = 0; i < n; i++) {
            const p = this._acquire();
            const a = Math.random() * Math.PI * 2;
            const spd = randomRange(50, range || 80);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.life = p.maxLife = randomRange(0.25, 0.6);
            p.radius = randomRange(3, 7);
            p.endRadius = 0;
            p.color = color || '#3ddc6e';
            p.gravity = 30;
        }
    }

    // Explosion — larger, with more spread
    explosion(x, y, color, count, range) {
        const n = count || 20;
        for (let i = 0; i < n; i++) {
            const p = this._acquire();
            const a = Math.random() * Math.PI * 2;
            const spd = randomRange(60, range || 150);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd - 30;
            p.life = p.maxLife = randomRange(0.4, 0.9);
            p.radius = randomRange(4, 10);
            p.endRadius = 0;
            p.color = color || '#c9a227';
            p.gravity = 60;
        }
        // Add a few big slow ones
        for (let i = 0; i < 5; i++) {
            const p = this._acquire();
            const a = Math.random() * Math.PI * 2;
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * randomRange(20, 60);
            p.vy = Math.sin(a) * randomRange(20, 60) - 50;
            p.life = p.maxLife = randomRange(0.6, 1.2);
            p.radius = randomRange(8, 14);
            p.endRadius = 2;
            p.color = color || '#c9a227';
            p.gravity = 80;
        }
    }

    // Muzzle flash at weapon fire
    muzzle(x, y, dir, color) {
        for (let i = 0; i < 4; i++) {
            const p = this._acquire();
            const a = dir + randomRange(-0.3, 0.3);
            const spd = randomRange(80, 180);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.life = p.maxLife = randomRange(0.08, 0.18);
            p.radius = randomRange(3, 6);
            p.endRadius = 0;
            p.color = color || '#fff';
            p.gravity = 0;
        }
    }

    // Spray particles for TerpeneSpray
    spray(x, y, dir, color) {
        for (let i = 0; i < 6; i++) {
            const p = this._acquire();
            const a = dir + randomRange(-0.5, 0.5);
            const spd = randomRange(100, 250);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.life = p.maxLife = randomRange(0.15, 0.35);
            p.radius = randomRange(2, 5);
            p.endRadius = 0;
            p.color = color || '#ffb347';
            p.gravity = 15;
        }
    }

    // Level up burst — big dramatic effect
    levelUp(x, y) {
        for (let i = 0; i < 25; i++) {
            const p = this._acquire();
            const a = (i / 25) * Math.PI * 2;
            const spd = randomRange(80, 200);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd - 60;
            p.life = p.maxLife = randomRange(0.5, 1.0);
            p.radius = randomRange(4, 10);
            p.endRadius = 0;
            p.color = i % 3 === 0 ? '#c9a227' : '#3ddc6e';
            p.gravity = 40;
        }
    }

    // Ambient spore float
    addSpore(x, y) {
        let spore = this._sporePool.pop();
        if (!spore) spore = {};
        spore.x = x; spore.y = y;
        spore.vx = randomRange(-15, 15);
        spore.vy = randomRange(-30, -10);
        spore.life = spore.maxLife = randomRange(0.5, 1.5);
        spore.active = true;
        this._activeSpores.push(spore);
    }

    clear() {
        for (const p of this._active) { p.reset(); this._pool.push(p); }
        this._active = [];
        for (const s of this._activeSpores) { s.active = false; this._sporePool.push(s); }
        this._activeSpores = [];
    }

    update(dt) {
        for (let i = this._active.length - 1; i >= 0; i--) {
            const p = this._active[i];
            p.life -= dt;
            if (p.life <= 0) {
                p.reset();
                this._pool.push(p);
                this._active.splice(i, 1);
                continue;
            }
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.95;
        }

        for (let i = this._activeSpores.length - 1; i >= 0; i--) {
            const s = this._activeSpores[i];
            s.life -= dt;
            if (s.life <= 0) {
                s.active = false;
                this._sporePool.push(s);
                this._activeSpores.splice(i, 1);
                continue;
            }
            s.x += s.vx * dt;
            s.y += s.vy * dt;
        }
    }

    render(ctx) {
        // Render active spores
        for (const s of this._activeSpores) {
            const alpha = clamp(s.life / s.maxLife, 0, 1) * 0.6;
            withAlpha(ctx, alpha, () => {
                fillCircle(ctx, s.x, s.y, 2, '#c9a227');
            });
        }

        // Render particles
        for (const p of this._active) {
            const t = clamp(p.life / p.maxLife, 0, 1);
            const r = lerp(p.endRadius, p.radius, t);
            if (r <= 0) continue;
            withAlpha(ctx, t, () => {
                fillCircle(ctx, p.x, p.y, r, p.color);
            });
        }
    }
}
