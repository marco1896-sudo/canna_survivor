// Spore Cloud — persistent AOE aura that ticks damage around the player

class SporeCloud extends WeaponBase {
    constructor(player, game) {
        super('sporeCloud', player, game);
        this.name = WEAPON_DEFS.sporeCloud.name;
        this.color = WEAPON_DEFS.sporeCloud.color;
        this.glowColor = WEAPON_DEFS.sporeCloud.glowColor;
        this.damage = 6;
        this.cooldown = 0.5;    // tick interval
        this.auraRadius = 70;
        this.timer = 0;
        this.pulseTimer = 0;
        this.hitEnemiesThisTick = new Set();
    }

    update(dt) {
        this.timer -= dt;
        this.pulseTimer = Math.max(0, this.pulseTimer - dt);
        if (this.timer <= 0) {
            this.timer = this.getEffectiveCooldown();
            this._tick();
        }
    }

    _tick() {
        const range = this.getEffectiveRange(this.auraRadius);
        let hit = false;
        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < range + enemy.radius) {
                enemy.takeDamage(this.getEffectiveDamage(), this.player.x, this.player.y, this.game);
                hit = true;
            }
        }
        if (hit) {
            this.pulseTimer = 0.12;
            this.game.audio.play('aura');
        }
    }

    fire() {} // damage handled in update()

    render(ctx) {
        const range = this.getEffectiveRange(this.auraRadius);
        const pulse = this.pulseTimer > 0 ? 1.08 : 1.0;

        // Outer aura ring
        withAlpha(ctx, 0.15, () => {
            setGlow(ctx, this.glowColor, 20);
            fillCircle(ctx, this.player.x, this.player.y, range * pulse, this.color);
            clearGlow(ctx);
        });

        // Ring border
        withAlpha(ctx, 0.5 + (this.pulseTimer > 0 ? 0.3 : 0), () => {
            setGlow(ctx, this.glowColor, 10);
            strokeCircle(ctx, this.player.x, this.player.y, range * pulse, this.glowColor, 1.5);
            clearGlow(ctx);
        });

        // Floating spore particles (cosmetic, persistent)
        if (Math.random() < 0.15) {
            const pos = randomOnCircleEdge(range * Math.random());
            this.game.particles.addSpore(this.player.x + pos.x, this.player.y + pos.y);
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.auraRadius += 18; break;
            case 3: this.damage += 3; break;
            case 4: this.auraRadius += 18; break;
            case 5: this.cooldown = 0.35; break;
            case 6: this.damage += 4; this.auraRadius += 15; break;
            case 7: this.cooldown = 0.25; break;
            case 8: this.auraRadius += 25; this.damage += 5; break;
        }
    }
}
