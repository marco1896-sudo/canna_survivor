// Petal Shooter — keeps distance, fires projectiles at player

class PetalShooter extends Enemy {
    constructor(x, y, game) {
        super(x, y, 'petalShooter', game);
        const def = ENEMY_DEFS.petalShooter;
        this.projectileDamage = def.projectileDamage;
        this.projectileSpeed = def.projectileSpeed;
        this.fireTimer = randomRange(0, def.fireRate);
        this.fireRate = def.fireRate;
        this.preferredDist = 200;
        this.petalAngle = 0;
        this.petalCount = 5;
    }

    updateAI(dt, game) {
        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);
        this.petalAngle += dt * 1.5;

        // Maintain preferred distance — move away if too close, toward if too far
        if (dist > 0) {
            const effectiveSpeed = this.speed * this.slowFactor;
            let moveDir = 1;
            if (dist < this.preferredDist - 30) moveDir = -1;  // too close, back off
            else if (dist > this.preferredDist + 60) moveDir = 1; // too far, approach
            else moveDir = 0; // in zone, strafe slightly

            if (moveDir !== 0) {
                this.x += (dx / dist) * effectiveSpeed * moveDir * dt;
                this.y += (dy / dist) * effectiveSpeed * moveDir * dt;
            } else {
                // Strafe perpendicular
                this.x += (-dy / dist) * effectiveSpeed * 0.6 * dt;
                this.y += (dx / dist) * effectiveSpeed * 0.6 * dt;
            }
        }

        // Fire timer
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            this._shootAtPlayer(game, dx, dy, dist);
        }
    }

    _shootAtPlayer(game, dx, dy, dist) {
        if (dist <= 0) return;
        const speed = this.projectileSpeed;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        const p = new Projectile();
        p.init(
            this.x, this.y,
            vx, vy,
            this.projectileDamage,
            1, 3.5, 5,
            '#e8a0b0', '#cc5577',
            'enemyProjectile'
        );
        p.isEnemyProjectile = true;
        game.enemyProjectiles.push(p);
        game.audio.play('enemyShoot');
    }

    _drawShape(ctx) {
        const r = this.radius;

        // Body
        setGlow(ctx, this.glowColor, 8);
        fillCircle(ctx, this.x, this.y, r, this.color);
        clearGlow(ctx);

        // Rotating petals
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.petalAngle);
        for (let i = 0; i < this.petalCount; i++) {
            const a = (i / this.petalCount) * Math.PI * 2;
            const px = Math.cos(a) * (r + 5);
            const py = Math.sin(a) * (r + 5);
            ctx.fillStyle = '#f0b8c8';
            ctx.beginPath();
            ctx.ellipse(px, py, 4, 7, a, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Core eye
        fillCircle(ctx, this.x, this.y, r * 0.35, '#ff2255');
    }
}
