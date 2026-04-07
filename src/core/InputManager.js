// InputManager — Touch-first mit dynamischem Joystick + Keyboard-Fallback

class InputManager {
    constructor(canvas) {
        this._canvas = canvas;
        this._keys = {};
        this._justPressed = {};
        this._justReleased = {};

        // Maus/Click
        this.mouseX = 0;
        this.mouseY = 0;
        this._mouseClicked = false;
        this._mouseDown = false;

        // Touch-Joystick (linke Hälfte)
        this.joystick = {
            active: false,
            originX: 0, originY: 0,   // wo der Finger aufgesetzt hat
            currentX: 0, currentY: 0, // aktuelle Fingerposition
            dx: 0, dy: 0,             // normalisierter Richtungsvektor
            magnitude: 0,             // 0–1
            pointerId: -1,
            radius: 52                // Joystick-Halbmesser in Canvas-Pixel
        };

        // Rechte Seite (Dash / Fähigkeit — optional)
        this.rightTouch = {
            active: false,
            pointerId: -1,
            x: 0, y: 0
        };

        this._setupKeyboard();
        this._setupTouch(canvas);
        this._setupMouse(canvas);
    }

    // ---- Keyboard ----
    _setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this._keys[e.code]) this._justPressed[e.code] = true;
            this._keys[e.code] = true;
            if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this._keys[e.code] = false;
            this._justReleased[e.code] = true;
        });
    }

    // ---- Touch (pointer events für Multi-Touch) ----
    _setupTouch(canvas) {
        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            canvas.setPointerCapture(e.pointerId);
            const pos = this._canvasPos(e);

            // Linke Hälfte = Joystick
            if (pos.x < this._canvas.width * 0.55 && this.joystick.pointerId === -1) {
                this.joystick.active = true;
                this.joystick.pointerId = e.pointerId;
                this.joystick.originX = pos.x;
                this.joystick.originY = pos.y;
                this.joystick.currentX = pos.x;
                this.joystick.currentY = pos.y;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                this.joystick.magnitude = 0;
            } else if (pos.x >= this._canvas.width * 0.45 && this.rightTouch.pointerId === -1) {
                // Rechte Hälfte — als Click/Dash-Button
                this.rightTouch.active = true;
                this.rightTouch.pointerId = e.pointerId;
                this.rightTouch.x = pos.x;
                this.rightTouch.y = pos.y;
                this._mouseClicked = true;
                this.mouseX = pos.x;
                this.mouseY = pos.y;
            }
        }, { passive: false });

        canvas.addEventListener('pointermove', (e) => {
            e.preventDefault();
            const pos = this._canvasPos(e);

            if (e.pointerId === this.joystick.pointerId) {
                this.joystick.currentX = pos.x;
                this.joystick.currentY = pos.y;
                this._updateJoystick();
            } else if (e.pointerId === this.rightTouch.pointerId) {
                this.mouseX = pos.x;
                this.mouseY = pos.y;
            }
        }, { passive: false });

        const endTouch = (e) => {
            e.preventDefault();
            if (e.pointerId === this.joystick.pointerId) {
                this.joystick.active = false;
                this.joystick.pointerId = -1;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                this.joystick.magnitude = 0;
            } else if (e.pointerId === this.rightTouch.pointerId) {
                this.rightTouch.active = false;
                this.rightTouch.pointerId = -1;
            }
        };
        canvas.addEventListener('pointerup', endTouch, { passive: false });
        canvas.addEventListener('pointercancel', endTouch, { passive: false });
    }

    _updateJoystick() {
        const j = this.joystick;
        const rawDx = j.currentX - j.originX;
        const rawDy = j.currentY - j.originY;
        const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
        const maxDist = j.radius;

        if (dist < 2) {
            j.dx = 0; j.dy = 0; j.magnitude = 0;
            return;
        }

        j.magnitude = Math.min(dist / maxDist, 1);
        const inv = 1 / dist;
        j.dx = rawDx * inv;
        j.dy = rawDy * inv;
    }

    // ---- Mouse (Desktop-Fallback) ----
    _setupMouse(canvas) {
        canvas.addEventListener('mousemove', (e) => {
            const pos = this._canvasPos(e);
            this.mouseX = pos.x;
            this.mouseY = pos.y;
        });
        canvas.addEventListener('mousedown', (e) => {
            const pos = this._canvasPos(e);
            this.mouseX = pos.x;
            this.mouseY = pos.y;
            this._mouseDown = true;
            this._mouseClicked = true;
        });
        canvas.addEventListener('mouseup', () => { this._mouseDown = false; });
    }

    _canvasPos(e) {
        const rect = this._canvas.getBoundingClientRect();
        const scaleX = this._canvas.width / rect.width;
        const scaleY = this._canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // ---- Per-Frame Reset ----
    update() {
        this._justPressed = {};
        this._justReleased = {};
        this._mouseClicked = false;
    }

    // ---- API ----
    isDown(code) { return !!this._keys[code]; }
    isPressed(code) { return !!this._justPressed[code]; }
    wasClicked() { return this._mouseClicked; }
    isMouseDown() { return this._mouseDown; }

    // Gibt normalisierten Bewegungsvektor zurück (Touch-Joystick ODER Tastatur)
    getMovementVector() {
        // Touch hat Vorrang
        if (this.joystick.active && this.joystick.magnitude > 0.05) {
            return {
                x: this.joystick.dx * this.joystick.magnitude,
                y: this.joystick.dy * this.joystick.magnitude
            };
        }

        // Tastatur-Fallback
        let x = 0, y = 0;
        if (this._keys['KeyA'] || this._keys['ArrowLeft'])  x -= 1;
        if (this._keys['KeyD'] || this._keys['ArrowRight']) x += 1;
        if (this._keys['KeyW'] || this._keys['ArrowUp'])    y -= 1;
        if (this._keys['KeyS'] || this._keys['ArrowDown'])  y += 1;
        if (x !== 0 && y !== 0) {
            const inv = 1 / Math.sqrt(2);
            x *= inv; y *= inv;
        }
        return { x, y };
    }

    // Joystick-Daten für Render
    getJoystickState() { return this.joystick; }
}
