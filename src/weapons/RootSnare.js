// Root Snare — places root traps that root and damage enemies on contact

class RootSnare extends WeaponBase {
    constructor(player, game) {
        super('rootSnare', player, game);
        this.name = WEAPON_DEFS.rootSnare.name;
        this.color = WEAPON_DEFS.rootSnare.color;
        this.glowColor = WEAPON_DEFS.rootSnare.glowColor;
        this.damage = 30;
        this.cooldown = 4.5;
        this.maxTraps = 2;
        this.rootDuration = 2.0;
        this.trapRadius = 22;
        this.traps = []; // [ {x, y, triggered, triggerTimer, pulsePhase} ]
    }

    fire() {
        // Remove oldest trap if at max
        if (this.traps.length >= this.maxTraps) {
            this.traps.shift();
        }

        // Place trap at player's current position
        this.traps.push({
            x: this.player.x,
            y: this.player.y,
            triggered: false,
            triggerTimer: 0,
            pulsePhase: Math.random() * Math.PI * 2,
            active: true
        });
        this.game.audio.play('trap');
    }

    update(dt) {
        // Update traps
        for (let i = this.traps.length - 1; i >= 0; i--) {
            const trap = this.traps[i];
            trap.pulsePhase += dt * 2;

            if (!trap.triggered) {
                // Check if any enemy steps in it
                for (const enemy of this.game.enemies) {
                    if (enemy.dead) continue;
                    if (circleOverlap(trap.x, trap.y, this.trapRadius, enemy.x, enemy.y, enemy.radius)) {
                        trap.triggered = true;
                        trap.triggerTimer = 0.4; // brief visual before disappearing
                        enemy.takeDamage(this.getEffectiveDamage(), trap.x, trap.y, this.game);
                        enemy.applyRoot(this.rootDuration * this.player.stats.rangeMult);
                        this.game.particles.burst(trap.x, trap.y, this.color, 10, 40);
                        this.game.audio.play('rootSnap');
                        break;
                    }
                }
            } else {
                trap.triggerTimer -= dt;
                if (trap.triggerTimer <= 0) {
                    this.traps.splice(i, 1);
                }
            }
        }

        // Fire timer
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire();
            this.timer = this.getEffectiveCooldown();
        }
    }

    render(ctx) {
        for (const trap of this.traps) {
            if (trap.triggered) {
                // Triggered flash
                withAlpha(ctx, clamp(trap.triggerTimer / 0.4, 0, 1), () => {
                    setGlow(ctx, '#80ff80', 20);
                    strokeCircle(ctx, trap.x, trap.y, this.trapRadius * 1.5, '#80ff80', 3);
                    clearGlow(ctx);
                });
                continue;
            }

            const pulse = Math.sin(trap.pulsePhase) * 0.15 + 1;
            const r = this.trapRadius * pulse;

            // Ground trap marking
            withAlpha(ctx, 0.5, () => {
                setGlow(ctx, this.glowColor, 8);
                strokeCircle(ctx, trap.x, trap.y, r, this.glowColor, 2);
                clearGlow(ctx);
            });

            // Cross pattern
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.6;
            const half = r * 0.6;
            drawLine(ctx, trap.x - half, trap.y, trap.x + half, trap.y, this.color, 1.5);
            drawLine(ctx, trap.x, trap.y - half, trap.x, trap.y + half, this.color, 1.5);
            ctx.globalAlpha = 1;

            // Root tendrils
            ctx.strokeStyle = '#2d5e3a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const a = trap.pulsePhase + (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(trap.x, trap.y);
                const tx = trap.x + Math.cos(a) * r * 0.9;
                const ty = trap.y + Math.sin(a) * r * 0.9;
                ctx.bezierCurveTo(
                    trap.x + Math.cos(a + 0.5) * r * 0.4, trap.y + Math.sin(a + 0.5) * r * 0.4,
                    tx - 4, ty - 4, tx, ty
                );
                ctx.stroke();
            }
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 10; break;
            case 3: this.maxTraps = 3; break;
            case 4: this.rootDuration += 1; break;
            case 5: this.damage += 12; break;
            case 6: this.maxTraps = 4; break;
            case 7: this.damage += 15; this.rootDuration += 0.5; break;
            case 8: this.maxTraps = 5; this.damage += 15; this.rootDuration += 1; break;
        }
    }
}
