// LevelUpScreen — Mobile Portrait, Vertikale Karten-Liste, Deutsch

class LevelUpScreen {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.alpha = 0;
        this.hoveredIndex = -1;
        this.animTimer = 0;

        // Karten-Layout (vertikal gestapelt)
        this.cardW = CANVAS_W - 40;
        this.cardH = 110;
        this.cardGap = 14;
        this.cardStartY = 0; // berechnet in render

        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('pointerup', (e) => this._onPointerUp(e));
        canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));

        window.addEventListener('keydown', (e) => {
            if (this.visible) {
                if (e.code === 'Digit1' || e.code === 'Numpad1') this._select(0);
                if (e.code === 'Digit2' || e.code === 'Numpad2') this._select(1);
                if (e.code === 'Digit3' || e.code === 'Numpad3') this._select(2);
            }
        });
    }

    show() {
        this.visible = true;
        this.alpha = 0;
        this.hoveredIndex = -1;
        this.animTimer = 0;
    }

    update(dt) {
        if (!this.visible) return;
        this.alpha = Math.min(1, this.alpha + dt * 6);
        this.animTimer += dt;
    }

    _canvasPos(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }

    _getCardRects() {
        const choices = this.game.upgradeSystem.choices;
        const totalH = choices.length * this.cardH + (choices.length - 1) * this.cardGap;
        const startY = (CANVAS_H - totalH) / 2 + 20;
        return choices.map((_, i) => ({
            x: 20,
            y: startY + i * (this.cardH + this.cardGap),
            w: this.cardW,
            h: this.cardH
        }));
    }

    _onPointerMove(e) {
        if (!this.visible) return;
        const pos = this._canvasPos(e);
        const rects = this._getCardRects();
        this.hoveredIndex = -1;
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (pointInRect(pos.x, pos.y, r.x, r.y, r.w, r.h)) {
                this.hoveredIndex = i;
                break;
            }
        }
    }

    _onPointerUp(e) {
        if (!this.visible || this.alpha < 0.85) return;
        const pos = this._canvasPos(e);
        const rects = this._getCardRects();
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (pointInRect(pos.x, pos.y, r.x, r.y, r.w, r.h)) {
                this._select(i);
                return;
            }
        }
    }

    _select(index) {
        if (!this.visible) return;
        const choices = this.game.upgradeSystem.choices;
        if (index >= choices.length) return;
        this.visible = false;
        this.game.particles.levelUp(this.game.player.x, this.game.player.y);
        this.game.triggerFlash('#c9a227', 0.45);
        this.game.upgradeSystem.applyChoice(index);
    }

    render(ctx) {
        if (!this.visible) return;
        const choices = this.game.upgradeSystem.choices;
        const W = CANVAS_W, H = CANVAS_H;

        // Dunkles Overlay
        withAlpha(ctx, this.alpha * 0.78, () => {
            fillRect(ctx, 0, 0, W, H, '#040c04');
        });

        withAlpha(ctx, this.alpha, () => {
            // Header
            const headerY = 68;
            setGlow(ctx, '#c9a227', 25);
            fillTextBold(ctx, 'PHÄNOTYP-AUSWAHL', W/2, headerY, '#c9a227', 16, 'center', 'middle');
            clearGlow(ctx);
            fillText(ctx, 'STUFE ' + this.game.player.level + '  —  1 Upgrade wählen', W/2, headerY + 22, '#4a6a4a', 10, 'center', 'middle', true);

            // Karten
            const rects = this._getCardRects();
            for (let i = 0; i < choices.length; i++) {
                const r = rects[i];
                this._renderCard(ctx, choices[i], r, i === this.hoveredIndex, i);
            }

            // Tastatur-Hinweis
            withAlpha(ctx, 0.3, () => {
                fillText(ctx, 'Tippen oder  [1]  [2]  [3]', W/2, H - 28, '#4a6a4a', 9, 'center', 'middle', true);
            });
        });
    }

    _renderCard(ctx, choice, rect, hovered, index) {
        const { x, y, w, h } = rect;
        const rarity = choice.rarity || 'common';
        const rarityColor = RARITY_COLORS[rarity] || '#7acc7a';

        // Karten-Hintergrund mit Glow bei Hover
        const bgAlpha = hovered ? 0.9 : 0.7;
        withAlpha(ctx, bgAlpha, () => {
            fillRoundRect(ctx, x, y, w, h, 12, hovered ? '#0e2210' : '#080f08');
        });

        // Rahmen-Glow
        setGlow(ctx, rarityColor, hovered ? 18 : 6);
        strokeRoundRect(ctx, x, y, w, h, 12, rarityColor, hovered ? 2.5 : 1.5);
        clearGlow(ctx);

        // Seltenheits-Tag oben rechts
        const tagX = x + w - 12;
        const tagY = y + 10;
        fillText(ctx, RARITY_LABELS[rarity] || 'NORMAL', tagX, tagY, rarityColor, 8, 'right', 'top', true);

        // Nummer-Hint
        withAlpha(ctx, 0.4, () => {
            fillText(ctx, '[' + (index + 1) + ']', x + 12, tagY, '#2a4a2a', 8, 'left', 'top', true);
        });

        // Icon (Polygon-Symbol, links)
        const iconX = x + 30, iconY = y + h / 2 + 2;
        const iconColor = this._choiceColor(choice);
        setGlow(ctx, iconColor, hovered ? 18 : 10);
        drawPolygon(ctx, iconX, iconY, this._choiceSides(choice), 18, this.animTimer * 0.6, iconColor, null);
        clearGlow(ctx);

        // Evolutions-Indikator
        if (choice.type === 'evolution') {
            withAlpha(ctx, Math.sin(this.animTimer * 5) * 0.15 + 0.15, () => {
                fillRoundRect(ctx, x, y, w, h, 12, rarityColor);
            });
        }

        // Name (groß)
        const textX = x + 58;
        const nameY = y + 24;
        fillTextBold(ctx, choice.name, textX, nameY, '#e8f0e9', 13, 'left', 'middle');

        // Beschreibung (klein, umgebrochen)
        this._wrapText(ctx, choice.description, textX, nameY + 20, w - 68, '#6a8a6a', 10, 18);
    }

    _choiceColor(choice) {
        if (choice.weaponId) {
            const def = WEAPON_DEFS[choice.weaponId] || EVOLVED_WEAPON_DEFS[choice.weaponId];
            return def ? def.color : '#3ddc6e';
        }
        if (choice.evolvedId) {
            const def = EVOLVED_WEAPON_DEFS[choice.evolvedId];
            return def ? def.color : '#c9a227';
        }
        const def = PASSIVE_DEFS.find(p => p.id === choice.passiveId);
        return def ? (RARITY_COLORS[def.rarity] || '#7acc7a') : '#7acc7a';
    }

    _choiceSides(choice) {
        if (choice.type === 'evolution') return 6;
        if (choice.type === 'newWeapon') return 5;
        if (choice.type === 'weapon') return 4;
        return 3;
    }

    _wrapText(ctx, text, x, y, maxW, color, fontSize, lineH) {
        ctx.fillStyle = color;
        ctx.font = fontSize + "px 'Orbitron', 'Courier New', monospace";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const words = text.split(' ');
        let line = '';
        let curY = y;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxW && line.length > 0) {
                ctx.fillText(line.trim(), x, curY);
                line = word + ' ';
                curY += lineH;
            } else {
                line = test;
            }
        }
        if (line.trim()) ctx.fillText(line.trim(), x, curY);
    }
}
