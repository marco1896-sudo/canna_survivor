// Math utilities — no dependencies

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceSq(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return dx * dx + dy * dy;
}

function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function angleToVec(a) {
    return { x: Math.cos(a), y: Math.sin(a) };
}

function circleOverlap(x1, y1, r1, x2, y2, r2) {
    return distanceSq(x1, y1, x2, y2) < (r1 + r2) * (r1 + r2);
}

function randomOnCircleEdge(radius) {
    const a = Math.random() * Math.PI * 2;
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
}

function approach(current, target, step) {
    if (current < target) return Math.min(current + step, target);
    if (current > target) return Math.max(current - step, target);
    return target;
}

function sign(v) {
    return v < 0 ? -1 : v > 0 ? 1 : 0;
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
