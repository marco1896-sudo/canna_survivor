// Terpene Spray — short-range cone burst, high DPS, slows enemies

class TerpeneSpray extends WeaponBase {
    constructor(player, game) {
        super('terpeneSpray', player, game);
        this.name = WEAPON_DEFS.terpeneSpray.name;
        this.color = WEAPON_DEFS.terpeneSpray.color;
        this.glowColor = WEAPON_DEFS.terpeneSpray.glowColor;
        this.damage = 22;
        this.cooldown = 0.8;
        this.coneRange = 110;
        this.coneHalfAngle = 0.5; // radians
        this.slowFactor = 0.5;
        this.slowDuration = 1.5;
        this.sprayAngle = 0;
        this.sprayTimer = 0;
    }

    fire() {
        const target = this.nearestEnemy(this.player.x, this.player.y);
        if (!target) return;

        this.sprayAngle = angle(this.player.x, this.player.y, target.x, target.y);
        this.sprayTimer = 0.12;

        const range = this.getEffectiveRange(this.coneRange);

        let hit = false;
        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > range + enemy.radius) continue;

            // Angle check
            const enemyAngle = Math.atan2(dy, dx);
            const angleDiff = Math.abs(((enemyAngle - this.sprayAngle) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
            if (angleDiff < this.coneHalfAngle + Math.atan(enemy.radius / Math.max(dist, 1))) {
                enemy.takeDamage(this.getEffectiveDamage(), this.player.x, this.player.y, this.game);
                enemy.applySlow(this.slowFactor, this.slowDuration);
                this.game.particles.spray(this.player.x, this.player.y, this.sprayAngle, this.color);
                hit = true;
            }
        }

        if (hit) this.game.audio.play('spray');
    }

    update(dt) {
        this.sprayTimer = Math.max(0, this.sprayTimer - dt);
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire();
            this.timer = this.getEffectiveCooldown();
        }
    }

    render(ctx) {
        if (this.sprayTimer <= 0) return;

        const range = this.getEffectiveRange(this.coneRange);
        const alpha = this.sprayTimer / 0.12;

        withAlpha(ctx, alpha * 0.35, () => {
            setGlow(ctx, this.glowColor, 15);
            drawCone(ctx, this.player.x, this.player.y, this.sprayAngle,
                this.coneHalfAngle, range, this.color);
            clearGlow(ctx);
        });
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 8; break;
            case 3: this.coneHalfAngle += 0.12; break;
            case 4: this.damage += 8; this.slowDuration += 0.5; break;
            case 5: this.coneRange += 25; break;
            case 6: this.damage += 10; break;
            case 7: this.coneHalfAngle += 0.1; this.coneRange += 20; break;
            case 8: this.damage += 15; this.cooldown = Math.max(0.5, this.cooldown - 0.12); break;
        }
    }
}
