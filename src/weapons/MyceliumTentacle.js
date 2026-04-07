// Mycelium Tentacle — chain lightning-style vine between enemies

class MyceliumTentacle extends WeaponBase {
    constructor(player, game) {
        super('myceliumTentacle', player, game);
        this.name = WEAPON_DEFS.myceliumTentacle.name;
        this.color = WEAPON_DEFS.myceliumTentacle.color;
        this.glowColor = WEAPON_DEFS.myceliumTentacle.glowColor;
        this.damage = 20;
        this.cooldown = 1.8;
        this.chainCount = 2;        // max enemies to chain through
        this.chainRange = 180;      // max distance for each chain hop
        this.activeChains = [];     // [ {x1,y1,x2,y2,timer} ] for rendering
    }

    fire() {
        const first = this.nearestEnemy(this.player.x, this.player.y);
        if (!first) return;

        const hit = [first];
        first.takeDamage(this.getEffectiveDamage(), this.player.x, this.player.y, this.game);
        this.game.particles.hit(first.x, first.y, this.color, 6);

        // Build chain
        let prevX = first.x;
        let prevY = first.y;
        let prev = first;

        this.activeChains = [{
            x1: this.player.x, y1: this.player.y,
            x2: first.x, y2: first.y,
            timer: 0.35
        }];

        for (let i = 1; i < this.chainCount; i++) {
            // Find nearest unhit enemy in chain range
            let nextBest = null;
            let nextDist = this.chainRange * this.player.stats.rangeMult;

            for (const e of this.game.enemies) {
                if (e.dead || hit.includes(e)) continue;
                const d = distance(prevX, prevY, e.x, e.y);
                if (d < nextDist) { nextDist = d; nextBest = e; }
            }

            if (!nextBest) break;
            hit.push(nextBest);

            // Damage decreases with each chain
            const falloffDmg = this.getEffectiveDamage() * Math.pow(0.7, i);
            nextBest.takeDamage(falloffDmg, prevX, prevY, this.game);
            this.game.particles.hit(nextBest.x, nextBest.y, this.color, 4);

            this.activeChains.push({
                x1: prevX, y1: prevY,
                x2: nextBest.x, y2: nextBest.y,
                timer: 0.35
            });

            prevX = nextBest.x;
            prevY = nextBest.y;
            prev = nextBest;
        }

        this.game.audio.play('chain');
    }

    update(dt) {
        // Decay active chain visuals
        for (let i = this.activeChains.length - 1; i >= 0; i--) {
            this.activeChains[i].timer -= dt;
            if (this.activeChains[i].timer <= 0) {
                this.activeChains.splice(i, 1);
            }
        }

        // Normal fire timer
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire();
            this.timer = this.getEffectiveCooldown();
        }
    }

    render(ctx) {
        for (const chain of this.activeChains) {
            const alpha = clamp(chain.timer / 0.35, 0, 1);
            withAlpha(ctx, alpha, () => {
                // Vine-like jagged line
                setGlow(ctx, this.glowColor, 8);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(chain.x1, chain.y1);

                // Add a few jag points for vine look
                const steps = 4;
                for (let s = 1; s < steps; s++) {
                    const t = s / steps;
                    const mx = lerp(chain.x1, chain.x2, t) + randomRange(-8, 8);
                    const my = lerp(chain.y1, chain.y2, t) + randomRange(-8, 8);
                    ctx.lineTo(mx, my);
                }
                ctx.lineTo(chain.x2, chain.y2);
                ctx.stroke();
                clearGlow(ctx);
            });
        }
    }

    onLevelUp() {
        switch (this.level) {
            case 2: this.damage += 7; break;
            case 3: this.chainCount = 3; break;
            case 4: this.damage += 7; this.cooldown *= 0.85; break;
            case 5: this.chainCount = 4; break;
            case 6: this.damage += 8; break;
            case 7: this.cooldown *= 0.8; this.damage += 8; break;
            case 8: this.chainCount = 6; this.damage += 12; break;
        }
    }
}
