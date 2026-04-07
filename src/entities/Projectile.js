// Projectile entity — used by multiple weapons
// Depends on: math.js, draw.js

class Projectile {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 0;
        this.pierce = 1;        // how many enemies it can hit before dying
        this.lifetime = 2;
        this.radius = 5;
        this.color = '#c9e84a';
        this.glowColor = '#8fbc00';
        this.glowSize = 8;
        this.active = false;
        this.weaponId = '';
        this.hitEnemies = [];   // tracks who was already hit (for pierce)
        this.slowAmount = 0;    // if > 0, applies slow on hit
        this.slowDuration = 0;
        this.owner = null;      // ref to weapon for damage calc
    }

    init(x, y, vx, vy, damage, pierce, lifetime, radius, color, glowColor, weaponId) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.pierce = pierce || 1;
        this.lifetime = lifetime || 2;
        this.radius = radius || 5;
        this.color = color || '#c9e84a';
        this.glowColor = glowColor || '#8fbc00';
        this.glowSize = 8;
        this.active = true;
        this.weaponId = weaponId || '';
        this.hitEnemies = [];
        this.slowAmount = 0;
        this.slowDuration = 0;
    }

    update(dt, game) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }

        // Enemy projectiles don't hit other enemies
        if (this.isEnemyProjectile) return;

        // Check collisions with enemies
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            if (this.hitEnemies.includes(enemy)) continue;

            if (circleOverlap(this.x, this.y, this.radius, enemy.x, enemy.y, enemy.radius)) {
                const dmg = enemy.takeDamage(this.damage, this.x, this.y, game);
                if (dmg > 0) {
                    game.particles.hit(this.x, this.y, this.color, 4);
                    game.audio.play('hit');
                }

                if (this.slowAmount > 0) {
                    enemy.applySlow(this.slowAmount, this.slowDuration);
                }

                this.hitEnemies.push(enemy);
                this.pierce--;

                if (this.pierce <= 0) {
                    this.active = false;
                    return;
                }
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        const alpha = Math.min(1, this.lifetime * 3);
        withAlpha(ctx, alpha, () => {
            setGlow(ctx, this.glowColor, this.glowSize);
            fillCircle(ctx, this.x, this.y, this.radius, this.color);
            clearGlow(ctx);
        });
    }
}
