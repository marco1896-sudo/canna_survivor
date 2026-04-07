// Myco Spawner — slow mover, periodically spawns Spore Crawlers

class MycoSpawner extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'mycoSpawner', game);
        const def = ENEMY_DEFS.mycoSpawner;
        this.spawnTimer = def.spawnRate;
        this.spawnRate = def.spawnRate;
        this.maxSpawns = def.maxSpawns;
        this.spawnCount = 0;
        this.pulseTimer = 0;
        this.isPulsing = false;
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

        this.spawnTimer -= dt;
        if (this.pulseTimer > 0) {
            this.pulseTimer -= dt;
            if (this.pulseTimer <= 0) this.isPulsing = false;
        }

        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnRate;
            this._spawnCrawlers(game);
        }
    }

    _spawnCrawlers(game) {
        const count = Math.min(2 + Math.floor(game.time / 300), 4);
        for (let i = 0; i < count; i++) {
            const offset = randomOnCircleEdge(this.radius + 20);
            const crawler = new SporeCrawler(this.x + offset.x, this.y + offset.y, game);
            game.enemies.push(crawler);
        }
        this.isPulsing = true;
        this.pulseTimer = 0.4;
        game.particles.burst(this.x, this.y, '#6dbf67', 10, 50);
        game.audio.play('spawn');
    }

    _drawShape(ctx) {
        const r = this.radius;

        // Mushroom cap
        setGlow(ctx, this.glowColor, 10);
        fillCircle(ctx, this.x, this.y, r, this.color);
        clearGlow(ctx);

        // Spots on cap
        ctx.fillStyle = '#d4a850';
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + this.animTimer * 0.2;
            fillCircle(ctx, this.x + Math.cos(a) * r * 0.5, this.y + Math.sin(a) * r * 0.5, 3, '#e8c060');
        }

        // Stem
        ctx.fillStyle = '#7a5830';
        ctx.fillRect(this.x - 5, this.y + r - 2, 10, 10);

        // Pulse ring when spawning
        if (this.isPulsing) {
            const pct = 1 - this.pulseTimer / 0.4;
            withAlpha(ctx, 1 - pct, () => {
                setGlow(ctx, '#6dbf67', 15);
                strokeCircle(ctx, this.x, this.y, r + pct * 40, '#6dbf67', 3);
                clearGlow(ctx);
            });
        }
    }
}
