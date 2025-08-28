/**
 * Core LocalStorage Database Utility
 * Provides CRUD operations, schema inference, and data management for browser localStorage
 */

import { isValid } from 'date-fns';

/**
 * Data type inference utilities
 */
export const DataTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  JSON: 'json',
  ARRAY: 'array',
  NULL: 'null',
  UNDEFINED: 'undefined'
};

/**
 * Infers the data type of a value
 * @param {any} value - The value to analyze
 * @returns {string} The inferred data type
 */
export const inferDataType = (value) => {
  if (value === null) return DataTypes.NULL;
  if (value === undefined) return DataTypes.UNDEFINED;
  
  const type = typeof value;
  
  if (type === 'boolean') return DataTypes.BOOLEAN;
  if (type === 'number') return DataTypes.NUMBER;
  if (type === 'string') {
    // Check if it's a date string
    if (isDateString(value)) return DataTypes.DATE;
    return DataTypes.STRING;
  }
  
  if (Array.isArray(value)) return DataTypes.ARRAY;
  if (type === 'object') return DataTypes.JSON;
  
  return DataTypes.STRING; // fallback
};

/**
 * Checks if a string represents a valid date
 * @param {string} str - String to check
 * @returns {boolean} True if valid date string
 */
export const isDateString = (str) => {
  if (typeof str !== 'string') return false;
  
  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
  ];
  
  const matchesPattern = datePatterns.some(pattern => pattern.test(str));
  if (!matchesPattern) return false;
  
  try {
    const date = new Date(str);
    return isValid(date);
  } catch {
    return false;
  }
};

/**
 * Core LocalStorage Database Class
 */
export class LocalStorageDB {
  constructor(options = {}) {
    this.prefix = options.prefix || 'lsdb_';
    this.metaKey = `${this.prefix}metadata`;
    this.indexKey = `${this.prefix}index`;
    this.schemaKey = `${this.prefix}schemas`;
    
    this.initializeMetadata();
  }

  /**
   * Initialize metadata storage
   */
  initializeMetadata() {
    if (!localStorage.getItem(this.metaKey)) {
      const metadata = {
        version: '1.0.0',
        created: new Date().toISOString(),
        tables: {},
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(this.metaKey, JSON.stringify(metadata));
    }
  }

  /**
   * Get metadata object
   * @returns {Object} Database metadata
   */
  getMetadata() {
    try {
      return JSON.parse(localStorage.getItem(this.metaKey) || '{}');
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return {};
    }
  }

  /**
   * Update metadata
   * @param {Object} updates - Partial metadata updates
   */
  updateMetadata(updates) {
    const metadata = this.getMetadata();
    const newMetadata = {
      ...metadata,
      ...updates,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(this.metaKey, JSON.stringify(newMetadata));
  }

  /**
   * Discover all available tables from localStorage
   * @returns {Array} Array of table names
   */
  discoverTables() {
    const metadata = this.getMetadata();
    
    // Only return tables that are registered in metadata
    if (metadata.tables) {
      return Object.keys(metadata.tables).sort();
    }
    
    return [];
  }

  /**
   * Get data from a table (localStorage key)
   * @param {string} tableName - Name of the table
   * @returns {any} The stored data
   */
  getTable(tableName) {
    try {
      const rawData = localStorage.getItem(tableName);
      if (rawData === null) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(rawData);
      } catch {
        return rawData;
      }
    } catch (error) {
      console.error(`Error reading table ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Set data to a table
   * @param {string} tableName - Name of the table
   * @param {any} data - Data to store
   * @returns {boolean} Success status
   */
  setTable(tableName, data) {
    try {
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(tableName, serializedData);
      
      // Update metadata
      const metadata = this.getMetadata();
      metadata.tables[tableName] = {
        lastModified: new Date().toISOString(),
        size: serializedData.length,
        type: inferDataType(data)
      };
      this.updateMetadata(metadata);
      
      return true;
    } catch (error) {
      console.error(`Error writing table ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Delete a table
   * @param {string} tableName - Name of the table to delete
   * @returns {boolean} Success status
   */
  deleteTable(tableName) {
    try {
      localStorage.removeItem(tableName);
      
      // Update metadata
      const metadata = this.getMetadata();
      delete metadata.tables[tableName];
      this.updateMetadata(metadata);
      
      return true;
    } catch (error) {
      console.error(`Error deleting table ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Insert a record into a table
   * @param {string} tableName - Name of the table
   * @param {Object} record - Record to insert
   * @returns {boolean} Success status
   */
  insert(tableName, record) {
    try {
      // Get existing data or create empty array
      const existingData = this.getTable(tableName);
      const tableData = Array.isArray(existingData) ? existingData : [];
      
      // Add the new record
      tableData.push(record);
      
      // Save back to storage
      return this.setTable(tableName, tableData);
    } catch (error) {
      console.error(`Error inserting record into ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Select records from a table
   * @param {string} tableName - Name of the table
   * @returns {Array} Array of records
   */
  select(tableName) {
    const data = this.getTable(tableName);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Delete a record from a table by ID
   * @param {string} tableName - Name of the table
   * @param {string} id - ID of the record to delete
   * @returns {boolean} Success status
   */
  delete(tableName, id) {
    try {
      const tableData = this.select(tableName);
      const filteredData = tableData.filter(record => record.id !== id);
      return this.setTable(tableName, filteredData);
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Set schema for a table
   * @param {string} tableName - Name of the table
   * @param {Object} schema - Schema definition
   * @returns {boolean} Success status
   */
  setSchema(tableName, schema) {
    try {
      const metadata = this.getMetadata();
      if (!metadata.tables) {
        metadata.tables = {};
      }
      if (!metadata.tables[tableName]) {
        metadata.tables[tableName] = {};
      }
      metadata.tables[tableName].schema = schema;
      this.updateMetadata(metadata);
      return true;
    } catch (error) {
      console.error(`Error setting schema for ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Get schema for a table
   * @param {string} tableName - Name of the table
   * @returns {Object|null} Schema definition or null if not found
   */
  getSchema(tableName) {
    try {
      const metadata = this.getMetadata();
      if (metadata.tables && metadata.tables[tableName] && metadata.tables[tableName].schema) {
        return metadata.tables[tableName].schema;
      }
      
      // If no explicit schema exists, try to infer one from the data
      const data = this.getTable(tableName);
      if (data && Array.isArray(data) && data.length > 0) {
        return this.inferSchemaFromTableData(tableName, data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting schema for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Infer schema from table data in the expected format
   * @param {string} tableName - Name of the table
   * @param {Array} data - Table data
   * @returns {Object} Inferred schema in the expected format
   */
  inferSchemaFromTableData(tableName, data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { fields: {} };
    }

    const fields = {};
    const sampleSize = Math.min(data.length, 10);

    // Get all unique field names from sample data
    const allFields = new Set();
    for (let i = 0; i < sampleSize; i++) {
      if (typeof data[i] === 'object' && data[i] !== null) {
        Object.keys(data[i]).forEach(key => allFields.add(key));
      }
    }

    // Analyze each field
    allFields.forEach(fieldName => {
      const fieldValues = [];
      let nullCount = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        const record = data[i];
        if (typeof record === 'object' && record !== null) {
          if (record[fieldName] === null || record[fieldName] === undefined) {
            nullCount++;
          } else {
            fieldValues.push(record[fieldName]);
          }
        }
      }

      // Determine field type
      let fieldType = 'string';
      if (fieldValues.length > 0) {
        const firstValue = fieldValues[0];
        if (typeof firstValue === 'number') {
          fieldType = 'number';
        } else if (typeof firstValue === 'boolean') {
          fieldType = 'boolean';
        } else if (firstValue instanceof Date || isDateString(String(firstValue))) {
          fieldType = 'date';
        } else if (Array.isArray(firstValue)) {
          fieldType = 'array';
        } else if (typeof firstValue === 'object') {
          fieldType = 'json';
        }
      }

      fields[fieldName] = {
        type: fieldType,
        required: nullCount === 0,
        nullable: nullCount > 0,
        primaryKey: fieldName === 'id' // Assume 'id' field is primary key
      };
    });

    return { fields };
  }

  /**
   * Infer schema from data
   * @param {any} data - Data to analyze
   * @returns {Object} Inferred schema
   */
  inferSchema(data) {
    const schema = {
      type: inferDataType(data),
      nullable: data === null || data === undefined,
      properties: {}
    };

    if (Array.isArray(data)) {
      schema.itemType = data.length > 0 ? inferDataType(data[0]) : DataTypes.STRING;
      
      // If array of objects, infer object schema
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        schema.properties = this.inferObjectSchema(data);
      }
    } else if (typeof data === 'object' && data !== null) {
      schema.properties = this.inferObjectSchema([data]);
    }

    return schema;
  }

  /**
   * Infer schema from array of objects
   * @param {Array} objects - Array of objects to analyze
   * @returns {Object} Schema for object properties
   */
  inferObjectSchema(objects) {
    const properties = {};
    const sampleSize = Math.min(objects.length, 10); // Sample first 10 items
    
    for (let i = 0; i < sampleSize; i++) {
      const obj = objects[i];
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          if (!properties[key]) {
            properties[key] = {
              type: inferDataType(obj[key]),
              nullable: false,
              frequency: 0
            };
          }
          properties[key].frequency++;
          
          // Handle nullable fields
          if (obj[key] === null || obj[key] === undefined) {
            properties[key].nullable = true;
          }
          
          // Handle type variations
          const currentType = inferDataType(obj[key]);
          if (properties[key].type !== currentType && obj[key] !== null && obj[key] !== undefined) {
            properties[key].type = DataTypes.STRING; // Default to string for mixed types
          }
        });
      }
    }
    
    return properties;
  }

  /**
   * Get schema for a table
   * @param {string} tableName - Name of the table
   * @returns {Object} Table schema
   */
  getTableSchema(tableName) {
    const data = this.getTable(tableName);
    if (data === null) return null;
    
    return this.inferSchema(data);
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage statistics
   */
  getStorageStats() {
    let totalSize = 0;
    let usedKeys = 0;
    const tables = this.discoverTables();
    
    tables.forEach(tableName => {
      const data = localStorage.getItem(tableName);
      if (data) {
        totalSize += data.length;
        usedKeys++;
      }
    });
    
    // Estimate available space (localStorage typically 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    const usedPercent = (totalSize / estimatedLimit) * 100;
    
    return {
      totalSize,
      usedKeys,
      estimatedLimit,
      usedPercent: Math.min(usedPercent, 100),
      availableSpace: Math.max(estimatedLimit - totalSize, 0)
    };
  }

  /**
   * Clear all database tables (keeping metadata)
   * @returns {boolean} Success status
   */
  clearAllTables() {
    try {
      const tables = this.discoverTables();
      tables.forEach(tableName => {
        if (tableName !== this.metaKey && tableName !== this.indexKey && tableName !== this.schemaKey) {
          localStorage.removeItem(tableName);
        }
      });
      
      // Reset metadata
      this.updateMetadata({ tables: {} });
      return true;
    } catch (error) {
      console.error('Error clearing tables:', error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const localStorageDB = new LocalStorageDB();

/**
 * Utility functions for common operations
 */
export const dbUtils = {
  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is supported
   */
  isLocalStorageAvailable() {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate table name
   * @param {string} name - Table name to validate
   * @returns {Object} Validation result
   */
  validateTableName(name) {
    const errors = [];
    
    if (!name || typeof name !== 'string') {
      errors.push('Table name must be a non-empty string');
    } else {
      if (name.length < 1) errors.push('Table name cannot be empty');
      if (name.length > 100) errors.push('Table name too long (max 100 characters)');
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        errors.push('Table name can only contain letters, numbers, underscores, and hyphens');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};


export default LocalStorageDB;