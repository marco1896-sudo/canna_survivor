// GameOverScreen — Mobile Portrait, Deutsch, Premium

class GameOverScreen {
    constructor(game) {
        this.game = game;
        this.alpha = 0;
        this.animTimer = 0;

        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
        window.addEventListener('keydown', (e) => this._onKey(e));
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
        const s = this.game.state;
        if (s !== 'gameOver' && s !== 'win') return;
        if (this.alpha < 0.8) return;
        const pos = this._canvasPos(e);
        const W = CANVAS_W, H = CANVAS_H;

        // Neu starten
        if (pointInRect(pos.x, pos.y, W/2 - 120, H * 0.72, 240, 60)) this._retry();
        // Forschungslabor
        if (pointInRect(pos.x, pos.y, W/2 - 100, H * 0.72 + 76, 200, 52)) this._goMeta();
    }

    _onKey(e) {
        const s = this.game.state;
        if (s !== 'gameOver' && s !== 'win') return;
        if (this.alpha < 0.8) return;
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyR') this._retry();
        if (e.code === 'Escape') this._goMeta();
    }

    _retry() {
        this.alpha = 0; this.animTimer = 0;
        this.game.state = 'title';
        this.game.titleScreen.mode = 'title';
    }

    _goMeta() {
        this.alpha = 0; this.animTimer = 0;
        this.game.state = 'meta';
    }

    update(dt) {
        this.alpha = Math.min(1, this.alpha + dt * 1.8);
        this.animTimer += dt;
    }

    render(ctx, isWin) {
        const W = CANVAS_W, H = CANVAS_H;
        const player = this.game.player;
        if (!player) return;

        withAlpha(ctx, this.alpha * 0.85, () => {
            fillRect(ctx, 0, 0, W, H, '#040c04');
        });

        withAlpha(ctx, this.alpha, () => {
            isWin ? this._renderSieg(ctx, W, H, player) : this._renderTod(ctx, W, H, player);
        });
    }

    _renderTod(ctx, W, H, player) {
        // Roter Header
        setGlow(ctx, '#e05252', 30);
        fillTextBold(ctx, 'GEFALLEN', W/2, H * 0.14, '#e05252', 28, 'center', 'middle');
        clearGlow(ctx);
        withAlpha(ctx, 0.5, () => {
            fillText(ctx, 'PROJEKT CHLORIS — MISSION ABGEBROCHEN', W/2, H * 0.14 + 34, '#6a2a2a', 8, 'center', 'middle', true);
        });

        this._renderStatsPanel(ctx, W, H, player);

        // Harz-Belohnung
        const resin = this.game._lastResinEarned || 0;
        setGlow(ctx, '#c9a227', 10);
        fillTextBold(ctx, '+ ' + resin + ' HARZ GEBORGEN', W/2, H * 0.62, '#c9a227', 13, 'center', 'middle');
        clearGlow(ctx);

        // Buttons
        drawMobileButton(ctx, W/2, H * 0.72 + 30, 240, 60, '↺  ERNEUT VERSUCHEN', '#3ddc6e', '#0d2e14', 14);
        drawMobileButton(ctx, W/2, H * 0.72 + 106, 200, 52, 'FORSCHUNGSLABOR', '#c9a227', '#1a1408', 12);

        withAlpha(ctx, 0.25, () => {
            fillText(ctx, 'R  oder  Enter  zum Neustart', W/2, H - 24, '#3a5a3a', 9, 'center', 'middle', true);
        });
    }

    _renderSieg(ctx, W, H, player) {
        // Gold-Header mit Puls
        const pulse = Math.sin(this.animTimer * 2) * 0.05 + 1;
        ctx.save();
        ctx.translate(W/2, H * 0.14);
        ctx.scale(pulse, pulse);
        setGlow(ctx, '#c9a227', 35);
        fillTextBold(ctx, 'ÜBERSTANDEN', 0, 0, '#c9a227', 26, 'center', 'middle');
        clearGlow(ctx);
        ctx.restore();

        withAlpha(ctx, 0.5, () => {
            fillText(ctx, 'PROJEKT CHLORIS — ANLAGE GESICHERT', W/2, H * 0.14 + 34, '#6a5a2a', 8, 'center', 'middle', true);
        });

        this._renderStatsPanel(ctx, W, H, player);

        const resin = this.game._lastResinEarned || 0;
        setGlow(ctx, '#c9a227', 15);
        fillTextBold(ctx, '+ ' + resin + ' HARZ GEBORGEN', W/2, H * 0.62, '#c9a227', 14, 'center', 'middle');
        clearGlow(ctx);

        drawMobileButton(ctx, W/2, H * 0.72 + 30, 240, 60, '▶  NOCHMAL SPIELEN', '#3ddc6e', '#0d2e14', 14);
        drawMobileButton(ctx, W/2, H * 0.72 + 106, 200, 52, 'FORSCHUNGSLABOR', '#c9a227', '#1a1408', 12);
    }

    _renderStatsPanel(ctx, W, H, player) {
        const panelX = 30, panelW = W - 60, panelH = 180;
        const panelY = H * 0.25;

        // Panel-Hintergrund
        withAlpha(ctx, 0.65, () => {
            fillRoundRect(ctx, panelX, panelY, panelW, panelH, 14, '#080f08');
        });
        strokeRoundRect(ctx, panelX, panelY, panelW, panelH, 14, '#1f3a1f', 1.5);

        const elapsed = Math.floor(this.game.time);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

        const rows = [
            ['ÜBERLEBENSZEIT', timeStr, '#3ddc6e'],
            ['ERREICHTE STUFE', player.level, '#c9a227'],
            ['ELIMINIERTE FEINDE', this.game.kills, '#e05252'],
            ['AKTIVE WAFFEN', player.weapons.length, '#a8d8ea']
        ];

        const rowH = panelH / rows.length;
        for (let i = 0; i < rows.length; i++) {
            const [label, value, color] = rows[i];
            const ry = panelY + i * rowH + rowH / 2;

            fillText(ctx, label, panelX + 18, ry, '#4a6a4a', 9, 'left', 'middle', true);
            setGlow(ctx, color, 5);
            fillTextBold(ctx, String(value), panelX + panelW - 18, ry, color, 14, 'right', 'middle');
            clearGlow(ctx);

            if (i < rows.length - 1) {
                withAlpha(ctx, 0.2, () => {
                    drawLine(ctx, panelX + 14, panelY + (i + 1) * rowH, panelX + panelW - 14, panelY + (i + 1) * rowH, '#1f3a1f', 1);
                });
            }
        }
    }
}
