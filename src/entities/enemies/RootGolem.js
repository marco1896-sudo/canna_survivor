// Root Golem — elite boss enemy, multi-phase

class RootGolem extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'rootGolem', game);
        const def = ENEMY_DEFS.rootGolem;
        this.phase = 1;
        this.phase2Threshold = def.phase2Threshold;

        this.slamTimer = 0;
        this.slamCooldown = 3.5;
        this.isSlamming = false;
        this.slamPhase = 0;
        this.slamTargetX = 0;
        this.slamTargetY = 0;

        this.summonTimer = 6.0;
        this.summonCooldown = 10.0;

        this.tentacleAngle = 0;

        // Boss-Ankündigung
        game.bossWarning = { name: 'WURZEL-GOLEM', timer: 3.0 };
    }

    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);
        this.tentacleAngle += dt * 1.2;

        // Phase transition
        if (this.phase === 1 && this.hp / this.maxHp <= this.phase2Threshold) {
            this._enterPhase2(game);
        }

        // Slam attack
        this.slamTimer -= dt;
        if (this.slamTimer <= 0 && !this.isSlamming) {
            this.isSlamming = true;
            this.slamPhase = 0;
            this.slamTimer = this.slamCooldown;
            this.slamTargetX = player.x;
            this.slamTargetY = player.y;
        }

        if (this.isSlamming) {
            this.slamPhase += dt * 3;
            if (this.slamPhase >= 1) {
                this.isSlamming = false;
                this._doSlam(game);
            }
        }

        // Summon minions
        this.summonTimer -= dt;
        if (this.summonTimer <= 0) {
            this.summonTimer = this.summonCooldown;
            this._summonMinions(game);
        }

        // Movement (slower in phase 2 but phase 2 does more AOE)
        if (!this.isSlamming && this.rootTimer <= 0) {
            const effectiveSpeed = this.speed * this.slowFactor;
            if (dist > 0) {
                this.x += (dx / dist) * effectiveSpeed * dt;
                this.y += (dy / dist) * effectiveSpeed * dt;
            }
        }
    }

    _enterPhase2(game) {
        this.phase = 2;
        this.speed *= 1.4;
        this.slamCooldown = 2.2;
        this.summonCooldown = 7.0;
        game.camera.shake(15, 0.8);
        game.particles.explosion(this.x, this.y, '#6aaa4a', 30, 100);
        game.bossWarning = { name: 'WURZEL-GOLEM — RASEND', timer: 2.5 };
    }

    _doSlam(game) {
        const player = game.player;
        const dist = distance(this.x, this.y, player.x, player.y);
        const slamRadius = 130 * (this.phase === 2 ? 1.4 : 1);

        if (dist < slamRadius) {
            player.takeDamage(this.damage * 1.5, this.x, this.y, game);
        }

        game.particles.explosion(this.slamTargetX, this.slamTargetY, '#6aaa4a', 25, slamRadius);
        game.camera.shake(12, 0.5);
        game.audio.play('slam');

        // Also damage enemies in slam radius (root golem doesn't care about his own minions)
        // Leave cracks on ground (visual field marker)
        game.hazardFields.push({
            x: this.slamTargetX,
            y: this.slamTargetY,
            radius: slamRadius,
            duration: 1.5,
            timer: 1.5,
            slowFactor: 0.6,
            tickDamage: 0,
            tickInterval: 1,
            tickTimer: 0,
            color: '#3a5a2a',
            glowColor: '#2a4a1a',
            isDecor: true // visual only
        });
    }

    _summonMinions(game) {
        const count = this.phase === 2 ? 4 : 2;
        for (let i = 0; i < count; i++) {
            const offset = randomOnCircleEdge(this.radius + 30);
            game.enemies.push(new SporeCrawler(this.x + offset.x, this.y + offset.y, game));
        }
        game.particles.burst(this.x, this.y, '#3ddc6e', 12, 60);
        game.audio.play('spawn');
    }

    _drawShape(ctx) {
        const r = this.radius;
        const phase2 = this.phase === 2;

        // Body base
        const bodyColor = phase2 ? '#4a2a1a' : this.color;
        const glowCol = phase2 ? '#aa4400' : this.glowColor;

        setGlow(ctx, glowCol, phase2 ? 20 : 12);
        drawPolygon(ctx, this.x, this.y, 8, r, this.tentacleAngle * 0.1, bodyColor, glowCol, 3);
        clearGlow(ctx);

        // Root tentacles
        ctx.strokeStyle = phase2 ? '#8a5a2a' : '#4a7a2a';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const a = this.tentacleAngle + (i / 6) * Math.PI * 2;
            const tentLen = r * 1.3;
            const cx1 = this.x + Math.cos(a + 0.4) * tentLen * 0.5;
            const cy1 = this.y + Math.sin(a + 0.4) * tentLen * 0.5;
            const ex = this.x + Math.cos(a) * tentLen;
            const ey = this.y + Math.sin(a) * tentLen;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(cx1, cy1, ex, ey);
            ctx.stroke();
        }

        // Eyes
        const eyeR = r * 0.2;
        const eyeGlow = phase2 ? '#ff4400' : '#88ff44';
        setGlow(ctx, eyeGlow, 8);
        fillCircle(ctx, this.x - r * 0.35, this.y - r * 0.15, eyeR, phase2 ? '#ff2200' : '#66ff22');
        fillCircle(ctx, this.x + r * 0.35, this.y - r * 0.15, eyeR, phase2 ? '#ff2200' : '#66ff22');
        clearGlow(ctx);

        // Slam telegraph
        if (this.isSlamming) {
            const slamR = 130 * (phase2 ? 1.4 : 1) * this.slamPhase;
            withAlpha(ctx, (1 - this.slamPhase) * 0.5, () => {
                setGlow(ctx, '#ff8800', 10);
                strokeCircle(ctx, this.slamTargetX, this.slamTargetY, slamR, '#ff8800', 3);
                clearGlow(ctx);
            });
        }
    }

    _drawHpBar(ctx) {
        // Boss HP bar is handled by HUD, not inline
    }
}
