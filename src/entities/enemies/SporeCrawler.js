// Spore Crawler — fast swarm enemy, rushes the player directly

class SporeCrawler extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'sporeCrawler', game);
        this.legAngle = 0;
        this.legCount = 6;
    }

    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const effectiveSpeed = this.speed * this.slowFactor;
            this.x += (dx / dist) * effectiveSpeed * dt;
            this.y += (dy / dist) * effectiveSpeed * dt;
            this.angle = Math.atan2(dy, dx);
        }
        this.legAngle += dt * 8;
    }

    _drawShape(ctx) {
        const r = this.radius;

        // Body
        setGlow(ctx, this.glowColor, 6);
        fillCircle(ctx, this.x, this.y, r, this.color);
        clearGlow(ctx);

        // Spiky legs
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < this.legCount; i++) {
            const a = this.legAngle + (i / this.legCount) * Math.PI * 2;
            const innerR = r;
            const outerR = r + 5 + Math.sin(this.legAngle * 2 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(a) * innerR, this.y + Math.sin(a) * innerR);
            ctx.lineTo(this.x + Math.cos(a) * outerR, this.y + Math.sin(a) * outerR);
            ctx.stroke();
        }

        // Eyes
        const eyeOffset = r * 0.35;
        const eyeAngle = this.angle;
        const perpA = eyeAngle + Math.PI * 0.4;
        const perpB = eyeAngle - Math.PI * 0.4;
        fillCircle(ctx, this.x + Math.cos(perpA) * eyeOffset, this.y + Math.sin(perpA) * eyeOffset, 2, '#fff');
        fillCircle(ctx, this.x + Math.cos(perpB) * eyeOffset, this.y + Math.sin(perpB) * eyeOffset, 2, '#fff');
    }
}
