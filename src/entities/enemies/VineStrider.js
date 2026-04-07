// Vine Strider — fast flanker that curves around the player

class VineStrider extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'vineStrider', game);
        this.orbitDir = Math.random() < 0.5 ? 1 : -1; // clockwise or counter
        this.orbitPhase = Math.random() * Math.PI * 2;
        this.orbitBlend = 0.4; // how much it curves vs rushes
    }

    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 0) return;

        const effectiveSpeed = this.speed * this.slowFactor;

        // Direct-toward vector
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Perpendicular (flanking) vector
        const perpX = -dirY * this.orbitDir;
        const perpY = dirX * this.orbitDir;

        // Closer = more direct, farther = more orbital
        const blend = dist < 120 ? 0.9 : this.orbitBlend;

        const moveX = lerp(perpX, dirX, blend);
        const moveY = lerp(perpY, dirY, blend);
        const len = Math.sqrt(moveX * moveX + moveY * moveY);

        this.x += (moveX / len) * effectiveSpeed * dt;
        this.y += (moveY / len) * effectiveSpeed * dt;
        this.angle = Math.atan2(dy, dx);
        this.orbitPhase += dt * 3;
    }

    _drawShape(ctx) {
        const r = this.radius;

        // Elongated body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        setGlow(ctx, this.glowColor, 8);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.5, r * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        clearGlow(ctx);

        // Vine stripe
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r * 1.4, 0);
        ctx.bezierCurveTo(-r * 0.5, -r * 0.5, r * 0.5, r * 0.5, r * 1.4, 0);
        ctx.stroke();

        ctx.restore();

        // Eye
        const eyeX = this.x + Math.cos(this.angle) * r * 0.7;
        const eyeY = this.y + Math.sin(this.angle) * r * 0.7;
        fillCircle(ctx, eyeX, eyeY, 3, '#fff');
        fillCircle(ctx, eyeX + Math.cos(this.angle) * 1, eyeY + Math.sin(this.angle) * 1, 1.5, '#000');
    }
}
