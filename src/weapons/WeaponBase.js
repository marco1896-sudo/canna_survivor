// Abstract weapon base class
// All weapons extend this and override fire() and optionally render()/onLevelUp()

class WeaponBase {
    constructor(id, player, game) {
        this.id = id;
        this.player = player;
        this.game = game;
        this.level = 1;
        this.timer = 0;         // countdown to next fire
        this.damage = 10;
        this.cooldown = 2;      // seconds between fires
        this.name = 'Weapon';
        this.color = '#ffffff';
        this.glowColor = '#ffffff';
    }

    // Called every frame during gameplay
    update(dt) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire();
            this.timer = this.getEffectiveCooldown();
        }
    }

    // Override in subclass
    fire() {}

    // Override for weapons with persistent visual elements (orbital, aura, etc.)
    render(ctx) {}

    // Called when this weapon gains a level
    levelUp() {
        if (this.level >= 8) return false;
        this.level++;
        this.onLevelUp();
        return true;
    }

    // Override to apply level-up stat changes
    onLevelUp() {}

    // Returns cooldown after player stat multipliers
    getEffectiveCooldown() {
        return Math.max(0.1, this.cooldown * this.player.stats.cooldownMult);
    }

    // Returns damage after player stat multipliers
    getEffectiveDamage() {
        return this.damage * this.player.stats.damageMult;
    }

    // Returns range after player stat multipliers
    getEffectiveRange(base) {
        return (base || 200) * this.player.stats.rangeMult;
    }

    // Find nearest enemy to a position, or null
    nearestEnemy(x, y) {
        let best = null;
        let bestDist = Infinity;
        for (const e of this.game.enemies) {
            if (e.dead) continue;
            const d = distanceSq(x, y, e.x, e.y);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }

    // Spawn a projectile into game.projectiles
    spawnProjectile(x, y, vx, vy, damage, pierce, lifetime, radius, color, glowColor) {
        const p = new Projectile();
        p.init(x, y, vx, vy, damage, pierce, lifetime, radius, color, glowColor, this.id);
        this.game.projectiles.push(p);
        return p;
    }
}
