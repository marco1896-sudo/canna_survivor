// Upgrade-Pool — Deutsch

const PASSIVE_DEFS = [
    {
        id: 'growLight',
        name: 'Wachstumslicht',
        description: '+15% Waffenschaden',
        icon: 'growLight',
        rarity: 'common',
        stackable: false,
        apply(player) { player.stats.damageMult += 0.15; }
    },
    {
        id: 'hydroRoot',
        name: 'Hydrowurzel',
        description: '+22% Bewegungsgeschwindigkeit',
        icon: 'hydroRoot',
        rarity: 'common',
        stackable: false,
        apply(player) { player.stats.speedMult += 0.22; }
    },
    {
        id: 'leafArmor',
        name: 'Blattschild',
        description: '+35 max. Lebenspunkte (wird sofort geheilt)',
        icon: 'leafArmor',
        rarity: 'common',
        stackable: true,
        maxStacks: 3,
        apply(player) {
            player.maxHp += 35;
            player.hp = Math.min(player.hp + 35, player.maxHp);
        }
    },
    {
        id: 'resinCoat',
        name: 'Harzbeschichtung',
        description: '+0,4s Unverwundbarkeit nach Treffer',
        icon: 'resinCoat',
        rarity: 'rare',
        stackable: false,
        apply(player) { player.stats.iframeDuration += 0.4; }
    },
    {
        id: 'myceliumNetwork',
        name: 'Myzelnetzwerk',
        description: '+50% XP-Sammelradius',
        icon: 'myceliumNet',
        rarity: 'common',
        stackable: false,
        apply(player) { player.stats.pickupRadius += player.stats.pickupRadius * 0.5; }
    },
    {
        id: 'terpeneSynthesis',
        name: 'Terpensynthese',
        description: '-18% alle Waffenabklingzeiten',
        icon: 'terpSynth',
        rarity: 'rare',
        stackable: false,
        apply(player) { player.stats.cooldownMult *= 0.82; }
    },
    {
        id: 'regenerativeStalk',
        name: 'Regenerativer Stiel',
        description: 'Regeneriert 1,5 LP/s',
        icon: 'regen',
        rarity: 'rare',
        stackable: true,
        maxStacks: 2,
        apply(player) { player.stats.regen += 1.5; }
    },
    {
        id: 'pheremoneLure',
        name: 'Pheromonköder',
        description: 'Zieht nahe XP-Orbs automatisch an',
        icon: 'lure',
        rarity: 'common',
        stackable: false,
        apply(player) { player.stats.pickupRadius += 80; }
    },
    {
        id: 'chlorophyllBoost',
        name: 'Chlorophyllschub',
        description: '+25% Waffenreichweite',
        icon: 'chloro',
        rarity: 'rare',
        stackable: false,
        apply(player) { player.stats.rangeMult += 0.25; }
    },
    // Katalysatoren für Evolutionen
    {
        id: 'windCharm',
        name: 'Windzauber',
        description: 'Katalysator — ermöglicht Evolution der Pollensalve',
        icon: 'windCharm',
        rarity: 'epic',
        stackable: false,
        isCatalyst: true,
        catalystFor: 'pollenBurst',
        apply(player) { }
    },
    {
        id: 'crystalShard',
        name: 'Kristallsplitter',
        description: 'Katalysator — ermöglicht Evolution der Trichomschwinge',
        icon: 'crystalShard',
        rarity: 'epic',
        stackable: false,
        isCatalyst: true,
        catalystFor: 'trichomeWhip',
        apply(player) { }
    },
    {
        id: 'stickyRoot',
        name: 'Klebewurzel',
        description: 'Katalysator — ermöglicht Evolution der Harzgranate',
        icon: 'stickyRoot',
        rarity: 'epic',
        stackable: false,
        isCatalyst: true,
        catalystFor: 'resinGrenade',
        apply(player) { }
    },
    {
        id: 'myceliumNet',
        name: 'Myzelnetz',
        description: 'Katalysator — ermöglicht Evolution der Sporenwolke',
        icon: 'myceliumNet',
        rarity: 'epic',
        stackable: false,
        isCatalyst: true,
        catalystFor: 'sporeCloud',
        apply(player) { }
    }
];

const RARITY_COLORS = {
    common: '#7acc7a',
    rare:   '#5090e8',
    epic:   '#b060e8'
};

const RARITY_LABELS = {
    common: 'NORMAL',
    rare:   'SELTEN',
    epic:   'EPISCH'
};
