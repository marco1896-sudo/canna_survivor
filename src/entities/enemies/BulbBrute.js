// Bulb Brute — slow tank, high HP, knocks player back hard

class BulbBrute extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'bulbBrute', game);
        this.chargeTimer = 0;
        this.isCharging = false;
        this.chargeVX = 0;
        this.chargeVY = 0;
        this.chargeCooldown = 4.0;
    }

    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        // Charge attack when close enough
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0 && dist < 280 && !this.isCharging) {
            this.isCharging = true;
            this.chargeTimer = this.chargeCooldown;
            if (dist > 0) {
                this.chargeVX = (dx / dist) * this.speed * 3;
                this.chargeVY = (dy / dist) * this.speed * 3;
            }
        }

        if (this.isCharging) {
            const decay = Math.exp(-6 * dt);
            this.chargeVX *= decay;
            this.chargeVY *= decay;
            this.x += this.chargeVX * dt;
            this.y += this.chargeVY * dt;
            if (Math.abs(this.chargeVX) < 5 && Math.abs(this.chargeVY) < 5) {
                this.isCharging = false;
            }
        } else {
            const effectiveSpeed = this.speed * this.slowFactor;
            if (dist > 0) {
                this.x += (dx / dist) * effectiveSpeed * dt;
                this.y += (dy / dist) * effectiveSpeed * dt;
            }
        }
    }

    _drawShape(ctx) {
        const r = this.radius;

        // Main body — heavy hexagon shape
        setGlow(ctx, this.glowColor, 12);
        drawPolygon(ctx, this.x, this.y, 6, r, this.animTimer * 0.2, this.color, this.glowColor, 2);
        clearGlow(ctx);

        // Bulb highlight
        withAlpha(ctx, 0.4, () => {
            fillCircle(ctx, this.x - r * 0.25, this.y - r * 0.25, r * 0.4, '#4a9a4a');
        });

        // Angry eyes
        const eyeR = r * 0.18;
        fillCircle(ctx, this.x - r * 0.3, this.y - r * 0.2, eyeR, '#ff4444');
        fillCircle(ctx, this.x + r * 0.3, this.y - r * 0.2, eyeR, '#ff4444');

        // Charge glow
        if (this.isCharging) {
            setGlow(ctx, '#ff6600', 20);
            strokeCircle(ctx, this.x, this.y, r + 3, '#ff8800', 3);
            clearGlow(ctx);
        }
    }
}
