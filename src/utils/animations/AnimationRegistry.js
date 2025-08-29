/**
 * Central registry for all animation effects
 * Enables dynamic loading and configuration of effects
 */
class AnimationRegistry {
  static effects = new Map();
  static categories = new Map();

  /**
   * Register a new animation effect
   * @param {string} name - Unique identifier for the effect
   * @param {class} effectClass - Class extending BaseAnimation
   * @param {object} metadata - Effect metadata (category, description, etc.)
   */
  static register(name, effectClass, metadata = {}) {
    if (this.effects.has(name)) {
      console.warn(`Animation effect '${name}' already registered. Overwriting...`);
    }

    this.effects.set(name, {
      class: effectClass,
      metadata: {
        name,
        category: metadata.category || 'misc',
        description: metadata.description || '',
        version: metadata.version || '1.0.0',
        dependencies: metadata.dependencies || [],
        ...metadata
      }
    });

    // Update category registry
    const category = metadata.category || 'misc';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);
  }

  /**
   * Create an instance of an animation effect
   * @param {string} name - Effect name
   * @param {object} options - Configuration options
   * @returns {BaseAnimation|null} Animation instance or null if not found
   */
  static create(name, options = {}) {
    const effect = this.effects.get(name);
    if (!effect) {
      console.error(`Animation effect '${name}' not found`);
      return null;
    }

    try {
      return new effect.class(options);
    } catch (error) {
      console.error(`Failed to create animation '${name}':`, error);
      return null;
    }
  }

  /**
   * Get all registered effect names
   * @returns {string[]} Array of effect names
   */
  static getEffectNames() {
    return Array.from(this.effects.keys());
  }

  /**
   * Get effects by category
   * @param {string} category - Category name
   * @returns {string[]} Array of effect names in category
   */
  static getEffectsByCategory(category) {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories
   * @returns {string[]} Array of category names
   */
  static getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Get effect metadata
   * @param {string} name - Effect name
   * @returns {object|null} Effect metadata or null
   */
  static getMetadata(name) {
    const effect = this.effects.get(name);
    return effect ? effect.metadata : null;
  }

  /**
   * Get configuration schema for an effect
   * @param {string} name - Effect name
   * @returns {object|null} Configuration schema or null
   */
  static getConfigSchema(name) {
    const effect = this.effects.get(name);
    if (!effect) return null;

    // Use static method if available, otherwise return base schema
    return effect.class.getConfigSchema ? effect.class.getConfigSchema() : {};
  }

  /**
   * Check if effect exists
   * @param {string} name - Effect name
   * @returns {boolean} True if effect is registered
   */
  static has(name) {
    return this.effects.has(name);
  }

  /**
   * Unregister an effect (useful for hot-reloading in development)
   * @param {string} name - Effect name
   */
  static unregister(name) {
    const effect = this.effects.get(name);
    if (effect) {
      // Remove from category
      const category = effect.metadata.category;
      const categoryEffects = this.categories.get(category);
      if (categoryEffects) {
        const index = categoryEffects.indexOf(name);
        if (index > -1) {
          categoryEffects.splice(index, 1);
        }
      }

      this.effects.delete(name);
    }
  }

  /**
   * Get effect statistics
   * @returns {object} Registry statistics
   */
  static getStats() {
    return {
      totalEffects: this.effects.size,
      categories: this.categories.size,
      categoriesBreakdown: Object.fromEntries(
        Array.from(this.categories.entries()).map(([cat, effects]) => [cat, effects.length])
      )
    };
  }
}

export default AnimationRegistry;