// Trichome Whip — crystal arm(s) orbit the player and sweep enemies

class TrichomeWhip extends WeaponBase {
    constructor(player, game) {
        super('trichomeWhip', player, game);
        this.name = WEAPON_DEFS.trichomeWhip.name;
        this.color = WEAPON_DEFS.trichomeWhip.color;
        this.glowColor = WEAPON_DEFS.trichomeWhip.glowColor;
        this.damage = 18;
        this.cooldown = 0; // damage handled by overlap, not fire()
        this.armCount = 1;
        this.armLength = 55;
        this.armWidth = 7;
        this.orbitSpeed = 2.2; // radians per second
        this.orbitAngle = 0;
        this.hitCooldowns = new Map(); // enemy -> cooldown timer
        this.damageInterval = 0.5; // how often can it hit same enemy
    }

    update(dt) {
        this.orbitAngle += this.orbitSpeed * dt;
        this._checkHits();
    }

    fire() {} // orbital — no fire() needed

    _checkHits() {
        for (let i = 0; i < this.armCount; i++) {
            const armAngle = this.orbitAngle + (i / this.armCount) * Math.PI * 2;
            const tipX = this.player.x + Math.cos(armAngle) * this.armLength;
            const tipY = this.player.y + Math.sin(armAngle) * this.armLength;
            const midX = this.player.x + Math.cos(armAngle) * this.armLength * 0.5;
            const midY = this.player.y + Math.sin(armAngle) * this.armLength * 0.5;

            for (const enemy of this.game.enemies) {
                if (enemy.dead) continue;
                // Check against arm length (mid + tip)
                const hitTip = circleOverlap(tipX, tipY, this.armWidth, enemy.x, enemy.y, enemy.radius);
                const hitMid = circleOverlap(midX, midY, this.armWidth, enemy.x, enemy.y, enemy.radius);

                if (hitTip || hitMid) {
                    const cd = this.hitCooldowns.get(enemy) || 0;
                    if (cd <= 0) {
                        const dmg = enemy.takeDamage(this.getEffectiveDamage(), tipX, tipY, this.game);
                        if (dmg > 0) {
                            this.game.particles.hit(tipX, tipY, this.color, 5);
                            this.game.audio.play('whip');
                        }
                        this.hitCooldowns.set(enemy, this.damageInterval);
                    }
                }
            }
        }

        // Tick down all hit cooldowns
        for (const [enemy, cd] of this.hitCooldowns) {
            if (enemy.dead) { this.hitCooldowns.delete(enemy); continue; }
            this.hitCooldowns.set(enemy, cd - 1/60);
            if (cd - 1/60 <= 0) this.hitCooldowns.delete(enemy);
        }
    }

    render(ctx) {
        for (let i = 0; i < this.armCount; i++) {
            const armAngle = this.orbitAngle + (i / this.armCount) * Math.PI * 2;
            const tipX = this.player.x + Math.cos(armAngle) * this.armLength;
            const tipY = this.player.y + Math.sin(armAngle) * this.armLength;

            // Glowing arm line
            setGlow(ctx, this.glowColor, 10);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.armWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.player.x, this.player.y);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            clearGlow(ctx);

            // Crystal tip
            setGlow(ctx, this.glowColor, 15);
            drawPolygon(ctx, tipX, tipY, 4, this.armWidth + 2, armAngle, this.color, this.glowColor, 1);
            clearGlow(ctx);
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 6; break;
            case 3: this.armCount = 2; break;
            case 4: this.armLength += 12; this.damage += 5; break;
            case 5: this.armCount = 3; break;
            case 6: this.orbitSpeed += 0.5; break;
            case 7: this.armCount = 4; break;
            case 8: this.damage += 10; this.orbitSpeed += 0.4; break;
        }
    }
}
