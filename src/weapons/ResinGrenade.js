// Resin Grenade — lobs AOE grenades that leave slowing fields

class ResinGrenade extends WeaponBase {
    constructor(player, game) {
        super('resinGrenade', player, game);
        this.name = WEAPON_DEFS.resinGrenade.name;
        this.color = WEAPON_DEFS.resinGrenade.color;
        this.glowColor = WEAPON_DEFS.resinGrenade.glowColor;
        this.damage = 35;
        this.cooldown = 2.8;
        this.explosionRadius = 80;
        this.fieldDuration = 3.0;
        this.fieldSlowFactor = 0.45;
        this.grenadesPerVolley = 1;
    }

    fire() {
        for (let i = 0; i < this.grenadesPerVolley; i++) {
            const offset = i > 0 ? randomOnCircleEdge(30) : { x: 0, y: 0 };
            this._throwGrenade(offset.x, offset.y);
        }
    }

    _throwGrenade(offsetX, offsetY) {
        const target = this.nearestEnemy(this.player.x, this.player.y);
        const targetX = target
            ? target.x + offsetX + randomRange(-20, 20)
            : this.player.x + offsetX + randomRange(-100, 100);
        const targetY = target
            ? target.y + offsetY + randomRange(-20, 20)
            : this.player.y + offsetY + randomRange(-100, 100);

        // Lob projectile (arc simulated with lifetime + landing)
        const lobDist = distance(this.player.x, this.player.y, targetX, targetY);
        const lobTime = Math.max(0.4, lobDist / 380);
        const vx = (targetX - this.player.x) / lobTime;
        const vy = (targetY - this.player.y) / lobTime;

        const grenade = {
            x: this.player.x,
            y: this.player.y,
            vx, vy,
            lifetime: lobTime,
            maxLifetime: lobTime,
            explodeX: targetX,
            explodeY: targetY,
            damage: this.getEffectiveDamage(),
            explosionRadius: this.getEffectiveRange(this.explosionRadius),
            fieldDuration: this.fieldDuration,
            fieldSlowFactor: this.fieldSlowFactor,
            active: true,
            isGrenade: true,
            color: this.color,
            glowColor: this.glowColor
        };

        this.game.grenades = this.game.grenades || [];
        this.game.grenades.push(grenade);
        this.game.audio.play('throw');
    }

    static updateGrenades(grenades, game) {
        if (!grenades) return;
        for (let i = grenades.length - 1; i >= 0; i--) {
            const g = grenades[i];
            g.lifetime -= 1/60;
            g.x += g.vx / 60;
            g.y += g.vy / 60;

            if (g.lifetime <= 0 && g.active) {
                g.active = false;
                ResinGrenade._explode(g, game);
                grenades.splice(i, 1);
            }
        }
    }

    static _explode(g, game) {
        // AOE damage
        for (const e of game.enemies) {
            if (e.dead) continue;
            const dist = distance(g.explodeX, g.explodeY, e.x, e.y);
            if (dist < g.explosionRadius) {
                const falloff = 1 - dist / g.explosionRadius * 0.4;
                e.takeDamage(g.damage * falloff, g.explodeX, g.explodeY, game);
                e.applySlow(g.fieldSlowFactor, 2.0);
            }
        }

        // Leave slow field
        game.hazardFields.push({
            x: g.explodeX,
            y: g.explodeY,
            radius: g.explosionRadius * 0.75,
            duration: g.fieldDuration,
            timer: g.fieldDuration,
            slowFactor: g.fieldSlowFactor,
            tickDamage: 2,
            tickInterval: 0.5,
            tickTimer: 0,
            color: g.color,
            glowColor: g.glowColor
        });

        game.particles.explosion(g.explodeX, g.explodeY, g.color, 16, g.explosionRadius * 0.5);
        game.camera.shake(7, 0.3);
        game.audio.play('explosion');
    }

    static renderGrenades(grenades, ctx) {
        if (!grenades) return;
        for (const g of grenades) {
            if (!g.active) continue;
            const t = 1 - g.lifetime / g.maxLifetime;
            // Arc — parabolic Y offset for visual lob
            const arcY = -Math.sin(t * Math.PI) * 40;
            setGlow(ctx, g.glowColor, 12);
            fillCircle(ctx, g.x, g.y + arcY, 8, g.color);
            clearGlow(ctx);
            // Shadow on ground
            withAlpha(ctx, 0.3, () => {
                fillCircle(ctx, g.x, g.y, 4, '#000');
            });
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.explosionRadius += 15; break;
            case 3: this.damage += 12; break;
            case 4: this.fieldDuration += 1; break;
            case 5: this.explosionRadius += 15; this.damage += 10; break;
            case 6: this.grenadesPerVolley = 2; break;
            case 7: this.damage += 15; this.fieldSlowFactor = 0.3; break;
            case 8: this.explosionRadius += 25; this.fieldDuration = 6; break;
        }
    }
}
