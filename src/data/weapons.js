// Waffen-Definitionen — Deutsch

const WEAPON_DEFS = {
    pollenBurst: {
        id: 'pollenBurst',
        name: 'Pollensalve',
        description: 'Feuert 3 Pollenprojektile im Fächer. Durchdringt Feinde.',
        color: '#c9e84a',
        glowColor: '#8fbc00',
        category: 'projectile',
        evolvesWith: 'windCharm',
        evolvedId: 'hurricaneSeeds',
        levelDescriptions: [
            'Basis: 3 Projektile, 1× Durchdringung',
            '+Schaden',
            '+1 Projektil (4 gesamt)',
            '+Schaden, 2× Durchdringung',
            '+1 Projektil (5 gesamt)',
            '+Schaden',
            '+1 Projektil (6 gesamt), 3× Durchdringung',
            'Max: Schnellere Feuerrate'
        ]
    },
    trichomeWhip: {
        id: 'trichomeWhip',
        name: 'Trichomschwinge',
        description: 'Kristallarme kreisen um den Spieler und treffen Feinde.',
        color: '#a8d8ea',
        glowColor: '#56b4e0',
        category: 'orbital',
        evolvesWith: 'crystalShard',
        evolvedId: 'prismaticBlade',
        levelDescriptions: [
            'Basis: 1 Arm, kurze Reichweite',
            '+Schaden',
            '+1 Arm (2 gesamt)',
            '+Reichweite, +Schaden',
            '+1 Arm (3 gesamt)',
            '+Rotationsgeschwindigkeit',
            '+1 Arm (4 gesamt)',
            'Max: +Schaden, maximale Rotation'
        ]
    },
    resinGrenade: {
        id: 'resinGrenade',
        name: 'Harzgranate',
        description: 'Wirft eine Granate, die explodiert und ein Verlangsamungsfeld hinterlässt.',
        color: '#c9a227',
        glowColor: '#e8c040',
        category: 'aoe',
        evolvesWith: 'stickyRoot',
        evolvedId: 'tarBomb',
        levelDescriptions: [
            'Basis: Kleine Explosion + Verlangsamungsfeld',
            '+Explosionsradius',
            '+Schaden',
            '+Felddauer',
            '+Radius, +Schaden',
            '+1 Granate pro Wurf',
            '+Schaden, stärkere Verlangsamung',
            'Max: Riesiger AOE, dauerhaftes Feld'
        ]
    },
    sporeCloud: {
        id: 'sporeCloud',
        name: 'Sporenwolke',
        description: 'Konstante Schadensaura um den Spieler.',
        color: '#7acc7a',
        glowColor: '#3ddc6e',
        category: 'aura',
        evolvesWith: 'myceliumNet',
        evolvedId: 'deathBloom',
        levelDescriptions: [
            'Basis: Tick alle 0,5s im kleinen Radius',
            '+Radius',
            '+Schaden pro Tick',
            '+Radius',
            '+Tick-Rate',
            '+Schaden, +Radius',
            '+Tick-Rate',
            'Max: Maximaler Radius, schnellster Tick'
        ]
    },
    myceliumTentacle: {
        id: 'myceliumTentacle',
        name: 'Myzelranke',
        description: 'Ranke springt kettenförmig zwischen bis zu 4 Feinden.',
        color: '#8b6f47',
        glowColor: '#b89060',
        category: 'chain',
        levelDescriptions: [
            'Basis: Kettet 2 Feinde',
            '+Schaden',
            'Kettet 3 Feinde',
            '+Schaden, schnelleres Feuer',
            'Kettet 4 Feinde',
            '+Schaden',
            'Schnelleres Feuer, +Schaden',
            'Max: Max. Ketten, hoher Schaden'
        ]
    },
    thcLaser: {
        id: 'thcLaser',
        name: 'THC-Laser',
        description: 'Lädt auf und feuert einen verheerenden Strahl durch alle Feinde.',
        color: '#ff6b6b',
        glowColor: '#ff0044',
        category: 'beam',
        levelDescriptions: [
            'Basis: 1,5s Strahl, mittlerer Schaden',
            '+Schaden',
            'Breiterer Strahl',
            '+Schaden, schnelleres Laden',
            'Breiterer Strahl',
            '+Schaden',
            'Noch schnelleres Laden',
            'Max: Maximaler Schaden, kürzeste Ladezeit'
        ]
    },
    cbdPulse: {
        id: 'cbdPulse',
        name: 'CBD-Schildpuls',
        description: 'Periodische Schockwelle, die Feinde zurückwirft und schadet.',
        color: '#80dfff',
        glowColor: '#00bcd4',
        category: 'defensive',
        levelDescriptions: [
            'Basis: Puls alle 3s',
            '+Rückstoßbereich',
            '+Schaden',
            'Puls alle 2,5s',
            '+Rückstoßkraft',
            '+Schaden',
            'Puls alle 2s',
            'Max: Maximaler Bereich, schnellster Puls'
        ]
    },
    terpeneSpray: {
        id: 'terpeneSpray',
        name: 'Terpenspray',
        description: 'Kegelförmiger Kurzreichweitenangriff. Hoher DPS, verlangsamt Feinde.',
        color: '#ffb347',
        glowColor: '#ff8c00',
        category: 'cone',
        levelDescriptions: [
            'Basis: Kegelangriff, Verlangsamung',
            '+Schaden',
            '+Kegelwinkel',
            '+Schaden, längere Verlangsamung',
            '+Reichweite',
            '+Schaden',
            '+Kegelwinkel, +Reichweite',
            'Max: Breitester Kegel, maximaler Schaden'
        ]
    },
    rootSnare: {
        id: 'rootSnare',
        name: 'Wurzelfalle',
        description: 'Platziert Wurzelfallen, die Feinde fixieren und schädigen.',
        color: '#4a7c59',
        glowColor: '#2d5e3a',
        category: 'trap',
        levelDescriptions: [
            'Basis: 2 Fallen, 2s Fixierung',
            '+Fallenschaden',
            '3 Fallen aktiv',
            '+Fixierdauer',
            '+Fallenschaden',
            '4 Fallen aktiv',
            '+Schaden, +Dauer',
            'Max: 5 Fallen, lange Fixierung, hoher Schaden'
        ]
    }
};

const EVOLVED_WEAPON_DEFS = {
    hurricaneSeeds: {
        id: 'hurricaneSeeds',
        name: 'Hurrikansamen',
        description: '[ EVOLUTION ] Feuert Samen in 360°-Spirale.',
        color: '#d4f542',
        glowColor: '#a0cc00',
        category: 'projectile'
    },
    prismaticBlade: {
        id: 'prismaticBlade',
        name: 'Prismaklinge',
        description: '[ EVOLUTION ] Drei orbitale Kristallklingen, durchdringend.',
        color: '#c8eeff',
        glowColor: '#7ae0ff',
        category: 'orbital'
    },
    tarBomb: {
        id: 'tarBomb',
        name: 'Teerbombe',
        description: '[ EVOLUTION ] Massiver AOE + permanente Teer-Verlangsamung.',
        color: '#d4a017',
        glowColor: '#ffcc00',
        category: 'aoe'
    },
    deathBloom: {
        id: 'deathBloom',
        name: 'Todesblüte',
        description: '[ EVOLUTION ] Riesige expandierende Ringaura, maximale Reichweite.',
        color: '#5eff7a',
        glowColor: '#00ff44',
        category: 'aura'
    }
};
