// Canvas drawing helpers — Mobile-first, Orbitron-Font

const FONT_MAIN = "'Orbitron', 'Courier New', monospace";
const FONT_MONO = "'Courier New', monospace";

function fillCircle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function strokeCircle(ctx, x, y, r, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
}

function fillRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function strokeRect(ctx, x, y, w, h, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1;
    ctx.strokeRect(x, y, w, h);
}

function fillRoundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();
}

// Primary Orbitron text
function fillText(ctx, text, x, y, color, fontSize, align, baseline, mono) {
    ctx.fillStyle = color || '#fff';
    ctx.font = (fontSize || 14) + 'px ' + (mono ? FONT_MONO : FONT_MAIN);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'top';
    ctx.fillText(text, x, y);
}

function fillTextBold(ctx, text, x, y, color, fontSize, align, baseline) {
    ctx.fillStyle = color || '#fff';
    ctx.font = 'bold ' + (fontSize || 14) + 'px ' + FONT_MAIN;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'top';
    ctx.fillText(text, x, y);
}

function measureText(ctx, text, fontSize, bold) {
    ctx.font = (bold ? 'bold ' : '') + (fontSize || 14) + 'px ' + FONT_MAIN;
    return ctx.measureText(text).width;
}

function setGlow(ctx, color, size) {
    ctx.shadowColor = color;
    ctx.shadowBlur = size;
}

function clearGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function drawBar(ctx, x, y, w, h, value, max, fillColor, bgColor, borderColor) {
    const pct = clamp(value / max, 0, 1);
    fillRect(ctx, x, y, w, h, bgColor || '#111');
    if (pct > 0) fillRect(ctx, x, y, w * pct, h, fillColor);
    if (borderColor && borderColor !== 'transparent') {
        strokeRect(ctx, x - 0.5, y - 0.5, w + 1, h + 1, borderColor, 1);
    }
}

function drawBarRounded(ctx, x, y, w, h, value, max, fillColor, bgColor, r) {
    const pct = clamp(value / max, 0, 1);
    r = r || h / 2;
    fillRoundRect(ctx, x, y, w, h, r, bgColor || '#111');
    if (pct > 0) {
        const fw = Math.max(r * 2, w * pct);
        fillRoundRect(ctx, x, y, fw, h, r, fillColor);
    }
}

function drawPolygon(ctx, cx, cy, sides, radius, rotation, fillColor, strokeColor, lineWidth) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = (rotation || 0) + (i / sides) * Math.PI * 2;
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
}

function drawLine(ctx, x1, y1, x2, y2, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCone(ctx, cx, cy, dirAngle, halfAngle, radius, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, dirAngle - halfAngle, dirAngle + halfAngle);
    ctx.closePath();
    ctx.fill();
}

function withAlpha(ctx, alpha, fn) {
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    fn();
    ctx.restore();
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha !== undefined ? alpha : 1) + ')';
}

function drawGlowRing(ctx, x, y, r, color, glowSize, alpha) {
    withAlpha(ctx, alpha !== undefined ? alpha : 1, () => {
        setGlow(ctx, color, glowSize || 12);
        strokeCircle(ctx, x, y, r, color, 2);
        clearGlow(ctx);
    });
}

// Draw a premium mobile button
function drawMobileButton(ctx, cx, cy, w, h, label, color, bgColor, fontSize, hovered) {
    const x = cx - w / 2, y = cy - h / 2;
    const r = h / 2;

    // Shadow
    withAlpha(ctx, 0.4, () => {
        setGlow(ctx, color, hovered ? 20 : 8);
        fillRoundRect(ctx, x, y + 3, w, h, r, 'transparent');
        clearGlow(ctx);
    });

    // Background
    fillRoundRect(ctx, x, y, w, h, r, bgColor || '#0d2e14');

    // Border glow
    setGlow(ctx, color, hovered ? 16 : 6);
    strokeRoundRect(ctx, x, y, w, h, r, color, hovered ? 2.5 : 1.5);
    clearGlow(ctx);

    // Label
    setGlow(ctx, color, 8);
    fillTextBold(ctx, label, cx, cy, color, fontSize || 15, 'center', 'middle');
    clearGlow(ctx);
}

// Scanline overlay for premium feel
function drawScanlines(ctx, w, h, alpha) {
    withAlpha(ctx, alpha || 0.04, () => {
        ctx.fillStyle = '#000';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }
    });
}

// Vignette (darkened edges)
function drawVignette(ctx, w, h, strength) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,' + (strength || 0.5) + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

// Screen flash (damage, level-up etc.)
function drawScreenFlash(ctx, w, h, color, alpha) {
    withAlpha(ctx, alpha, () => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
    });
}
