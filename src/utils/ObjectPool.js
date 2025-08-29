/**
 * Object Pool Implementation for Performance Optimization
 * Reduces garbage collection by reusing objects in simulations
 */

class ObjectPool {
  constructor(createFn, resetFn, maxSize = 1000) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
    this.inUse = new Set();
    this.totalCreated = 0;
    this.totalAcquired = 0;
    this.totalReleased = 0;
    this.peakUsage = 0;
  }

  acquire() {
    this.totalAcquired++;
    let obj;

    if (this.pool.length > 0) {
      obj = this.pool.pop();
      if (this.resetFn) {
        this.resetFn(obj);
      }
    } else {
      obj = this.createFn();
      this.totalCreated++;
    }

    this.inUse.add(obj);
    this.peakUsage = Math.max(this.peakUsage, this.inUse.size);
    return obj;
  }

  release(obj) {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not acquired from this pool');
      return;
    }

    this.inUse.delete(obj);
    this.totalReleased++;

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
    // If pool is at max capacity, let object be garbage collected
  }

  releaseAll() {
    this.inUse.forEach(obj => {
      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
      }
    });
    this.totalReleased += this.inUse.size;
    this.inUse.clear();
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      totalCreated: this.totalCreated,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      peakUsage: this.peakUsage,
      hitRatio: this.totalAcquired > 0 ? 
        ((this.totalAcquired - this.totalCreated) / this.totalAcquired) : 0
    };
  }

  clear() {
    this.pool.length = 0;
    this.inUse.clear();
  }

  destroy() {
    this.clear();
    this.createFn = null;
    this.resetFn = null;
  }
}

// Specialized pools for common simulation entities

class Vector2DPool extends ObjectPool {
  constructor(maxSize = 500) {
    super(
      () => ({ x: 0, y: 0 }),
      (obj) => { obj.x = 0; obj.y = 0; },
      maxSize
    );
  }

  acquireVector(x = 0, y = 0) {
    const vector = this.acquire();
    vector.x = x;
    vector.y = y;
    return vector;
  }
}

class ParticlePool extends ObjectPool {
  constructor(maxSize = 1000) {
    super(
      () => ({
        id: '',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        mass: 1,
        radius: 1,
        color: '#ffffff',
        alpha: 1,
        life: 1,
        maxLife: 1,
        active: true,
        type: 'particle'
      }),
      (obj) => {
        obj.id = '';
        obj.x = 0;
        obj.y = 0;
        obj.vx = 0;
        obj.vy = 0;
        obj.ax = 0;
        obj.ay = 0;
        obj.mass = 1;
        obj.radius = 1;
        obj.color = '#ffffff';
        obj.alpha = 1;
        obj.life = 1;
        obj.maxLife = 1;
        obj.active = true;
        obj.type = 'particle';
      },
      maxSize
    );
  }

  acquireParticle(config = {}) {
    const particle = this.acquire();
    Object.assign(particle, config);
    if (!particle.id) {
      particle.id = `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return particle;
  }
}

class CellPool extends ObjectPool {
  constructor(maxSize = 10000) {
    super(
      () => ({
        x: 0,
        y: 0,
        alive: false,
        age: 0,
        neighbors: 0,
        nextState: false,
        generation: 0
      }),
      (obj) => {
        obj.x = 0;
        obj.y = 0;
        obj.alive = false;
        obj.age = 0;
        obj.neighbors = 0;
        obj.nextState = false;
        obj.generation = 0;
      },
      maxSize
    );
  }

  acquireCell(x, y, alive = false) {
    const cell = this.acquire();
    cell.x = x;
    cell.y = y;
    cell.alive = alive;
    return cell;
  }
}

// Global pool manager
class PoolManager {
  constructor() {
    this.pools = new Map();
    this.totalMemorySaved = 0;
    this.startTime = performance.now();
  }

  createPool(name, createFn, resetFn, maxSize = 1000) {
    if (this.pools.has(name)) {
      console.warn(`Pool '${name}' already exists`);
      return this.pools.get(name);
    }

    const pool = new ObjectPool(createFn, resetFn, maxSize);
    this.pools.set(name, pool);
    return pool;
  }

  getPool(name) {
    return this.pools.get(name);
  }

  releaseAllPools() {
    this.pools.forEach(pool => pool.releaseAll());
  }

  clearAllPools() {
    this.pools.forEach(pool => pool.clear());
  }

  destroyAllPools() {
    this.pools.forEach(pool => pool.destroy());
    this.pools.clear();
  }

  getGlobalStats() {
    const stats = {
      poolCount: this.pools.size,
      totalInUse: 0,
      totalPooled: 0,
      totalCreated: 0,
      totalHitRatio: 0,
      uptime: performance.now() - this.startTime,
      pools: {}
    };

    let totalAcquired = 0;
    let totalObjectsCreated = 0;

    this.pools.forEach((pool, name) => {
      const poolStats = pool.getStats();
      stats.pools[name] = poolStats;
      stats.totalInUse += poolStats.inUse;
      stats.totalPooled += poolStats.poolSize;
      stats.totalCreated += poolStats.totalCreated;
      totalAcquired += poolStats.totalAcquired;
      totalObjectsCreated += poolStats.totalCreated;
    });

    stats.totalHitRatio = totalAcquired > 0 ? 
      ((totalAcquired - totalObjectsCreated) / totalAcquired) : 0;

    return stats;
  }

  // Memory pressure relief
  performCleanup(threshold = 0.8) {
    const stats = this.getGlobalStats();
    this.pools.forEach((pool, name) => {
      const poolStats = pool.getStats();
      const usage = poolStats.inUse / pool.maxSize;
      
      if (usage < threshold && pool.pool.length > pool.maxSize * 0.5) {
        // Reduce pool size if usage is low
        const targetSize = Math.max(10, Math.floor(pool.maxSize * 0.3));
        pool.pool.length = targetSize;
        console.log(`🧹 Cleaned up pool '${name}', reduced to ${targetSize} objects`);
      }
    });
  }
}

// Create global instance
const globalPoolManager = new PoolManager();

// Pre-create common pools
const vector2DPool = new Vector2DPool();
const particlePool = new ParticlePool();
const cellPool = new CellPool();

globalPoolManager.pools.set('vector2d', vector2DPool);
globalPoolManager.pools.set('particle', particlePool);
globalPoolManager.pools.set('cell', cellPool);

// Export pools and manager
export {
  ObjectPool,
  Vector2DPool,
  ParticlePool,
  CellPool,
  PoolManager,
  globalPoolManager,
  vector2DPool,
  particlePool,
  cellPool
};

export default globalPoolManager;