// CBD Shield Pulse — periodic shockwave, knocks back and damages enemies

class CBDShieldPulse extends WeaponBase {
    constructor(player, game) {
        super('cbdPulse', player, game);
        this.name = WEAPON_DEFS.cbdPulse.name;
        this.color = WEAPON_DEFS.cbdPulse.color;
        this.glowColor = WEAPON_DEFS.cbdPulse.glowColor;
        this.damage = 15;
        this.cooldown = 3.0;
        this.pulseRadius = 100;
        this.knockbackPower = 350;
        this.activeRings = []; // [ { radius, maxRadius, timer, maxTimer } ]
    }

    fire() {
        const range = this.getEffectiveRange(this.pulseRadius);

        // Damage and knockback all enemies in radius
        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < range + enemy.radius) {
                const falloff = Math.max(0.3, 1 - dist / range * 0.6);
                enemy.takeDamage(this.getEffectiveDamage() * falloff, this.player.x, this.player.y, this.game);

                // Knockback away from player
                const kn = normalize(enemy.x - this.player.x, enemy.y - this.player.y);
                enemy.knockX += kn.x * this.knockbackPower;
                enemy.knockY += kn.y * this.knockbackPower;
            }
        }

        // Add visual ring
        this.activeRings.push({ radius: 10, maxRadius: range, timer: 0.5, maxTimer: 0.5 });
        this.game.camera.shake(4, 0.2);
        this.game.audio.play('pulse');
    }

    update(dt) {
        // Update visual rings
        for (let i = this.activeRings.length - 1; i >= 0; i--) {
            const ring = this.activeRings[i];
            ring.timer -= dt;
            ring.radius = lerp(ring.maxRadius, 10, ring.timer / ring.maxTimer);
            if (ring.timer <= 0) this.activeRings.splice(i, 1);
        }

        // Fire timer
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire();
            this.timer = this.getEffectiveCooldown();
        }
    }

    render(ctx) {
        // Constant dim shield aura
        withAlpha(ctx, 0.08, () => {
            fillCircle(ctx, this.player.x, this.player.y,
                this.getEffectiveRange(this.pulseRadius), this.color);
        });

        // Active rings
        for (const ring of this.activeRings) {
            const alpha = ring.timer / ring.maxTimer;
            withAlpha(ctx, alpha * 0.8, () => {
                setGlow(ctx, this.glowColor, 15);
                strokeCircle(ctx, this.player.x, this.player.y, ring.radius, this.color, 3);
                clearGlow(ctx);
            });
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.pulseRadius += 20; break;
            case 3: this.damage += 8; break;
            case 4: this.cooldown -= 0.5; break;
            case 5: this.knockbackPower += 80; break;
            case 6: this.damage += 10; break;
            case 7: this.cooldown -= 0.5; break;
            case 8: this.pulseRadius += 30; this.damage += 12; this.cooldown = Math.max(1.5, this.cooldown - 0.3); break;
        }
    }
}
