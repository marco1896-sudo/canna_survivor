// Spawn system — reads wave schedule and continuously spawns enemies

const ENEMY_CONSTRUCTORS = {
    sporeCrawler: SporeCrawler,
    bulbBrute: BulbBrute,
    petalShooter: PetalShooter,
    mycoSpawner: MycoSpawner,
    vineStrider: VineStrider,
    gasPod: GasPod,
    rootGolem: RootGolem
};

class SpawnSystem {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        // Wave queue — pending spawn events (sorted by time)
        this._waveQueue = [...WAVE_SCHEDULE].sort((a, b) => a.time - b.time);
        this._waveIndex = 0;

        // Continuous spawn timers — flat key: "type_interval"
        this._continuousTimers = {};
        for (const def of CONTINUOUS_SPAWN) {
            const key = def.type + '_' + def.interval;
            this._continuousTimers[key] = randomRange(0, def.interval);
        }

        // Batch spawner (when a wave triggers it spawns one per interval)
        this._activeBatches = []; // [ { type, remaining, interval, timer } ]
    }

    update(dt) {
        const time = this.game.time;

        // Process wave schedule
        while (this._waveIndex < this._waveQueue.length &&
               this._waveQueue[this._waveIndex].time <= time) {
            const wave = this._waveQueue[this._waveIndex];
            this._activeBatches.push({
                type: wave.type,
                remaining: wave.count,
                interval: wave.interval,
                timer: 0
            });
            this._waveIndex++;
        }

        // Spawn active batches
        for (let i = this._activeBatches.length - 1; i >= 0; i--) {
            const batch = this._activeBatches[i];
            batch.timer -= dt;
            if (batch.timer <= 0) {
                batch.timer = batch.interval;
                this._spawnOne(batch.type);
                batch.remaining--;
                if (batch.remaining <= 0) {
                    this._activeBatches.splice(i, 1);
                }
            }
        }

        // Continuous spawns
        for (const def of CONTINUOUS_SPAWN) {
            if (time < def.minTime || time > def.maxTime) continue;

            // Count existing enemies of this type
            const existing = this.game.enemies.filter(e => e.type === def.type && !e.dead).length;
            if (existing >= def.maxOnScreen) continue;

            const key = def.type + '_' + def.interval;
            this._continuousTimers[key] = (this._continuousTimers[key] || 0) - dt;
            if (this._continuousTimers[key] <= 0) {
                this._continuousTimers[key] = def.interval;
                this._spawnOne(def.type);
            }
        }
    }

    _spawnOne(type) {
        if (this.game.enemies.length >= 220) return; // hard cap

        const Constructor = ENEMY_CONSTRUCTORS[type];
        if (!Constructor) return;

        const pos = this._spawnPosition();
        const enemy = new Constructor(pos.x, pos.y, this.game);
        this.game.enemies.push(enemy);
    }

    // Spawn at a random off-screen position
    _spawnPosition() {
        const player = this.game.player;
        const cam = this.game.camera;
        const margin = 80;

        // Pick a random edge of the visible area + margin
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch (edge) {
            case 0: // top
                x = cam.x + randomRange(-margin, cam.width + margin);
                y = cam.y - margin;
                break;
            case 1: // right
                x = cam.x + cam.width + margin;
                y = cam.y + randomRange(-margin, cam.height + margin);
                break;
            case 2: // bottom
                x = cam.x + randomRange(-margin, cam.width + margin);
                y = cam.y + cam.height + margin;
                break;
            default: // left
                x = cam.x - margin;
                y = cam.y + randomRange(-margin, cam.height + margin);
                break;
        }

        return { x, y };
    }
}
