// Pollen Burst — fires spread of piercing projectiles toward nearest enemy

class PollenBurst extends WeaponBase {
    constructor(player, game) {
        super('pollenBurst', player, game);
        this.name = WEAPON_DEFS.pollenBurst.name;
        this.color = WEAPON_DEFS.pollenBurst.color;
        this.glowColor = WEAPON_DEFS.pollenBurst.glowColor;
        this.damage = 10;
        this.cooldown = 1.2;
        this.projectileCount = 3;
        this.spreadAngle = 0.35; // radians between each projectile
        this.pierce = 1;
        this.projectileSpeed = 420;
        this.projectileLifetime = 1.6;
    }

    fire() {
        const target = this.nearestEnemy(this.player.x, this.player.y);
        if (!target) return;

        const baseAngle = angle(this.player.x, this.player.y, target.x, target.y);
        const half = (this.projectileCount - 1) / 2;

        for (let i = 0; i < this.projectileCount; i++) {
            const a = baseAngle + (i - half) * this.spreadAngle;
            const vx = Math.cos(a) * this.projectileSpeed;
            const vy = Math.sin(a) * this.projectileSpeed;
            this.spawnProjectile(
                this.player.x, this.player.y,
                vx, vy,
                this.getEffectiveDamage(),
                this.pierce,
                this.projectileLifetime,
                5, this.color, this.glowColor
            );
        }
        this.game.audio.play('shoot');
        this.game.particles.muzzle(this.player.x, this.player.y, baseAngle, this.color);
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 4; break;
            case 3: this.projectileCount++; break;
            case 4: this.damage += 4; this.pierce = 2; break;
            case 5: this.projectileCount++; break;
            case 6: this.damage += 5; break;
            case 7: this.projectileCount++; this.pierce = 3; break;
            case 8: this.cooldown *= 0.8; this.damage += 6; break;
        }
    }
}
