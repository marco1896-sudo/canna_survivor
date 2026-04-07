// THC Laser — charges up then fires a piercing beam through all enemies

class THCLaser extends WeaponBase {
    constructor(player, game) {
        super('thcLaser', player, game);
        this.name = WEAPON_DEFS.thcLaser.name;
        this.color = WEAPON_DEFS.thcLaser.color;
        this.glowColor = WEAPON_DEFS.thcLaser.glowColor;
        this.damage = 55;
        this.cooldown = 5.0;        // charge time
        this.beamDuration = 1.5;
        this.beamWidth = 12;
        this.isCharging = false;
        this.isFiring = false;
        this.chargeTimer = 0;
        this.beamTimer = 0;
        this.beamAngle = 0;
        this.chargeGlow = 0;
        this.hitEnemiesThisBeam = new Set();
        this.damageTickTimer = 0;
        this.damageTickInterval = 0.08;
        this.timer = this.cooldown; // start with full charge needed
    }

    update(dt) {
        this.damageTickTimer -= dt;

        if (this.isFiring) {
            this.beamTimer -= dt;

            // Damage tick while beam is active
            if (this.damageTickTimer <= 0) {
                this.damageTickTimer = this.damageTickInterval;
                this._beamDamageTick();
            }

            if (this.beamTimer <= 0) {
                this.isFiring = false;
                this.hitEnemiesThisBeam.clear();
                this.chargeGlow = 0;
            }
            return;
        }

        // Normal charge countdown
        this.timer -= dt;
        this.chargeGlow = clamp(1 - this.timer / this.getEffectiveCooldown(), 0, 1);

        if (this.isCharging && this.timer <= 0) {
            this._fireLaser();
        }

        // Start charge animation when close to firing
        if (this.timer <= 0.6 && !this.isCharging) {
            this.isCharging = true;
            this.game.audio.play('charge');
        }

        if (this.timer <= 0 && !this.isFiring) {
            this._fireLaser();
        }
    }

    _fireLaser() {
        const target = this.nearestEnemy(this.player.x, this.player.y);
        this.beamAngle = target
            ? angle(this.player.x, this.player.y, target.x, target.y)
            : this.player.lastMoveAngle || 0;

        this.isFiring = true;
        this.isCharging = false;
        this.beamTimer = this.beamDuration;
        this.hitEnemiesThisBeam.clear();
        this.timer = this.getEffectiveCooldown();
        this.game.camera.shake(5, 0.3);
        this.game.audio.play('laser');
    }

    _beamDamageTick() {
        const beamLen = 900 * this.player.stats.rangeMult;
        const bx = this.player.x;
        const by = this.player.y;
        const ex = bx + Math.cos(this.beamAngle) * beamLen;
        const ey = by + Math.sin(this.beamAngle) * beamLen;

        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            // Point-to-segment distance check
            const dist = pointToSegmentDistance(enemy.x, enemy.y, bx, by, ex, ey);
            if (dist < this.beamWidth * 0.5 + enemy.radius) {
                const dmg = this.getEffectiveDamage() * this.damageTickInterval;
                enemy.takeDamage(dmg, bx, by, this.game);
                this.game.particles.hit(enemy.x, enemy.y, this.color, 3);
            }
        }
    }

    fire() {} // handled entirely in update()

    render(ctx) {
        // Charge indicator ring
        if (this.isCharging || this.chargeGlow > 0.3) {
            withAlpha(ctx, this.chargeGlow, () => {
                setGlow(ctx, this.color, 20);
                strokeCircle(ctx, this.player.x, this.player.y, 20 + this.chargeGlow * 10, this.color, 2);
                clearGlow(ctx);
            });
        }

        if (!this.isFiring) return;

        const beamLen = 900 * this.player.stats.rangeMult;
        const alpha = clamp(this.beamTimer / this.beamDuration, 0, 1);
        const ex = this.player.x + Math.cos(this.beamAngle) * beamLen;
        const ey = this.player.y + Math.sin(this.beamAngle) * beamLen;

        // Core beam
        withAlpha(ctx, alpha, () => {
            setGlow(ctx, this.glowColor, 25);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.beamWidth;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            clearGlow(ctx);

            // White core
            ctx.strokeStyle = '#fff8f8';
            ctx.lineWidth = this.beamWidth * 0.3;
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        });
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 20; break;
            case 3: this.beamWidth += 4; break;
            case 4: this.damage += 20; this.cooldown -= 0.4; break;
            case 5: this.beamWidth += 4; break;
            case 6: this.damage += 25; break;
            case 7: this.cooldown -= 0.5; break;
            case 8: this.damage += 30; this.cooldown = Math.max(2.5, this.cooldown - 0.5); break;
        }
    }
}

// Helper: distance from point (px,py) to line segment (ax,ay)-(bx,by)
function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return distance(px, py, ax, ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = clamp(t, 0, 1);
    return distance(px, py, ax + t * dx, ay + t * dy);
}
