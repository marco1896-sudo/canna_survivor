// Spawn wave schedule
// Each entry: { time (seconds), type, count, interval (seconds between spawns) }
// SpawnSystem reads this list and fires entries when game time >= entry.time

const WAVE_SCHEDULE = [
    // --- 0:00 - 0:30: Tutorial calm ---
    { time: 0,   type: 'sporeCrawler', count: 4,  interval: 1.5 },
    { time: 8,   type: 'sporeCrawler', count: 5,  interval: 1.2 },
    { time: 18,  type: 'sporeCrawler', count: 6,  interval: 1.0 },

    // --- 0:30 - 2:00: Crawlers + first Brutes ---
    { time: 30,  type: 'sporeCrawler', count: 8,  interval: 0.8 },
    { time: 45,  type: 'bulbBrute',    count: 2,  interval: 2.0 },
    { time: 60,  type: 'sporeCrawler', count: 10, interval: 0.7 },
    { time: 75,  type: 'bulbBrute',    count: 3,  interval: 1.5 },
    { time: 90,  type: 'sporeCrawler', count: 12, interval: 0.6 },

    // --- 2:00 - 5:00: Shooters join ---
    { time: 120, type: 'petalShooter', count: 3,  interval: 2.0 },
    { time: 130, type: 'sporeCrawler', count: 14, interval: 0.5 },
    { time: 150, type: 'bulbBrute',    count: 4,  interval: 1.3 },
    { time: 170, type: 'petalShooter', count: 4,  interval: 1.5 },
    { time: 190, type: 'sporeCrawler', count: 16, interval: 0.5 },
    { time: 210, type: 'bulbBrute',    count: 4,  interval: 1.2 },
    { time: 240, type: 'petalShooter', count: 5,  interval: 1.2 },
    { time: 260, type: 'sporeCrawler', count: 18, interval: 0.4 },
    { time: 280, type: 'vineStrider',  count: 4,  interval: 1.0 },

    // --- 5:00: First boss wave ---
    { time: 300, type: 'sporeCrawler', count: 20, interval: 0.4 },
    { time: 305, type: 'rootGolem',    count: 1,  interval: 0 },

    // --- 5:00 - 10:00: Mid game escalation ---
    { time: 330, type: 'mycoSpawner',  count: 2,  interval: 3.0 },
    { time: 360, type: 'sporeCrawler', count: 20, interval: 0.35 },
    { time: 380, type: 'vineStrider',  count: 6,  interval: 0.8 },
    { time: 400, type: 'bulbBrute',    count: 5,  interval: 1.0 },
    { time: 420, type: 'petalShooter', count: 6,  interval: 1.0 },
    { time: 450, type: 'gasPod',       count: 3,  interval: 2.0 },
    { time: 480, type: 'sporeCrawler', count: 22, interval: 0.3 },
    { time: 500, type: 'mycoSpawner',  count: 3,  interval: 2.5 },
    { time: 520, type: 'vineStrider',  count: 8,  interval: 0.6 },
    { time: 540, type: 'petalShooter', count: 7,  interval: 0.9 },
    { time: 560, type: 'bulbBrute',    count: 6,  interval: 0.9 },

    // --- 10:00: Second boss + elite mix ---
    { time: 600, type: 'sporeCrawler', count: 25, interval: 0.3 },
    { time: 605, type: 'rootGolem',    count: 1,  interval: 0 },
    { time: 620, type: 'gasPod',       count: 5,  interval: 1.5 },

    // --- 10:00 - 20:00: All types, density increases ---
    { time: 660, type: 'sporeCrawler', count: 25, interval: 0.28 },
    { time: 680, type: 'vineStrider',  count: 10, interval: 0.5 },
    { time: 700, type: 'mycoSpawner',  count: 4,  interval: 2.0 },
    { time: 720, type: 'bulbBrute',    count: 7,  interval: 0.8 },
    { time: 750, type: 'gasPod',       count: 5,  interval: 1.2 },
    { time: 780, type: 'petalShooter', count: 8,  interval: 0.8 },
    { time: 810, type: 'sporeCrawler', count: 28, interval: 0.25 },
    { time: 840, type: 'mycoSpawner',  count: 4,  interval: 1.8 },
    { time: 870, type: 'vineStrider',  count: 12, interval: 0.4 },
    { time: 900, type: 'bulbBrute',    count: 8,  interval: 0.7 },

    // --- 15:00: Third boss ---
    { time: 900, type: 'rootGolem',    count: 2,  interval: 5.0 },

    // --- 20:00 - 30:00: Maximum chaos ---
    { time: 1200, type: 'sporeCrawler', count: 35, interval: 0.2 },
    { time: 1220, type: 'rootGolem',    count: 1,  interval: 0 },
    { time: 1240, type: 'vineStrider',  count: 15, interval: 0.35 },
    { time: 1260, type: 'mycoSpawner',  count: 5,  interval: 1.5 },
    { time: 1290, type: 'petalShooter', count: 10, interval: 0.7 },
    { time: 1320, type: 'gasPod',       count: 8,  interval: 1.0 },
    { time: 1350, type: 'bulbBrute',    count: 10, interval: 0.6 },
    { time: 1380, type: 'sporeCrawler', count: 40, interval: 0.18 },
    { time: 1410, type: 'rootGolem',    count: 2,  interval: 4.0 },
    { time: 1440, type: 'vineStrider',  count: 18, interval: 0.3 },
    { time: 1500, type: 'sporeCrawler', count: 45, interval: 0.15 },
    { time: 1560, type: 'rootGolem',    count: 3,  interval: 6.0 },
    { time: 1620, type: 'mycoSpawner',  count: 6,  interval: 1.2 },
    { time: 1680, type: 'sporeCrawler', count: 50, interval: 0.12 },
    { time: 1740, type: 'rootGolem',    count: 2,  interval: 4.0 },
    // Final minute — all out
    { time: 1750, type: 'sporeCrawler', count: 60, interval: 0.1 },
    { time: 1760, type: 'bulbBrute',    count: 12, interval: 0.5 },
    { time: 1770, type: 'vineStrider',  count: 20, interval: 0.25 }
];

// Continuous background spawn for filling gaps (always-on after game start)
const CONTINUOUS_SPAWN = [
    { minTime: 0,    maxTime: 300,  type: 'sporeCrawler', interval: 3.5, maxOnScreen: 25 },
    { minTime: 120,  maxTime: 600,  type: 'bulbBrute',    interval: 8.0, maxOnScreen: 8  },
    { minTime: 300,  maxTime: 1800, type: 'sporeCrawler', interval: 2.5, maxOnScreen: 60 },
    { minTime: 300,  maxTime: 1800, type: 'vineStrider',  interval: 5.0, maxOnScreen: 20 },
    { minTime: 600,  maxTime: 1800, type: 'petalShooter', interval: 6.0, maxOnScreen: 15 },
    { minTime: 600,  maxTime: 1800, type: 'gasPod',       interval: 12.0, maxOnScreen: 10 },
    { minTime: 900,  maxTime: 1800, type: 'mycoSpawner',  interval: 15.0, maxOnScreen: 6 }
];
