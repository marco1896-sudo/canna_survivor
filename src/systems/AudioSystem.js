// Procedural audio via Web Audio API — no external files required

class AudioSystem {
    constructor() {
        this._ctx = null;
        this._masterGain = null;
        this._enabled = true;
        this._volume = 0.5;
        this._lastPlayTime = {};
        this._minInterval = {
            hit: 0.04,
            shoot: 0.05,
            aura: 0.15,
            spray: 0.06,
            whip: 0.08,
            chain: 0.1,
            enemyShoot: 0.1
        };
        this._init();
    }

    _init() {
        try {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this._ctx.createGain();
            this._masterGain.gain.value = this._volume;
            this._masterGain.connect(this._ctx.destination);
        } catch (e) {
            console.warn('Web Audio API not available:', e);
            this._enabled = false;
        }
    }

    _resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
    }

    setVolume(v) {
        this._volume = clamp(v, 0, 1);
        if (this._masterGain) this._masterGain.gain.value = this._volume;
    }

    toggle() {
        this._enabled = !this._enabled;
        if (this._masterGain) {
            this._masterGain.gain.value = this._enabled ? this._volume : 0;
        }
        return this._enabled;
    }

    play(soundId) {
        if (!this._enabled || !this._ctx) return;
        this._resume();

        const now = this._ctx.currentTime;
        const minInt = this._minInterval[soundId] || 0;
        const lastTime = this._lastPlayTime[soundId] || 0;
        if (now - lastTime < minInt) return;
        this._lastPlayTime[soundId] = now;

        switch (soundId) {
            case 'shoot':     this._playShoot(); break;
            case 'hit':       this._playHit(); break;
            case 'levelUp':   this._playLevelUp(); break;
            case 'playerHit': this._playPlayerHit(); break;
            case 'explosion': this._playExplosion(); break;
            case 'chain':     this._playChain(); break;
            case 'laser':     this._playLaser(); break;
            case 'charge':    this._playCharge(); break;
            case 'pulse':     this._playPulse(); break;
            case 'spray':     this._playSpray(); break;
            case 'whip':      this._playWhip(); break;
            case 'throw':     this._playThrow(); break;
            case 'trap':      this._playTrap(); break;
            case 'rootSnap':  this._playRootSnap(); break;
            case 'spawn':     this._playSpawn(); break;
            case 'aura':      this._playAura(); break;
            case 'enemyShoot':this._playEnemyShoot(); break;
            case 'warning':   this._playWarning(); break;
            case 'slam':      this._playSlam(); break;
            case 'xpCollect': this._playXpCollect(); break;
        }
    }

    _osc(type, freq, gainVal, duration, startTime, endFreq) {
        const ctx = this._ctx;
        const t = startTime || ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (endFreq !== undefined) osc.frequency.linearRampToValueAtTime(endFreq, t + duration);
        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
        return osc;
    }

    _noise(gainVal, duration, startTime) {
        const ctx = this._ctx;
        const t = startTime || ctx.currentTime;
        const bufSize = Math.ceil(ctx.sampleRate * duration);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        src.connect(gain);
        gain.connect(this._masterGain);
        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        src.start(t);
        return src;
    }

    _playShoot() {
        this._osc('square', 600, 0.06, 0.08, null, 900);
        this._osc('sine', 400, 0.03, 0.06, null, 200);
    }

    _playHit() {
        this._osc('sawtooth', 180, 0.05, 0.07, null, 80);
        this._noise(0.04, 0.06);
    }

    _playLevelUp() {
        const t = this._ctx.currentTime;
        [440, 554, 659, 880].forEach((f, i) => {
            this._osc('sine', f, 0.12, 0.25, t + i * 0.08, f * 1.05);
        });
        this._osc('triangle', 1320, 0.08, 0.5, t + 0.3, 1760);
    }

    _playPlayerHit() {
        this._osc('sawtooth', 120, 0.15, 0.2, null, 60);
        this._noise(0.1, 0.15);
    }

    _playExplosion() {
        this._noise(0.2, 0.5);
        this._osc('sawtooth', 80, 0.15, 0.4, null, 30);
    }

    _playChain() {
        this._osc('sine', 500, 0.07, 0.15, null, 200);
        this._osc('sine', 750, 0.04, 0.1, null, 300);
    }

    _playLaser() {
        const t = this._ctx.currentTime;
        this._osc('sawtooth', 200, 0.1, 1.5, t, 100);
        this._osc('sine', 2000, 0.05, 1.5, t, 500);
    }

    _playCharge() {
        this._osc('sine', 300, 0.04, 0.6, null, 800);
    }

    _playPulse() {
        this._osc('sine', 250, 0.1, 0.3, null, 100);
        this._osc('triangle', 500, 0.06, 0.2, null, 200);
    }

    _playSpray() {
        this._noise(0.06, 0.12);
        this._osc('sawtooth', 300, 0.04, 0.1, null, 150);
    }

    _playWhip() {
        this._osc('sawtooth', 800, 0.08, 0.1, null, 200);
    }

    _playThrow() {
        this._osc('sine', 400, 0.06, 0.15, null, 200);
    }

    _playTrap() {
        this._osc('square', 300, 0.05, 0.12, null, 200);
    }

    _playRootSnap() {
        this._osc('sawtooth', 150, 0.1, 0.2, null, 80);
        this._noise(0.06, 0.15);
    }

    _playSpawn() {
        this._osc('sine', 220, 0.05, 0.3, null, 440);
    }

    _playAura() {
        this._osc('sine', 180, 0.02, 0.15, null, 150);
    }

    _playEnemyShoot() {
        this._osc('square', 800, 0.04, 0.1, null, 600);
    }

    _playWarning() {
        const t = this._ctx.currentTime;
        this._osc('square', 440, 0.08, 0.15, t);
        this._osc('square', 440, 0.08, 0.15, t + 0.2);
    }

    _playSlam() {
        this._noise(0.25, 0.6);
        this._osc('sine', 60, 0.2, 0.5, null, 30);
    }

    _playXpCollect() {
        this._osc('sine', 1200, 0.03, 0.08, null, 1600);
    }
}
