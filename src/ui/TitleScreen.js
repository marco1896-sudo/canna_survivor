// TitleScreen — Mobile Portrait, Premium, Deutsch

class TitleScreen {
    constructor(game) {
        this.game = game;
        this.mode = 'title'; // 'title' | 'charSelect'
        this.selectedChar = 0;
        this.animTimer = 0;
        this.leafAngle = 0;
        this.charScrollX = 0;
        this.charTargetX = 0;
        this.charIds = Object.keys(CHARACTERS);

        // Touch-Events auf Canvas
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
        window.addEventListener('keydown', (e) => this._onKey(e));
    }

    _canvasPos(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    _onPointerUp(e) {
        const state = this.game.state;
        if (state !== 'title' && state !== 'charSelect') return;
        const pos = this._canvasPos(e);
        const W = CANVAS_W, H = CANVAS_H;

        if (this.mode === 'title') {
            // SPIELEN Button (großer zentraler Button)
            if (pointInRect(pos.x, pos.y, W/2 - 120, H * 0.62, 240, 60)) {
                this.mode = 'charSelect';
                this.game.state = 'charSelect';
            }
            // Forschungslabor
            if (pointInRect(pos.x, pos.y, W/2 - 100, H * 0.62 + 76, 200, 52)) {
                this.game.state = 'meta';
            }
        } else if (this.mode === 'charSelect') {
            // Charakter-Karten (horizontal scrollend)
            const cardW = W - 60, cardH = 320;
            const cardY = H * 0.25;
            // Antippen links/rechts wechselt Charakter
            if (pos.y >= cardY && pos.y <= cardY + cardH) {
                if (pos.x < W / 2) this.selectedChar = (this.selectedChar + this.charIds.length - 1) % this.charIds.length;
                else this.selectedChar = (this.selectedChar + 1) % this.charIds.length;
            }

            // Starten-Button
            if (pointInRect(pos.x, pos.y, W/2 - 120, H * 0.78, 240, 60)) {
                this.game.audio._resume();
                this.game.startRun(this.charIds[this.selectedChar]);
            }
            // Zurück
            if (pointInRect(pos.x, pos.y, 0, 0, W, 50)) {
                // Tap oben = zurück
                if (pos.y < 50) {
                    this.mode = 'title';
                    this.game.state = 'title';
                }
            }
        }
    }

    _onKey(e) {
        if (this.game.state === 'title') {
            if (e.code === 'Enter' || e.code === 'Space') {
                this.mode = 'charSelect';
                this.game.state = 'charSelect';
            }
        } else if (this.game.state === 'charSelect') {
            if (e.code === 'ArrowLeft')  this.selectedChar = (this.selectedChar + 2) % 3;
            if (e.code === 'ArrowRight') this.selectedChar = (this.selectedChar + 1) % 3;
            if (e.code === 'Enter' || e.code === 'Space') {
                this.game.audio._resume();
                this.game.startRun(this.charIds[this.selectedChar]);
            }
            if (e.code === 'Escape') { this.mode = 'title'; this.game.state = 'title'; }
        }
    }

    update(dt) {
        this.animTimer += dt;
        this.leafAngle += dt * 0.4;
    }

    updateCharSelect(dt) {
        this.animTimer += dt;
        this.leafAngle += dt * 0.4;
    }

    render(ctx) {
        const W = CANVAS_W, H = CANVAS_H;
        fillRect(ctx, 0, 0, W, H, '#050d05');

        // Hintergrund-Motiv
        this._drawBgArt(ctx, W, H);

        if (this.mode === 'title') {
            this._renderTitle(ctx, W, H);
        } else {
            this._renderCharSelect(ctx, W, H);
        }
    }

    _drawBgArt(ctx, W, H) {
        // Großer pulsierender Hintergrundkreis
        const cx = W / 2, cy = H * 0.35;
        const pulse = Math.sin(this.animTimer * 0.8) * 15 + 1;
        for (let i = 4; i >= 0; i--) {
            withAlpha(ctx, 0.03 + i * 0.012, () => {
                setGlow(ctx, '#3ddc6e', 15);
                strokeCircle(ctx, cx, cy, 60 + i * 50 + pulse, '#1f6b3a', 1);
                clearGlow(ctx);
            });
        }

        // Rotierende Blätter
        for (let i = 0; i < 7; i++) {
            const a = this.leafAngle + (i / 7) * Math.PI * 2;
            const r = 90 + Math.sin(this.animTimer * 0.6 + i) * 18;
            withAlpha(ctx, 0.07 + (i % 2) * 0.03, () => {
                setGlow(ctx, '#3ddc6e', 5);
                drawPolygon(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6, 14 + i, a * 1.5, '#3ddc6e', null);
                clearGlow(ctx);
            });
        }

        // Neon-Gitter (Perspektive)
        withAlpha(ctx, 0.06, () => {
            ctx.strokeStyle = '#1f6b3a';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 36) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += 36) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }
        });
    }

    _renderTitle(ctx, W, H) {
        // Großes Logo — vertikal inszeniert
        const logoY = H * 0.18;

        // Subtitle
        withAlpha(ctx, 0.55, () => {
            fillText(ctx, 'PROJEKT CHLORIS', W/2, logoY - 18, '#3ddc6e', 9, 'center', 'middle', true);
        });

        // CANNA
        setGlow(ctx, '#3ddc6e', 35);
        fillTextBold(ctx, 'CANNA', W/2, logoY + 10, '#3ddc6e', 52, 'center', 'middle');
        clearGlow(ctx);

        // SURVIVORS
        setGlow(ctx, '#c9a227', 20);
        fillTextBold(ctx, 'SURVIVORS', W/2, logoY + 66, '#c9a227', 26, 'center', 'middle');
        clearGlow(ctx);

        // Tagline
        withAlpha(ctx, 0.4, () => {
            fillText(ctx, 'BOTANISCHES GEWÄCHSHAUS — LETZTE BASTION', W/2, logoY + 98, '#4a6a4a', 7, 'center', 'middle', true);
        });

        // Haupt-Button SPIELEN
        const btnY = H * 0.62;
        drawMobileButton(ctx, W/2, btnY + 30, 240, 60, '▶  SPIELEN', '#3ddc6e', '#0d2e14', 17);

        // Sekundär-Button
        drawMobileButton(ctx, W/2, btnY + 106, 200, 52, 'FORSCHUNGSLABOR', '#c9a227', '#1a1408', 13);

        // Steuerungshinweis
        withAlpha(ctx, 0.35, () => {
            fillText(ctx, 'WASD / Joystick — Waffen feuern automatisch', W/2, H - 38, '#4a6a4a', 9, 'center', 'middle', true);
            fillText(ctx, '30 Minuten überleben', W/2, H - 22, '#2a3a2a', 8, 'center', 'middle', true);
        });
    }

    _renderCharSelect(ctx, W, H) {
        // Zurück-Pfeil oben
        fillText(ctx, '‹ ZURÜCK', 20, 14, '#3ddc6e', 12, 'left', 'top');

        // Titel
        setGlow(ctx, '#3ddc6e', 10);
        fillTextBold(ctx, 'BOTANIKER WÄHLEN', W/2, 44, '#3ddc6e', 14, 'center', 'middle');
        clearGlow(ctx);

        // Paginierungs-Punkte
        const dotY = H * 0.24;
        for (let i = 0; i < this.charIds.length; i++) {
            const active = i === this.selectedChar;
            const dotX = W/2 + (i - 1) * 18;
            if (active) {
                setGlow(ctx, '#3ddc6e', 8);
                fillCircle(ctx, dotX, dotY, 5, '#3ddc6e');
                clearGlow(ctx);
            } else {
                fillCircle(ctx, dotX, dotY, 3, '#2a4a2a');
            }
        }

        // Aktive Charakter-Karte (zentriert, groß)
        const char = CHARACTERS[this.charIds[this.selectedChar]];
        const cardW = W - 60, cardH = 310;
        const cardX = 30, cardY = H * 0.265;
        this._renderCharCard(ctx, char, cardX, cardY, cardW, cardH);

        // Pfeil-Hinweis
        withAlpha(ctx, 0.4, () => {
            fillText(ctx, '‹  Tippe links/rechts zum Wechseln  ›', W/2, cardY + cardH + 12, '#4a6a4a', 9, 'center', 'top', true);
        });

        // Start-Button (groß, im Daumenbereich)
        drawMobileButton(ctx, W/2, H * 0.78 + 30, 240, 60, '▶  MISSION STARTEN', '#3ddc6e', '#0d2e14', 15);

        // Tastatur-Hinweis für Desktop
        withAlpha(ctx, 0.25, () => {
            fillText(ctx, '← →  Auswählen  ·  Enter  Starten', W/2, H - 20, '#3a5a3a', 9, 'center', 'middle', true);
        });
    }

    _renderCharCard(ctx, char, x, y, w, h) {
        const cx = x + w / 2;

        // Karten-Hintergrund
        withAlpha(ctx, 0.85, () => {
            fillRoundRect(ctx, x, y, w, h, 16, '#080f08');
        });
        setGlow(ctx, '#3ddc6e', 20);
        strokeRoundRect(ctx, x, y, w, h, 16, '#3ddc6e', 2);
        clearGlow(ctx);

        // Charakter-Avatar (oben im Kartenbereich)
        const avatarY = y + 75;
        const r = 40;
        setGlow(ctx, '#3ddc6e', 25);
        drawPolygon(ctx, cx, avatarY, 6, r, this.animTimer * 0.4, '#0d2e14', '#3ddc6e', 2.5);
        clearGlow(ctx);
        setGlow(ctx, '#c9a227', 15);
        drawPolygon(ctx, cx, avatarY, 4, r * 0.42, -this.animTimer * 0.8, '#c9a227', null);
        clearGlow(ctx);

        // Startwaffe-Farbe als Kern
        const wDef = WEAPON_DEFS[char.startWeapon];
        if (wDef) {
            setGlow(ctx, wDef.glowColor, 12);
            fillCircle(ctx, cx, avatarY, r * 0.22, wDef.color);
            clearGlow(ctx);
        }

        // Name
        setGlow(ctx, '#3ddc6e', 8);
        fillTextBold(ctx, char.name, cx, avatarY + r + 18, '#e8f0e9', 16, 'center', 'middle');
        clearGlow(ctx);

        // Beschreibung
        fillText(ctx, char.description, cx, avatarY + r + 40, '#5a7a5a', 10, 'center', 'middle');

        // Stats-Leisten
        const statsY = avatarY + r + 66;
        const statW = w - 60;
        const statX = x + 30;

        // HP
        fillText(ctx, 'LEBEN', statX, statsY, '#e05252', 9, 'left', 'top');
        drawBarRounded(ctx, statX, statsY + 14, statW, 8, char.startHp, 160, '#e05252', '#1a0808', 4);
        fillText(ctx, char.startHp, statX + statW, statsY + 15, '#e05252', 9, 'right', 'top');

        // Geschwindigkeit
        fillText(ctx, 'TEMPO', statX, statsY + 34, '#3ddc6e', 9, 'left', 'top');
        drawBarRounded(ctx, statX, statsY + 48, statW, 8, char.startSpeed, 170, '#3ddc6e', '#0a1a0a', 4);
        fillText(ctx, char.startSpeed, statX + statW, statsY + 49, '#3ddc6e', 9, 'right', 'top');

        // Startwaffe
        fillText(ctx, 'STARTWAFFE', statX, statsY + 70, '#4a6a4a', 8, 'left', 'top');
        if (wDef) {
            setGlow(ctx, wDef.glowColor, 6);
            fillTextBold(ctx, wDef.name, statX, statsY + 83, wDef.color, 11, 'left', 'top');
            clearGlow(ctx);
        }
    }
}
