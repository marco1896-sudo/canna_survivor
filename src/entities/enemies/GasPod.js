// Gas Pod — stationary hazard that explodes when player gets close

class GasPod extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'gasPod', game);
        const def = ENEMY_DEFS.gasPod;
        this.triggerRadius = def.triggerRadius;
        this.explosionRadius = def.explosionRadius;
        this.explosionDamage = def.explosionDamage;
        this.triggered = false;
        this.explosionTimer = 0;
        this.explodeDelay = 0.8; // warning before explosion
        this.exploded = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.poisonField = null;
    }

    updateAI(dt, game) {
        this.pulsePhase += dt * 2;

        if (this.triggered) {
            this.explosionTimer -= dt;
            if (this.explosionTimer <= 0 && !this.exploded) {
                this._explode(game);
            }
        } else {
            // Check if player is close enough to trigger
            const player = game.player;
            const dist = distance(this.x, this.y, player.x, player.y);
            if (dist < this.triggerRadius) {
                this.triggered = true;
                this.explosionTimer = this.explodeDelay;
                game.audio.play('warning');
            }
        }
    }

    _explode(game) {
        this.exploded = true;
        this.dead = true;

        // Deal AOE damage
        const player = game.player;
        const dist = distance(this.x, this.y, player.x, player.y);
        if (dist < this.explosionRadius) {
            const dmg = this.explosionDamage * (1 - dist / this.explosionRadius * 0.5);
            player.takeDamage(Math.round(dmg), this.x, this.y, game);
        }

        // Leave a poison slow field
        game.hazardFields.push({
            x: this.x,
            y: this.y,
            radius: this.explosionRadius * 0.7,
            duration: 4.0,
            timer: 4.0,
            slowFactor: 0.45,
            tickDamage: 3,
            tickInterval: 0.5,
            tickTimer: 0,
            color: '#8bc34a',
            glowColor: '#7cb342'
        });

        game.particles.explosion(this.x, this.y, '#8bc34a', 20, this.explosionRadius);
        game.camera.shake(8, 0.4);
        game.audio.play('explosion');
    }

    _drawShape(ctx) {
        const r = this.radius;
        const pulse = Math.sin(this.pulsePhase) * 0.15 + 1;
        const drawR = r * pulse;

        if (this.triggered) {
            // Flash red during countdown
            const flashRate = Math.sin(this.pulsePhase * 8);
            const warningColor = flashRate > 0 ? '#ff4400' : this.color;
            setGlow(ctx, '#ff4400', 20 * (flashRate > 0 ? 1 : 0.2));
            fillCircle(ctx, this.x, this.y, drawR, warningColor);
            clearGlow(ctx);
        } else {
            // Normal green pulsing pod
            setGlow(ctx, this.glowColor, 8);
            fillCircle(ctx, this.x, this.y, drawR, this.color);
            clearGlow(ctx);
        }

        // Veins on the pod
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(a) * drawR * 0.8, this.y + Math.sin(a) * drawR * 0.8);
            ctx.stroke();
        }

        // Center core
        fillCircle(ctx, this.x, this.y, drawR * 0.3, this.triggered ? '#ff6600' : '#aee060');
    }
}
