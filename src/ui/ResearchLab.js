// ResearchLab — Mobile Portrait, vertikal scrollend, Deutsch

class ResearchLab {
    constructor(game) {
        this.game = game;
        this.animTimer = 0;
        this.scrollY = 0;

        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
        window.addEventListener('keydown', (e) => {
            if (this.game.state === 'meta' && e.code === 'Escape') {
                this.game.state = 'title';
                this.game.titleScreen.mode = 'title';
            }
        });
    }

    _canvasPos(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    _onPointerUp(e) {
        if (this.game.state !== 'meta') return;
        const pos = this._canvasPos(e);
        const W = CANVAS_W;

        // Zurück-Button oben
        if (pointInRect(pos.x, pos.y, 0, 0, W, 56)) {
            this.game.state = 'title';
            this.game.titleScreen.mode = 'title';
        }
    }

    update(dt) { this.animTimer += dt; }

    render(ctx) {
        const W = CANVAS_W, H = CANVAS_H;
        fillRect(ctx, 0, 0, W, H, '#050d05');

        // Hintergrund-Gitter
        ctx.strokeStyle = '#0d180d';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
        for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

        // Header-Bereich
        withAlpha(ctx, 0.9, () => {
            const grad = ctx.createLinearGradient(0, 0, 0, 56);
            grad.addColorStop(0, '#0a140a');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, 56);
        });

        // Zurück
        fillText(ctx, '‹ ZURÜCK', 20, 20, '#3ddc6e', 13, 'left', 'top');

        // Titel
        setGlow(ctx, '#3ddc6e', 12);
        fillTextBold(ctx, 'FORSCHUNGSLABOR', W/2, 28, '#3ddc6e', 14, 'center', 'middle');
        clearGlow(ctx);

        // Harz-Balance
        setGlow(ctx, '#c9a227', 10);
        fillTextBold(ctx, this.game.resin + ' HARZ', W - 18, 20, '#c9a227', 14, 'right', 'top');
        clearGlow(ctx);

        let y = 72;

        // ── Bestleistungen ─────────────────────────────────────────
        y = this._renderSection(ctx, W, y, 'BESTLEISTUNGEN', (ctx, sx, sy, sw) => {
            const best = this.game.bestStats;
            const rows = [
                ['Längste Überlebenszeit', this._fmtTime(best.time)],
                ['Meiste Kills', best.kills || 0],
                ['Höchste Stufe', best.level || 0]
            ];
            const rowH = 34;
            for (let i = 0; i < rows.length; i++) {
                const [label, val] = rows[i];
                const ry = sy + i * rowH + 14;
                fillText(ctx, label, sx + 14, ry, '#4a6a4a', 10, 'left', 'middle', true);
                fillTextBold(ctx, String(val), sx + sw - 14, ry, '#e8f0e9', 11, 'right', 'middle');
                if (i < rows.length - 1) {
                    withAlpha(ctx, 0.2, () => drawLine(ctx, sx + 10, sy + (i+1)*rowH, sx + sw - 10, sy + (i+1)*rowH, '#1f3a1f', 1));
                }
            }
            return rows.length * rowH;
        });

        y += 14;

        // ── Freischaltungen ────────────────────────────────────────
        y = this._renderSection(ctx, W, y, 'FREISCHALTUNGEN', (ctx, sx, sy, sw) => {
            const unlocks = [
                { name: 'Botaniker', desc: 'Startet mit Pollensalve', cost: 0, color: '#3ddc6e', active: true },
                { name: 'Kultivator', desc: 'Startet mit Trichomschwinge', cost: 150, color: '#a8d8ea' },
                { name: 'Laborgeist', desc: 'Startet mit THC-Laser', cost: 300, color: '#ff6b6b' },
                { name: '+25% Start-XP', desc: 'Jeder Run beginnt mit Bonus', cost: 80, color: '#c9a227' },
                { name: 'Regenerations-Passiv', desc: 'Startet mit Regeneration', cost: 120, color: '#7acc7a' },
            ];
            const rowH = 50;
            for (let i = 0; i < unlocks.length; i++) {
                const u = unlocks[i];
                const uy = sy + i * rowH + 8;

                withAlpha(ctx, u.active || u.cost === 0 ? 1 : 0.5, () => {
                    // Farbpunkt
                    setGlow(ctx, u.color, u.active ? 10 : 4);
                    fillCircle(ctx, sx + 22, uy + rowH/2 - 12, 8, u.color);
                    clearGlow(ctx);

                    fillTextBold(ctx, u.name, sx + 40, uy + 8, u.active || u.cost === 0 ? '#e8f0e9' : '#4a5a4a', 11, 'left', 'top');
                    fillText(ctx, u.desc, sx + 40, uy + 24, '#4a6a4a', 9, 'left', 'top', true);

                    if (u.cost > 0 && !u.active) {
                        fillText(ctx, u.cost + ' Harz', sx + sw - 14, uy + 14, '#c9a227', 10, 'right', 'middle', true);
                    } else if (u.active || u.cost === 0) {
                        fillText(ctx, '✓ AKTIV', sx + sw - 14, uy + 14, u.color, 9, 'right', 'middle', true);
                    }
                });

                if (i < unlocks.length - 1) {
                    withAlpha(ctx, 0.15, () => drawLine(ctx, sx + 10, sy + (i+1)*rowH, sx + sw - 10, sy + (i+1)*rowH, '#1f3a1f', 1));
                }
            }
            return unlocks.length * rowH;
        });

        y += 14;

        // ── Forschungsprotokoll ────────────────────────────────────
        const frags = [
            '"Exemplar 47 hat Quarantäne durchbrochen. Wachstumsrate anomal. Evakuierung empfohlen."',
            '"Das Myzel-Netzwerk breitet sich schneller als berechnet aus. Es scheint... intelligent."',
            '"Dr. Chloris — falls Sie das lesen, ist die Anlage bereits verloren. Viel Glück."',
            '"Terpensynthese-Durchbruch. Auch alles in Brand. Diese zwei Ereignisse könnten zusammenhängen."'
        ];
        const fragIdx = Math.floor(this.animTimer / 18) % frags.length;

        withAlpha(ctx, 0.35, () => {
            fillText(ctx, 'GEBORGENES PROTOKOLL', 20, y + 10, '#2a4a2a', 9, 'left', 'top', true);
            fillText(ctx, frags[fragIdx], 20, y + 26, '#3a5a3a', 9, 'left', 'top', true);
        });
    }

    // Zeichnet eine Sektion mit Titel-Label und Content-Callback
    _renderSection(ctx, W, y, title, contentFn) {
        const pad = 14;
        const sectionX = pad;
        const sectionW = W - pad * 2;

        // Sektion-Label
        fillText(ctx, title, sectionX, y, '#3ddc6e', 9, 'left', 'top', true);
        y += 18;

        // Panel
        const panelStartY = y;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Messen wie hoch Content wird (Callback gibt Höhe zurück)
        // Wir zeichnen direkt und merken uns die zurückgegebene Höhe
        const contentH = contentFn(ctx, sectionX, panelStartY, sectionW);

        // Panel rahmen (nachträglich)
        withAlpha(ctx, 0.6, () => {
            fillRoundRect(ctx, sectionX, panelStartY, sectionW, contentH + 16, 10, '#080f08');
        });
        strokeRoundRect(ctx, sectionX, panelStartY, sectionW, contentH + 16, 10, '#1a2a1a', 1);

        // Content nochmal zeichnen (über Panel)
        contentFn(ctx, sectionX, panelStartY, sectionW);

        return panelStartY + contentH + 16;
    }

    _fmtTime(s) {
        if (!s) return '00:00';
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }
}
