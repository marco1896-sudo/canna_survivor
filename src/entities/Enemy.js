// Enemy base class
// Depends on: math.js, draw.js, data/enemies.js

class Enemy {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.game = game;

        const def = ENEMY_DEFS[type];
        const minutes = game.time / 60;

        // Scale stats by elapsed time
        this.maxHp = Math.round(def.hp * (1 + minutes * DIFFICULTY_SCALE.hpFactor));
        this.hp = this.maxHp;
        this.speed = def.speed * (1 + minutes * DIFFICULTY_SCALE.speedFactor);
        this.damage = def.damage * (1 + minutes * DIFFICULTY_SCALE.damageFactor);
        this.radius = def.radius;
        this.xpValue = def.xpValue;
        this.color = def.color;
        this.glowColor = def.glowColor;
        this.deathColor = def.deathColor || def.color;
        this.isBoss = def.isBoss || false;

        this.dead = false;
        this.iframes = 0;       // invincibility after a hit (brief flicker)
        this.knockX = 0;        // knockback velocity
        this.knockY = 0;
        this.slowFactor = 1;    // 1 = normal, <1 = slowed
        this.slowTimer = 0;
        this.rootTimer = 0;     // > 0 = rooted (can't move)

        // Visual state
        this.flashTimer = 0;    // red flash on hit
        this.angle = 0;         // facing angle
        this.animTimer = 0;
    }

    takeDamage(amount, sourceX, sourceY, game) {
        if (this.iframes > 0) return 0;

        this.hp -= amount;
        this.flashTimer = 0.1;
        this.iframes = 0.06; // brief iframes to prevent multi-hit same frame

        // Floating damage text
        if (game) {
            game.addFloatingText(this.x, this.y - this.radius, Math.round(amount));
        }

        // Knockback from source direction
        if (sourceX !== undefined && sourceY !== undefined) {
            const nx = normalize(this.x - sourceX, this.y - sourceY);
            const knockPower = 80;
            this.knockX += nx.x * knockPower;
            this.knockY += nx.y * knockPower;
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }

        return amount;
    }

    applySlow(factor, duration) {
        this.slowFactor = Math.min(this.slowFactor, factor);
        this.slowTimer = Math.max(this.slowTimer, duration);
    }

    applyRoot(duration) {
        this.rootTimer = Math.max(this.rootTimer, duration);
    }

    update(dt, game) {
        this.iframes = Math.max(0, this.iframes - dt);
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.animTimer += dt;

        // Slow timer
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) {
                this.slowFactor = 1;
            }
        }

        // Root timer
        if (this.rootTimer > 0) {
            this.rootTimer -= dt;
        }

        // Apply knockback decay
        if (this.knockX !== 0 || this.knockY !== 0) {
            const decay = Math.exp(-12 * dt);
            this.knockX *= decay;
            this.knockY *= decay;
            if (Math.abs(this.knockX) < 0.5) this.knockX = 0;
            if (Math.abs(this.knockY) < 0.5) this.knockY = 0;
        }

        // AI movement (overridden by subclasses, but default = move toward player)
        if (!this.dead && this.rootTimer <= 0) {
            this.updateAI(dt, game);
        }

        // Apply knockback position
        this.x += this.knockX * dt;
        this.y += this.knockY * dt;
    }

    // Default AI: move straight toward player
    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const effectiveSpeed = this.speed * this.slowFactor;
            this.x += (dx / dist) * effectiveSpeed * dt;
            this.y += (dy / dist) * effectiveSpeed * dt;
            this.angle = Math.atan2(dy, dx);
        }
    }

    render(ctx) {
        if (this.flashTimer > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
        }

        this._drawShape(ctx);

        if (this.flashTimer > 0) {
            ctx.restore();
            // Red flash overlay
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.flashTimer * 10);
            this._drawShapeFlash(ctx);
            ctx.restore();
        }

        // HP bar (only show when damaged)
        if (this.hp < this.maxHp && !this.dead) {
            this._drawHpBar(ctx);
        }

        // Root effect
        if (this.rootTimer > 0) {
            setGlow(ctx, '#4a7c59', 8);
            strokeCircle(ctx, this.x, this.y, this.radius + 4, '#4a7c59', 2);
            clearGlow(ctx);
        }
    }

    _drawShape(ctx) {
        // Base: filled circle with glow
        setGlow(ctx, this.glowColor, 8);
        fillCircle(ctx, this.x, this.y, this.radius, this.color);
        clearGlow(ctx);
        strokeCircle(ctx, this.x, this.y, this.radius, this.glowColor, 1.5);
    }

    _drawShapeFlash(ctx) {
        fillCircle(ctx, this.x, this.y, this.radius, '#ff4444');
    }

    _drawHpBar(ctx) {
        const bw = this.radius * 2.5;
        const bh = 3;
        const bx = this.x - bw / 2;
        const by = this.y - this.radius - 8;
        drawBar(ctx, bx, by, bw, bh, this.hp, this.maxHp, '#e05252', '#1a0808', 'transparent');
    }

    // Find nearest enemy in an array (excludes self)
    static findNearest(x, y, enemies, excludeSelf) {
        let best = null;
        let bestDist = Infinity;
        for (const e of enemies) {
            if (e === excludeSelf || e.dead) continue;
            const d = distanceSq(x, y, e.x, e.y);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }
}
