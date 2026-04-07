// HUD — Mobile Portrait-optimiert, minimalistisch, Deutsch

class HUD {
    constructor(game) {
        this.game = game;
        this.bossBarAlpha = 0;
        this._lastLevel = 1;
        this._levelFlashTimer = 0;
        this._weaponScrollOffset = 0;
    }

    render(ctx) {
        const game = this.game;
        const player = game.player;
        if (!player) return;

        const W = CANVAS_W; // 450
        const H = CANVAS_H; // 800

        // ── Oben: Spielzeit + Level ───────────────────────────────────────
        this._renderTopBar(ctx, player, W, H);

        // ── Linke Seite: HP ───────────────────────────────────────────────
        this._renderHPBar(ctx, player, W, H);

        // ── Rechte Seite: Waffen ──────────────────────────────────────────
        this._renderWeaponList(ctx, player, W, H);

        // ── Unten: XP-Leiste ──────────────────────────────────────────────
        this._renderXPBar(ctx, player, W, H);

        // ── Boss-Leiste (Mitte oben) ──────────────────────────────────────
        this._renderBossBar(ctx, W, H);

        // ── Boss-Warnung ──────────────────────────────────────────────────
        this._renderBossWarning(ctx, W, H);

        // ── Level-Up Flash ────────────────────────────────────────────────
        if (player.level !== this._lastLevel) {
            this._levelFlashTimer = 1.2;
            this._lastLevel = player.level;
        }
        if (this._levelFlashTimer > 0) {
            this._levelFlashTimer -= 1 / 60;
            withAlpha(ctx, Math.sin(this._levelFlashTimer * Math.PI) * 0.7, () => {
                setGlow(ctx, '#c9a227', 25);
                fillTextBold(ctx, 'STUFE ' + player.level, W / 2, H / 2 - 80, '#c9a227', 22, 'center', 'middle');
                clearGlow(ctx);
            });
        }
    }

    _renderTopBar(ctx, player, W, H) {
        const pad = 14;
        const barH = 42;

        // Hintergrund-Panel
        withAlpha(ctx, 0.75, () => {
            const grad = ctx.createLinearGradient(0, 0, 0, barH);
            grad.addColorStop(0, '#0a140a');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, barH);
        });

        // Spielzeit (Mitte)
        const elapsed = Math.floor(player ? this.game.time : 0);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timerStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        setGlow(ctx, '#3ddc6e', 10);
        fillTextBold(ctx, timerStr, W / 2, 13, '#3ddc6e', 18, 'center', 'top');
        clearGlow(ctx);

        // Kills (rechts)
        fillText(ctx, this.game.kills + ' Kills', W - pad, 8, '#4a6a4a', 10, 'right', 'top');

        // FPS (links, dezent)
        withAlpha(ctx, 0.2, () => {
            fillText(ctx, this.game.loop.fps + ' fps', pad, 8, '#4a6a4a', 9, 'left', 'top', true);
        });
    }

    _renderHPBar(ctx, player, W, H) {
        const barW = 8;
        const barH = 140;
        const x = 14;
        const y = (H - barH) / 2 - 20; // vertikale Mitte, leicht nach oben

        const pct = clamp(player.hp / player.maxHp, 0, 1);
        const isLow = pct < 0.3;
        const barColor = isLow ? '#e05252' : '#3ddc6e';
        const glowColor = isLow ? '#e05252' : '#3ddc6e';

        // Hintergrund
        fillRoundRect(ctx, x, y, barW, barH, barW / 2, '#0a1a0a');

        // Füllung (von unten nach oben)
        const fillH = barH * pct;
        const fillY = y + barH - fillH;
        setGlow(ctx, glowColor, isLow ? 15 : 8);
        fillRoundRect(ctx, x, fillY, barW, fillH, barW / 2, barColor);
        clearGlow(ctx);

        // Pulsieren bei niedrigem HP
        if (isLow) {
            const pulse = Math.sin(Date.now() / 250) * 0.25 + 0.25;
            withAlpha(ctx, pulse, () => {
                fillRoundRect(ctx, x - 3, fillY - 3, barW + 6, fillH + 6, barW / 2 + 3, '#e05252');
            });
        }

        // HP-Zahl
        ctx.save();
        ctx.translate(x + barW / 2, y - 6);
        fillTextBold(ctx, Math.ceil(player.hp), 0, 0, barColor, 10, 'center', 'bottom');
        ctx.restore();

        // Herz-Symbol
        fillText(ctx, '♥', x + barW / 2, y + barH + 4, barColor, 10, 'center', 'top');
    }

    _renderWeaponList(ctx, player, W, H) {
        const iconSize = 30;
        const gap = 8;
        const x = W - 14 - iconSize;
        const totalH = player.weapons.length * (iconSize + gap) - gap;
        let y = (H - totalH) / 2 - 20;

        for (const w of player.weapons) {
            const def = WEAPON_DEFS[w.id] || EVOLVED_WEAPON_DEFS[w.id];
            if (!def) continue;

            // Hintergrund
            withAlpha(ctx, 0.75, () => {
                fillRoundRect(ctx, x, y, iconSize, iconSize, 6, '#0a1a0a');
            });
            setGlow(ctx, def.color, w.level >= 8 ? 12 : 5);
            strokeRoundRect(ctx, x, y, iconSize, iconSize, 6, def.color, 1.5);
            clearGlow(ctx);

            // Farbpunkt
            fillCircle(ctx, x + iconSize / 2, y + iconSize / 2 - 4, 6, def.color);

            // Level-Balken (unten im Icon)
            const barW = iconSize - 8;
            drawBarRounded(ctx, x + 4, y + iconSize - 8, barW, 4, w.level, 8, def.color, '#111', 2);

            y += iconSize + gap;
        }
    }

    _renderXPBar(ctx, player, W, H) {
        const barH = 6;
        const y = H - barH - 4;
        const pct = clamp(player.xp / player.xpThreshold, 0, 1);

        // Hintergrund
        fillRoundRect(ctx, 0, y, W, barH, 3, '#0a1a0a');

        // XP-Füllung
        if (pct > 0) {
            setGlow(ctx, '#c9a227', 8);
            fillRoundRect(ctx, 0, y, Math.max(6, W * pct), barH, 3, '#c9a227');
            clearGlow(ctx);
        }

        // Level-Label links
        fillTextBold(ctx, 'LV ' + player.level, 10, y - 14, '#c9a227', 9, 'left', 'top');

        // XP-Text rechts
        withAlpha(ctx, 0.5, () => {
            fillText(ctx, Math.floor(player.xp) + '/' + player.xpThreshold + ' XP', W - 10, y - 14, '#c9a227', 8, 'right', 'top', true);
        });
    }

    _renderBossBar(ctx, W, H) {
        const boss = this.game.enemies.find(e => e.isBoss && !e.dead);
        if (boss) this.bossBarAlpha = Math.min(1, this.bossBarAlpha + 0.05);
        else this.bossBarAlpha = Math.max(0, this.bossBarAlpha - 0.04);
        if (this.bossBarAlpha <= 0.01) return;

        withAlpha(ctx, this.bossBarAlpha, () => {
            const bw = W - 80;
            const bh = 10;
            const bx = (W - bw) / 2;
            const by = 50;

            // Boss-Name
            setGlow(ctx, '#e05252', 8);
            fillTextBold(ctx, 'WURZEL-GOLEM', W / 2, by - 2, '#e05252', 9, 'center', 'bottom');
            clearGlow(ctx);

            // Boss-HP
            fillRoundRect(ctx, bx, by, bw, bh, 5, '#1a0808');
            if (boss) {
                const pct = clamp(boss.hp / boss.maxHp, 0, 1);
                setGlow(ctx, '#e05252', 10);
                fillRoundRect(ctx, bx, by, Math.max(10, bw * pct), bh, 5, '#e05252');
                clearGlow(ctx);

                if (boss.phase === 2) {
                    withAlpha(ctx, 0.8, () => {
                        fillText(ctx, '⚠ RASEND', W / 2, by + bh + 2, '#ff4400', 8, 'center', 'top');
                    });
                }
            }
        });
    }

    _renderBossWarning(ctx, W, H) {
        const bw = this.game.bossWarning;
        if (!bw) return;

        bw.timer -= 1 / 60;
        if (bw.timer <= 0) { this.game.bossWarning = null; return; }

        const alpha = Math.min(1, bw.timer);
        const pulse = Math.sin(Date.now() / 120) * 0.5 + 0.5;

        // Roter Rand
        withAlpha(ctx, alpha * 0.3 * pulse, () => {
            ctx.strokeStyle = '#e05252';
            ctx.lineWidth = 8;
            ctx.strokeRect(0, 0, W, H);
        });

        // Warnung-Text
        withAlpha(ctx, alpha, () => {
            setGlow(ctx, '#e05252', 20);
            fillTextBold(ctx, '⚠ BEDROHUNG ERKANNT', W / 2, H / 2 - 100, '#e05252', 14, 'center', 'middle');
            fillTextBold(ctx, bw.name, W / 2, H / 2 - 75, '#ff6666', 11, 'center', 'middle');
            clearGlow(ctx);
        });
    }
}
