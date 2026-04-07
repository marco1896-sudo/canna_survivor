// XP Orb — dropped by enemies on death
// Depends on: math.js, draw.js

class XPOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.active = true;
        this.radius = 5 + Math.min(value * 0.5, 6); // bigger orbs for more XP
        this.angle = Math.random() * Math.PI * 2;
        this.animOffset = Math.random() * Math.PI * 2; // stagger bob animation
        this.magnetSpeed = 0;
        this.isMagneting = false;

        // Slight scatter velocity on spawn
        const scatter = randomOnCircleEdge(randomRange(20, 60));
        this.vx = scatter.x;
        this.vy = scatter.y;
        this.friction = 0.85;
    }

    update(dt, player) {
        this.animOffset += dt * 3;

        // Scatter decay
        if (!this.isMagneting) {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        // Magnet check: pull toward player when in range
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < player.stats.pickupRadius) {
            this.isMagneting = true;
        }

        if (this.isMagneting) {
            // Accelerate toward player
            this.magnetSpeed += 600 * dt;
            const speed = Math.min(this.magnetSpeed, 800);
            if (dist > 0) {
                this.x += (dx / dist) * speed * dt;
                this.y += (dy / dist) * speed * dt;
            }

            // Collect on contact
            if (dist < player.radius + this.radius + 2) {
                player.gainXP(this.value);
                this.active = false;
                return;
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        const bob = Math.sin(this.animOffset) * 2;

        // Glow aura
        withAlpha(ctx, 0.35, () => {
            setGlow(ctx, '#c9a227', 20);
            fillCircle(ctx, this.x, this.y + bob, this.radius + 4, '#8a6b10');
            clearGlow(ctx);
        });

        // Core
        setGlow(ctx, '#c9a227', 10);
        fillCircle(ctx, this.x, this.y + bob, this.radius, '#e8c040');
        clearGlow(ctx);

        // Inner bright dot
        fillCircle(ctx, this.x, this.y + bob, this.radius * 0.4, '#fff8e0');
    }
}
