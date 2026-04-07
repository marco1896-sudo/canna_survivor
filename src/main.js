// main.js — Mobile-First 9:16 Game Engine

// 9:16 Portrait canvas
const CANVAS_W = 450;
const CANVAS_H = 800;

const COLORS = {
    BG:         '#080f08',
    BG_DARK:    '#040a04',
    GREEN:      '#3ddc6e',
    GREEN_MID:  '#1f6b3a',
    GREEN_DIM:  '#0f3318',
    AMBER:      '#c9a227',
    RED:        '#e05252',
    WHITE:      '#e8f0e9',
    GRAY:       '#4a5a4b'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_W;
        this.canvas.height = CANVAS_H;

        this._setupScaling();
        window.addEventListener('resize', () => this._setupScaling());
        window.addEventListener('orientationchange', () => setTimeout(() => this._setupScaling(), 200));

        // Core Systems — InputManager braucht Canvas für Touch
        this.input = new InputManager(this.canvas);
        this.camera = new Camera(CANVAS_W, CANVAS_H);
        this.particles = new ParticleSystem();
        this.audio = new AudioSystem();

        // Spielzustand
        this.state = 'title'; // title | charSelect | playing | levelUp | gameOver | win | meta
        this.time = 0;
        this.kills = 0;
        this._lastResinEarned = 0;

        // Entities
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.xpOrbs = [];
        this.floatingTexts = [];
        this.hazardFields = [];
        this.grenades = [];
        this.bossWarning = null;

        // Screen-Effekte
        this._screenFlash = { alpha: 0, color: '#ffffff' };
        this._damageFlash = { alpha: 0 };

        // Systeme
        this.spawnSystem = new SpawnSystem(this);
        this.upgradeSystem = new UpgradeSystem(this);

        // UI
        this.hud = new HUD(this);
        this.titleScreen = new TitleScreen(this);
        this.levelUpScreen = new LevelUpScreen(this);
        this.gameOverScreen = new GameOverScreen(this);
        this.researchLab = new ResearchLab(this);

        // Meta-Persistence
        this.resin = parseInt(localStorage.getItem('cs_resin') || '0');
        this.unlocks = JSON.parse(localStorage.getItem('cs_unlocks') || '{}');
        this.bestStats = JSON.parse(localStorage.getItem('cs_bestStats') || '{}');

        // Game Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            (dt) => this.render(dt)
        );
        this.loop.start();
    }

    _setupScaling() {
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Fit 9:16 in available space
        const scaleX = winW / CANVAS_W;
        const scaleY = winH / CANVAS_H;
        const scale = Math.min(scaleX, scaleY);

        this.canvas.style.width  = Math.floor(CANVAS_W * scale) + 'px';
        this.canvas.style.height = Math.floor(CANVAS_H * scale) + 'px';
        this._scale = scale;
    }

    triggerFlash(color, alpha) {
        this._screenFlash.color = color || '#ffffff';
        this._screenFlash.alpha = alpha || 0.5;
    }

    triggerDamageFlash() {
        this._damageFlash.alpha = 0.35;
    }

    startRun(characterId) {
        this.time = 0;
        this.kills = 0;
        this._lastResinEarned = 0;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.xpOrbs = [];
        this.floatingTexts = [];
        this.hazardFields = [];
        this.grenades = [];
        this.bossWarning = null;
        this._screenFlash.alpha = 0;
        this._damageFlash.alpha = 0;
        this.particles.clear();

        this.player = new Player(this, characterId);
        this.spawnSystem.reset();
        this.camera.x = this.player.x - CANVAS_W / 2;
        this.camera.y = this.player.y - CANVAS_H / 2;

        // Einblende-Flash bei Spielstart
        this.triggerFlash('#3ddc6e', 0.4);
        this.setState('playing');
    }

    setState(newState) {
        this.state = newState;
        if (newState === 'levelUp') {
            this.upgradeSystem.generateChoices();
            this.levelUpScreen.show();
        }
        if (newState === 'gameOver' || newState === 'win') {
            this._saveRun();
            this.gameOverScreen.alpha = 0;
            this.gameOverScreen.animTimer = 0;
        }
    }

    _saveRun() {
        const resinEarned = Math.floor(this.kills * 0.6 + this.time * 1.5);
        this.resin += resinEarned;
        this._lastResinEarned = resinEarned;
        const b = this.bestStats;
        if (!b.time  || this.time > b.time)   b.time = this.time;
        if (!b.kills || this.kills > b.kills)  b.kills = this.kills;
        if (!b.level || (this.player && this.player.level > b.level)) b.level = this.player ? this.player.level : 0;
        localStorage.setItem('cs_resin', this.resin.toString());
        localStorage.setItem('cs_bestStats', JSON.stringify(b));
    }

    addFloatingText(x, y, text, color, size) {
        if (this.floatingTexts.length > 40) return;
        this.floatingTexts.push({
            x: x + randomRange(-6, 6), y,
            text: String(text),
            color: color || '#ffcc44',
            size: size || 12,
            life: 0.8, maxLife: 0.8
        });
    }

    // ======================== UPDATE ========================

    update(dt) {
        switch (this.state) {
            case 'title':      this.titleScreen.update(dt); break;
            case 'charSelect': this.titleScreen.updateCharSelect(dt); break;
            case 'playing':    this._updatePlaying(dt); break;
            case 'levelUp':    this.levelUpScreen.update(dt); break;
            case 'gameOver':   this.gameOverScreen.update(dt); break;
            case 'win':        this.gameOverScreen.update(dt); break;
            case 'meta':       this.researchLab.update(dt); break;
        }

        // Screen-Flash abklingen
        this._screenFlash.alpha  = Math.max(0, this._screenFlash.alpha  - dt * 4);
        this._damageFlash.alpha  = Math.max(0, this._damageFlash.alpha  - dt * 6);

        this.input.update();
    }

    _updatePlaying(dt) {
        this.time += dt;

        // Sieg nach 30 Minuten
        if (this.time >= 1800) {
            this.triggerFlash('#c9a227', 0.6);
            this.setState('win');
            return;
        }

        // Spieler
        this.player.update(dt);
        if (this.player.dead) {
            this.triggerDamageFlash();
            this.setState('gameOver');
            return;
        }

        // Kamera
        this.camera.update(dt, this.player.x, this.player.y);

        // Spawner
        this.spawnSystem.update(dt);

        // Gegner
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(dt, this);
            if (e.dead) {
                this._onEnemyDeath(e);
                this.enemies.splice(i, 1);
            }
        }

        // Spieler-Projektile
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, this);
            if (!p.active) this.projectiles.splice(i, 1);
        }

        // Gegner-Projektile
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            p.update(dt, this);
            if (p.active && circleOverlap(p.x, p.y, p.radius, this.player.x, this.player.y, this.player.radius)) {
                this.player.takeDamage(p.damage, p.x, p.y, this);
                p.active = false;
                this.particles.hit(p.x, p.y, '#e05252', 4);
            }
            if (!p.active) this.enemyProjectiles.splice(i, 1);
        }

        // XP-Orbs
        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            this.xpOrbs[i].update(dt, this.player);
            if (!this.xpOrbs[i].active) this.xpOrbs.splice(i, 1);
        }

        // Gefahrenfelder
        for (let i = this.hazardFields.length - 1; i >= 0; i--) {
            const f = this.hazardFields[i];
            f.timer -= dt;
            if (f.timer <= 0) { this.hazardFields.splice(i, 1); continue; }
            if (f.isDecor) continue;
            f.tickTimer -= dt;
            const tickNow = f.tickTimer <= 0;
            if (tickNow) f.tickTimer = f.tickInterval;
            for (const e of this.enemies) {
                if (e.dead) continue;
                if (circleOverlap(f.x, f.y, f.radius, e.x, e.y, e.radius)) {
                    e.applySlow(f.slowFactor, 0.3);
                    if (tickNow && f.tickDamage > 0) e.takeDamage(f.tickDamage * this.player.stats.damageMult, f.x, f.y, this);
                }
            }
        }

        // Partikel
        this.particles.update(dt);

        // Schwebende Texte
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y -= 32 * dt;
            t.life -= dt;
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Spieler ↔ Gegner Kontaktschaden
        if (this.player.iframes <= 0) {
            for (const e of this.enemies) {
                if (e.dead || e instanceof GasPod) continue;
                if (circleOverlap(this.player.x, this.player.y, this.player.radius, e.x, e.y, e.radius)) {
                    this.player.takeDamage(e.damage, e.x, e.y, this);
                    if (this.player.dead) { this.setState('gameOver'); return; }
                    break;
                }
            }
        }
    }

    _onEnemyDeath(enemy) {
        this.kills++;
        const orbCount = Math.min(Math.ceil(enemy.xpValue / 2), 5);
        const xpPer = enemy.xpValue / orbCount;
        for (let i = 0; i < orbCount; i++) {
            this.xpOrbs.push(new XPOrb(
                enemy.x + randomRange(-15, 15),
                enemy.y + randomRange(-15, 15),
                xpPer
            ));
        }
        this.particles.burst(enemy.x, enemy.y, enemy.deathColor || '#3ddc6e',
            enemy.isBoss ? 25 : 7, enemy.isBoss ? 100 : 40);
        if (enemy.isBoss) {
            this.camera.shake(14, 0.7);
            this.triggerFlash('#c9a227', 0.3);
            this.audio.play('explosion');
        }
    }

    // ======================== RENDER ========================

    render(dt) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        switch (this.state) {
            case 'title':
            case 'charSelect':
                this.titleScreen.render(ctx);
                break;

            case 'playing':
            case 'levelUp':
                this._renderPlaying(ctx);
                if (this.state === 'levelUp') this.levelUpScreen.render(ctx);
                break;

            case 'gameOver':
            case 'win':
                this._renderPlaying(ctx);
                this.gameOverScreen.render(ctx, this.state === 'win');
                break;

            case 'meta':
                this.researchLab.render(ctx);
                break;
        }

        // Screen-Effekte (immer oben drauf)
        if (this._damageFlash.alpha > 0) {
            drawScreenFlash(ctx, CANVAS_W, CANVAS_H, '#e05252', this._damageFlash.alpha);
        }
        if (this._screenFlash.alpha > 0) {
            drawScreenFlash(ctx, CANVAS_W, CANVAS_H, this._screenFlash.color, this._screenFlash.alpha * 0.5);
        }

        // Vignette immer
        drawVignette(ctx, CANVAS_W, CANVAS_H, 0.45);

        // Scanlines immer
        drawScanlines(ctx, CANVAS_W, CANVAS_H, 0.035);
    }

    _renderPlaying(ctx) {
        // Hintergrund
        this._renderBackground(ctx);

        // Welt-Raum
        this.camera.apply(ctx);

        // Gefahrenfelder
        for (const f of this.hazardFields) {
            const alpha = clamp(f.timer / f.duration, 0, 1);
            withAlpha(ctx, alpha * 0.2, () => {
                setGlow(ctx, f.glowColor, 12);
                fillCircle(ctx, f.x, f.y, f.radius, f.color);
                clearGlow(ctx);
            });
            withAlpha(ctx, alpha * 0.45, () => {
                strokeCircle(ctx, f.x, f.y, f.radius, f.glowColor, 1.5);
            });
        }

        // XP-Orbs
        for (const orb of this.xpOrbs) orb.render(ctx);

        // Gegner
        for (const e of this.enemies) {
            if (this.camera.isVisible(e.x, e.y, e.radius + 20)) e.render(ctx);
        }

        // Spieler (inkl. Waffen-Renders)
        if (this.player) this.player.render(ctx);

        // Projektile
        for (const p of this.projectiles) { if (p.active) p.render(ctx); }
        for (const p of this.enemyProjectiles) { if (p.active) p.render(ctx); }

        // Partikel
        this.particles.render(ctx);

        this.camera.unapply(ctx);

        // Schwebende Texte (Bildschirmraum)
        for (const t of this.floatingTexts) {
            const s = this.camera.worldToScreen(t.x, t.y);
            if (s.x < -30 || s.x > CANVAS_W + 30) continue;
            const alpha = clamp(t.life / t.maxLife, 0, 1);
            withAlpha(ctx, alpha, () => {
                setGlow(ctx, t.color, 5);
                fillTextBold(ctx, t.text, s.x, s.y, t.color, t.size, 'center', 'middle');
                clearGlow(ctx);
            });
        }

        // HUD
        if (this.player) this.hud.render(ctx);

        // Touch-Joystick
        this._renderJoystick(ctx);
    }

    _renderBackground(ctx) {
        fillRect(ctx, 0, 0, CANVAS_W, CANVAS_H, COLORS.BG_DARK);

        const tileSize = 48;
        const bigTile  = 192;
        const ox = ((this.camera.x % tileSize) + tileSize) % tileSize;
        const oy = ((this.camera.y % tileSize) + tileSize) % tileSize;
        const bx = ((this.camera.x % bigTile) + bigTile) % bigTile;
        const by = ((this.camera.y % bigTile) + bigTile) % bigTile;

        // Feines Gitter
        ctx.beginPath();
        ctx.strokeStyle = '#0e1a0e';
        ctx.lineWidth = 0.5;
        for (let x = -ox; x < CANVAS_W + tileSize; x += tileSize) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); }
        for (let y = -oy; y < CANVAS_H + tileSize; y += tileSize) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); }
        ctx.stroke();

        // Großes Gewächshaus-Strukturgitter
        ctx.beginPath();
        ctx.strokeStyle = '#142014';
        ctx.lineWidth = 1.5;
        for (let x = -bx; x < CANVAS_W + bigTile; x += bigTile) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); }
        for (let y = -by; y < CANVAS_H + bigTile; y += bigTile) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); }
        ctx.stroke();

        // Eckpunkte
        ctx.fillStyle = '#0f1f0f';
        for (let x = -bx; x < CANVAS_W + bigTile; x += bigTile) {
            for (let y = -by; y < CANVAS_H + bigTile; y += bigTile) {
                ctx.fillRect(x - 4, y - 4, 8, 8);
            }
        }
    }

    // ---- Joystick-Render ----
    _renderJoystick(ctx) {
        const j = this.input.getJoystickState();
        if (!j.active) return;

        const outerR = j.radius;
        const innerR = 22;

        // Äußerer Ring
        withAlpha(ctx, 0.25, () => {
            setGlow(ctx, '#3ddc6e', 10);
            strokeCircle(ctx, j.originX, j.originY, outerR, '#3ddc6e', 2);
            clearGlow(ctx);
        });

        // Kreuzlinien
        withAlpha(ctx, 0.12, () => {
            drawLine(ctx, j.originX - outerR, j.originY, j.originX + outerR, j.originY, '#3ddc6e', 1);
            drawLine(ctx, j.originX, j.originY - outerR, j.originX, j.originY + outerR, '#3ddc6e', 1);
        });

        // Innerer Knob — begrenzt auf äußeren Radius
        const clampDist = Math.min(j.magnitude * outerR, outerR);
        const knobX = j.dx !== 0 || j.dy !== 0
            ? j.originX + j.dx * clampDist
            : j.originX;
        const knobY = j.dx !== 0 || j.dy !== 0
            ? j.originY + j.dy * clampDist
            : j.originY;

        withAlpha(ctx, 0.7, () => {
            setGlow(ctx, '#3ddc6e', 15);
            fillCircle(ctx, knobX, knobY, innerR, '#1a4a2a');
            strokeCircle(ctx, knobX, knobY, innerR, '#3ddc6e', 2.5);
            clearGlow(ctx);
        });
    }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
    // Prevent context menu on long press (mobile)
    document.addEventListener('contextmenu', e => e.preventDefault());
    window.game = new Game();
});
