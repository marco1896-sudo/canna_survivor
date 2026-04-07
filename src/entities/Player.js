// Player — Bewegung, Waffen, XP, Rendering

const CHARACTERS = {
    botanist: {
        id: 'botanist',
        name: 'Dr. Chloris',
        description: 'Ausgeglichener Wissenschaftler.',
        startWeapon: 'pollenBurst',
        startHp: 100,
        startSpeed: 130,
        bonuses: {}
    },
    cultivator: {
        id: 'cultivator',
        name: 'Der Kultivator',
        description: 'Panzer-Kämpfer, hoher LP-Pool.',
        startWeapon: 'trichomeWhip',
        startHp: 140,
        startSpeed: 108,
        bonuses: { damageMult: 1.1 }
    },
    chemist: {
        id: 'chemist',
        name: 'Laborgeist',
        description: 'Glaskanone. Schnell, tödlich.',
        startWeapon: 'thcLaser',
        startHp: 70,
        startSpeed: 148,
        bonuses: { damageMult: 1.25, cooldownMult: 0.88 }
    }
};

const WEAPON_CLASSES = {
    pollenBurst:      PollenBurst,
    trichomeWhip:     TrichomeWhip,
    resinGrenade:     ResinGrenade,
    sporeCloud:       SporeCloud,
    myceliumTentacle: MyceliumTentacle,
    thcLaser:         THCLaser,
    cbdPulse:         CBDShieldPulse,
    terpeneSpray:     TerpeneSpray,
    rootSnare:        RootSnare
};

class Player {
    constructor(game, characterId) {
        this.game = game;
        this.characterId = characterId || 'botanist';
        const charDef = CHARACTERS[this.characterId];

        this.x = 0;
        this.y = 0;
        this.radius = 14;
        this.angle = 0;
        this.lastMoveAngle = 0;

        // Leben
        this.maxHp = charDef.startHp;
        this.hp = this.maxHp;
        this.dead = false;
        this.iframes = 0;
        this.flashTimer = 0;

        // Progression
        this.xp = 0;
        this.level = 1;
        this.xpThreshold = 10;

        // Statistiken
        this.stats = Object.assign({
            damageMult: 1.0,
            speedMult: 1.0,
            cooldownMult: 1.0,
            rangeMult: 1.0,
            regen: 0,
            pickupRadius: 60,
            iframeDuration: 0.5
        }, charDef.bonuses);

        this.baseSpeed = charDef.startSpeed;

        // Waffen & Passivs
        this.weapons = [];
        this.passives = [];

        this.addWeapon(charDef.startWeapon);

        // Visual
        this.innerAngle = 0;
        this.regenTimer = 0;
        this.pulseTimer = 0;
    }

    addWeapon(weaponId) {
        if (this.weapons.length >= 6) return false;
        const WClass = WEAPON_CLASSES[weaponId];
        if (!WClass) return false;
        this.weapons.push(new WClass(this, this.game));
        return true;
    }

    upgradeWeapon(weaponId) {
        const w = this.weapons.find(x => x.id === weaponId);
        if (w) { w.levelUp(); return true; }
        return false;
    }

    hasWeapon(weaponId) { return this.weapons.some(w => w.id === weaponId); }
    hasPassive(passiveId) { return this.passives.includes(passiveId); }

    gainXP(amount) {
        this.xp += amount;
        // XP-Orb Sammel-Sound (gedrosselt)
        if (Math.random() < 0.3) this.game.audio.play('xpCollect');
        while (this.xp >= this.xpThreshold) {
            this.xp -= this.xpThreshold;
            this._levelUp();
        }
    }

    _levelUp() {
        this.level++;
        this.xpThreshold = Math.round(10 * Math.pow(this.level, 1.4));
        this.pulseTimer = 0.6;
        this.game.particles.levelUp(this.x, this.y);
        this.game.audio.play('levelUp');
        this.game.setState('levelUp');
    }

    takeDamage(amount, sourceX, sourceY, game) {
        if (this.dead || this.iframes > 0) return;
        this.hp -= amount;
        this.iframes = this.stats.iframeDuration;
        this.flashTimer = 0.2;

        game.camera.shake(5, 0.22);
        game.triggerDamageFlash();
        game.audio.play('playerHit');
        game.particles.hit(this.x, this.y, '#e05252', 7);
        game.addFloatingText(this.x, this.y - this.radius - 8, '-' + Math.round(amount), '#e05252', 13);

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }

    update(dt) {
        this.iframes = Math.max(0, this.iframes - dt);
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.pulseTimer = Math.max(0, this.pulseTimer - dt);

        // Regeneration
        if (this.stats.regen > 0) {
            this.regenTimer += dt;
            if (this.regenTimer >= 1) {
                this.regenTimer -= 1;
                this.hp = Math.min(this.maxHp, this.hp + this.stats.regen);
            }
        }

        // Bewegung
        const mv = this.game.input.getMovementVector();
        const speed = this.baseSpeed * this.stats.speedMult;
        this.x += mv.x * speed * dt;
        this.y += mv.y * speed * dt;

        if (mv.x !== 0 || mv.y !== 0) {
            this.lastMoveAngle = Math.atan2(mv.y, mv.x);
        }

        // Facing zum nächsten Feind
        const nearest = this._nearestEnemy();
        if (nearest) this.angle = angle(this.x, this.y, nearest.x, nearest.y);

        this.innerAngle += dt * 2.2;

        // Waffen aktualisieren
        for (const w of this.weapons) w.update(dt);

        // Granaten
        if (this.game.grenades && this.game.grenades.length > 0) {
            ResinGrenade.updateGrenades(this.game.grenades, this.game);
        }
    }

    _nearestEnemy() {
        let best = null, bestDist = Infinity;
        for (const e of this.game.enemies) {
            if (e.dead) continue;
            const d = distanceSq(this.x, this.y, e.x, e.y);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }

    render(ctx) {
        // Waffen-Renders (Auren, Orbitale, etc.)
        for (const w of this.weapons) w.render(ctx);

        // Granaten
        if (this.game.grenades) ResinGrenade.renderGrenades(this.game.grenades, ctx);

        // Iframe-Flackern
        if (this.iframes > 0 && Math.floor(this.iframes * 22) % 2 === 0) return;

        const r = this.radius;

        // Level-Up-Puls-Ring
        if (this.pulseTimer > 0) {
            const pct = 1 - this.pulseTimer / 0.6;
            withAlpha(ctx, (1 - pct) * 0.8, () => {
                setGlow(ctx, '#c9a227', 20);
                strokeCircle(ctx, this.x, this.y, r + pct * 55, '#c9a227', 3);
                clearGlow(ctx);
            });
        }

        // Äußerer Glow-Ring
        if (this.flashTimer > 0) {
            setGlow(ctx, '#e05252', 22);
            strokeCircle(ctx, this.x, this.y, r + 5, '#ff4444', 2.5);
            clearGlow(ctx);
        } else {
            setGlow(ctx, '#3ddc6e', 18);
            strokeCircle(ctx, this.x, this.y, r + 4, '#3ddc6e', 1.5);
            clearGlow(ctx);
        }

        // Hexagon-Körper
        setGlow(ctx, '#1f6b3a', 10);
        drawPolygon(ctx, this.x, this.y, 6, r, this.innerAngle * 0.14, '#0d2e14', '#2a5e30', 2);
        clearGlow(ctx);

        // Innere rotierende Raute
        setGlow(ctx, '#3ddc6e', 14);
        drawPolygon(ctx, this.x, this.y, 4, r * 0.42, this.innerAngle, '#3ddc6e', null);
        clearGlow(ctx);

        // Richtungspunkt
        const fx = this.x + Math.cos(this.angle) * r * 0.65;
        const fy = this.y + Math.sin(this.angle) * r * 0.65;
        fillCircle(ctx, fx, fy, 3, '#7fffa0');
    }
}
