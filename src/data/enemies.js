// Gegner-Definitionen — Deutsch

const ENEMY_DEFS = {
    sporeCrawler: {
        id: 'sporeCrawler',
        name: 'Sporenkriecher',
        hp: 18, speed: 105, damage: 8, radius: 10, xpValue: 3,
        color: '#6dbf67', glowColor: '#3ddc6e', deathColor: '#7fcc6e',
        hpScale: 1.4, damageScale: 1.2
    },
    bulbBrute: {
        id: 'bulbBrute',
        name: 'Zwiebelbrute',
        hp: 120, speed: 48, damage: 20, radius: 24, xpValue: 12,
        color: '#2e6b2e', glowColor: '#1a4a1a', deathColor: '#4a9a4a',
        hpScale: 1.5, damageScale: 1.15
    },
    petalShooter: {
        id: 'petalShooter',
        name: 'Blütenwerfer',
        hp: 45, speed: 60, damage: 10, radius: 14, xpValue: 8,
        color: '#e8a0b0', glowColor: '#cc5577', deathColor: '#ff80a0',
        projectileDamage: 12, projectileSpeed: 220, fireRate: 2.8,
        hpScale: 1.35, damageScale: 1.2
    },
    mycoSpawner: {
        id: 'mycoSpawner',
        name: 'Myzel-Säer',
        hp: 80, speed: 38, damage: 12, radius: 20, xpValue: 20,
        color: '#a07850', glowColor: '#c8a060', deathColor: '#d4b070',
        spawnRate: 5.0, maxSpawns: 4,
        hpScale: 1.45, damageScale: 1.1
    },
    vineStrider: {
        id: 'vineStrider',
        name: 'Rankenstürmer',
        hp: 35, speed: 145, damage: 12, radius: 12, xpValue: 6,
        color: '#4ab87a', glowColor: '#2d9e60', deathColor: '#60cc88',
        hpScale: 1.38, damageScale: 1.25
    },
    gasPod: {
        id: 'gasPod',
        name: 'Gaskapsel',
        hp: 55, speed: 0, damage: 0, radius: 16, xpValue: 10,
        color: '#8bc34a', glowColor: '#7cb342', deathColor: '#aee060',
        triggerRadius: 100, explosionRadius: 120, explosionDamage: 25,
        hpScale: 1.3, damageScale: 1.2
    },
    rootGolem: {
        id: 'rootGolem',
        name: 'Wurzel-Golem',
        hp: 1800, speed: 35, damage: 30, radius: 48, xpValue: 200,
        color: '#3a5a2a', glowColor: '#2a4a1a', deathColor: '#6aaa4a',
        isBoss: true, phase2Threshold: 0.5,
        hpScale: 1.6, damageScale: 1.15
    }
};

const DIFFICULTY_SCALE = {
    hpFactor: 0.18,
    damageFactor: 0.08,
    speedFactor: 0.03
};
