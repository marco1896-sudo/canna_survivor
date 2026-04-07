// Upgrade system — generates level-up choices and applies them

class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.choices = [];
    }

    generateChoices() {
        const player = this.game.player;
        const pool = this._buildPool(player);

        // Shuffle pool
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        this.choices = pool.slice(0, 3);
    }

    _buildPool(player) {
        const pool = [];

        // Check evolutions first (highest priority)
        for (const w of player.weapons) {
            if (w.level >= 8) {
                const def = WEAPON_DEFS[w.id];
                if (def && def.evolvesWith && player.hasPassive(def.evolvesWith) && !player.hasWeapon(def.evolvedId)) {
                    pool.push({
                        type: 'evolution',
                        weaponId: w.id,
                        evolvedId: def.evolvedId,
                        name: EVOLVED_WEAPON_DEFS[def.evolvedId]?.name || 'Evolved Weapon',
                        description: EVOLVED_WEAPON_DEFS[def.evolvedId]?.description || 'Weapon evolution.',
                        rarity: 'epic',
                        icon: def.evolvedId,
                        apply: (p) => this._applyEvolution(p, w.id, def.evolvedId)
                    });
                }
            }
        }

        // Existing weapons that can be leveled up
        for (const w of player.weapons) {
            if (w.level < 8) {
                const def = WEAPON_DEFS[w.id];
                if (!def) continue;
                pool.push({
                    type: 'weapon',
                    weaponId: w.id,
                    name: def.name + ' Lv.' + (w.level + 1),
                    description: def.levelDescriptions ? def.levelDescriptions[w.level] || '+Upgrade' : '+Upgrade',
                    rarity: w.level >= 6 ? 'epic' : w.level >= 3 ? 'rare' : 'common',
                    icon: w.id,
                    apply: (p) => p.upgradeWeapon(w.id)
                });
            }
        }

        // New weapons player doesn't have
        const allWeaponIds = Object.keys(WEAPON_DEFS);
        for (const wId of allWeaponIds) {
            if (!player.hasWeapon(wId) && player.weapons.length < 6) {
                const def = WEAPON_DEFS[wId];
                pool.push({
                    type: 'newWeapon',
                    weaponId: wId,
                    name: def.name,
                    description: def.levelDescriptions ? def.levelDescriptions[0] : 'New weapon',
                    rarity: 'common',
                    icon: wId,
                    apply: (p) => p.addWeapon(wId)
                });
            }
        }

        // Passives
        for (const passive of PASSIVE_DEFS) {
            const owned = player.hasPassive(passive.id);
            const stacks = player.passives.filter(id => id === passive.id).length;

            if (!owned || (passive.stackable && stacks < (passive.maxStacks || 1))) {
                // Don't offer catalysts unless weapon exists at max level
                if (passive.isCatalyst) {
                    const hasWeapon = player.hasWeapon(passive.catalystFor);
                    const weapon = player.weapons.find(w => w.id === passive.catalystFor);
                    if (!hasWeapon || !weapon || weapon.level < 6) continue;
                }

                pool.push({
                    type: 'passive',
                    passiveId: passive.id,
                    name: passive.name,
                    description: passive.description,
                    rarity: passive.rarity,
                    icon: passive.icon,
                    apply: (p) => {
                        p.passives.push(passive.id);
                        passive.apply(p);
                    }
                });
            }
        }

        // Garantierter Fallback — Notfallheilung
        if (pool.length === 0) {
            pool.push({
                type: 'passive',
                passiveId: 'emergency_heal',
                name: 'Notfall-Nährstoffdosis',
                description: '40 Lebenspunkte sofort wiederherstellen',
                rarity: 'common',
                icon: 'heal',
                apply: (p) => { p.hp = Math.min(p.maxHp, p.hp + 40); }
            });
        }

        return pool;
    }

    _applyEvolution(player, oldWeaponId, evolvedId) {
        // Remove old weapon
        const idx = player.weapons.findIndex(w => w.id === oldWeaponId);
        if (idx !== -1) {
            player.weapons.splice(idx, 1);
        }
        // Add evolved weapon (uses same class registry pattern)
        const EvolvedClass = EVOLVED_WEAPON_CLASSES[evolvedId];
        if (EvolvedClass) {
            player.weapons.push(new EvolvedClass(player, this.game));
        }
    }

    applyChoice(index) {
        const choice = this.choices[index];
        if (!choice) return;
        choice.apply(this.game.player);
        this.choices = [];
        this.game.setState('playing');
    }
}

// Evolved weapon class map (populated after evolved weapon files load, or inline here)
const EVOLVED_WEAPON_CLASSES = {};
