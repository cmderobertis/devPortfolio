/**
 * Schema Management Utilities
 * Handles schema validation, constraint enforcement, and relationship mapping
 */

import { localStorageDB, DataTypes, inferDataType } from './localStorageDB.js';
import { isValid, parseISO } from 'date-fns';

/**
 * Schema constraint types
 */
export const ConstraintTypes = {
  REQUIRED: 'required',
  UNIQUE: 'unique',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN_VALUE: 'minValue',
  MAX_VALUE: 'maxValue',
  PATTERN: 'pattern',
  ENUM: 'enum',
  FOREIGN_KEY: 'foreignKey',
  DEFAULT: 'default'
};

/**
 * Relationship types for ERD
 */
export const RelationshipTypes = {
  ONE_TO_ONE: 'oneToOne',
  ONE_TO_MANY: 'oneToMany',
  MANY_TO_ONE: 'manyToOne',
  MANY_TO_MANY: 'manyToMany'
};

/**
 * Schema Manager Class
 */
export class SchemaManager {
  constructor() {
    this.schemas = this.loadSchemas();
    this.relationships = this.loadRelationships();
  }

  /**
   * Load schemas from localStorage
   * @returns {Object} Stored schemas
   */
  loadSchemas() {
    try {
      const stored = localStorage.getItem(localStorageDB.schemaKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading schemas:', error);
      return {};
    }
  }

  /**
   * Save schemas to localStorage
   */
  saveSchemas() {
    try {
      localStorage.setItem(localStorageDB.schemaKey, JSON.stringify(this.schemas));
    } catch (error) {
      console.error('Error saving schemas:', error);
    }
  }

  /**
   * Load relationships from localStorage
   * @returns {Object} Stored relationships
   */
  loadRelationships() {
    try {
      const relationshipKey = `${localStorageDB.prefix}relationships`;
      const stored = localStorage.getItem(relationshipKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading relationships:', error);
      return {};
    }
  }

  /**
   * Save relationships to localStorage
   */
  saveRelationships() {
    try {
      const relationshipKey = `${localStorageDB.prefix}relationships`;
      localStorage.setItem(relationshipKey, JSON.stringify(this.relationships));
    } catch (error) {
      console.error('Error saving relationships:', error);
    }
  }

  /**
   * Define schema for a table
   * @param {string} tableName - Name of the table
   * @param {Object} schema - Schema definition
   * @returns {boolean} Success status
   */
  defineSchema(tableName, schema) {
    try {
      const validatedSchema = this.validateSchemaDefinition(schema);
      if (!validatedSchema.valid) {
        console.error('Invalid schema:', validatedSchema.errors);
        return false;
      }

      this.schemas[tableName] = {
        ...schema,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.saveSchemas();
      return true;
    } catch (error) {
      console.error('Error defining schema:', error);
      return false;
    }
  }

  /**
   * Get schema for a table
   * @param {string} tableName - Name of the table
   * @returns {Object|null} Schema definition
   */
  getSchema(tableName) {
    return this.schemas[tableName] || null;
  }

  /**
   * Remove schema for a table
   * @param {string} tableName - Name of the table
   * @returns {boolean} Success status
   */
  removeSchema(tableName) {
    if (this.schemas[tableName]) {
      delete this.schemas[tableName];
      this.saveSchemas();
      return true;
    }
    return false;
  }

  /**
   * Auto-generate schema from existing data
   * @param {string} tableName - Name of the table
   * @param {Object} options - Generation options
   * @returns {Object} Generated schema
   */
  generateSchema(tableName, options = {}) {
    const data = localStorageDB.getTable(tableName);
    if (!data) return null;

    const records = Array.isArray(data) ? data : [data];
    if (records.length === 0) return null;

    const schema = {
      tableName,
      type: 'object',
      properties: {},
      constraints: {},
      indexes: [],
      generatedAt: new Date().toISOString()
    };

    // Analyze sample of records
    const sampleSize = Math.min(records.length, options.sampleSize || 100);
    const sample = records.slice(0, sampleSize);

    // Collect all property names
    const allProperties = new Set();
    sample.forEach(record => {
      if (typeof record === 'object' && record !== null) {
        Object.keys(record).forEach(key => allProperties.add(key));
      }
    });

    // Analyze each property
    allProperties.forEach(propName => {
      const analysis = this.analyzeProperty(sample, propName);
      schema.properties[propName] = analysis.schema;
      
      if (analysis.constraints.length > 0) {
        schema.constraints[propName] = analysis.constraints;
      }
    });

    // Auto-detect potential indexes
    schema.indexes = this.suggestIndexes(sample, schema.properties);

    // Auto-detect relationships
    this.detectRelationships(tableName, schema);

    return schema;
  }

  /**
   * Analyze a single property across records
   * @param {Array} records - Sample records
   * @param {string} propName - Property name
   * @returns {Object} Property analysis
   */
  analyzeProperty(records, propName) {
    const values = records
      .map(record => record[propName])
      .filter(val => val !== undefined);

    const nonNullValues = values.filter(val => val !== null);
    const uniqueValues = [...new Set(nonNullValues)];

    const analysis = {
      schema: {
        type: DataTypes.STRING,
        nullable: values.length !== nonNullValues.length
      },
      constraints: []
    };

    if (nonNullValues.length === 0) {
      return analysis;
    }

    // Infer primary type
    const types = nonNullValues.map(val => inferDataType(val));
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const primaryType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    );

    analysis.schema.type = primaryType;

    // Check if required (present in all records)
    if (values.length === records.length && nonNullValues.length === values.length) {
      analysis.constraints.push({ type: ConstraintTypes.REQUIRED });
    }

    // Check if unique
    if (uniqueValues.length === nonNullValues.length && nonNullValues.length > 1) {
      analysis.constraints.push({ type: ConstraintTypes.UNIQUE });
    }

    // Type-specific analysis
    switch (primaryType) {
      case DataTypes.STRING:
        this.analyzeStringProperty(nonNullValues, analysis);
        break;
      case DataTypes.NUMBER:
        this.analyzeNumberProperty(nonNullValues, analysis);
        break;
      case DataTypes.DATE:
        this.analyzeDateProperty(nonNullValues, analysis);
        break;
    }

    // Check for enum-like patterns
    if (uniqueValues.length <= 10 && nonNullValues.length > uniqueValues.length * 2) {
      analysis.constraints.push({
        type: ConstraintTypes.ENUM,
        values: uniqueValues
      });
    }

    return analysis;
  }

  /**
   * Analyze string property patterns
   * @param {Array} values - String values
   * @param {Object} analysis - Analysis object to update
   */
  analyzeStringProperty(values, analysis) {
    const lengths = values.map(val => String(val).length);
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);

    if (minLength > 0) {
      analysis.constraints.push({
        type: ConstraintTypes.MIN_LENGTH,
        value: minLength
      });
    }

    if (maxLength < 1000) { // Only set max length for reasonable values
      analysis.constraints.push({
        type: ConstraintTypes.MAX_LENGTH,
        value: maxLength
      });
    }

    // Common patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlPattern = /^https?:\/\/.+/;
    const phonePattern = /^\+?[\d\s\-\(\)]{10,}$/;

    if (values.every(val => emailPattern.test(val))) {
      analysis.schema.format = 'email';
      analysis.constraints.push({
        type: ConstraintTypes.PATTERN,
        value: emailPattern.source,
        description: 'Email format'
      });
    } else if (values.every(val => urlPattern.test(val))) {
      analysis.schema.format = 'url';
    } else if (values.every(val => phonePattern.test(val))) {
      analysis.schema.format = 'phone';
    }
  }

  /**
   * Analyze number property ranges
   * @param {Array} values - Number values
   * @param {Object} analysis - Analysis object to update
   */
  analyzeNumberProperty(values, analysis) {
    const numbers = values.map(val => Number(val)).filter(num => !isNaN(num));
    if (numbers.length === 0) return;

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    analysis.constraints.push(
      { type: ConstraintTypes.MIN_VALUE, value: min },
      { type: ConstraintTypes.MAX_VALUE, value: max }
    );

    // Check if all integers
    if (numbers.every(num => Number.isInteger(num))) {
      analysis.schema.subtype = 'integer';
    }
  }

  /**
   * Analyze date property ranges
   * @param {Array} values - Date values
   * @param {Object} analysis - Analysis object to update
   */
  analyzeDateProperty(values, analysis) {
    const dates = values
      .map(val => new Date(val))
      .filter(date => isValid(date));

    if (dates.length === 0) return;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    analysis.constraints.push(
      { type: ConstraintTypes.MIN_VALUE, value: minDate.toISOString() },
      { type: ConstraintTypes.MAX_VALUE, value: maxDate.toISOString() }
    );
  }

  /**
   * Suggest indexes based on data patterns
   * @param {Array} records - Sample records
   * @param {Object} properties - Property schemas
   * @returns {Array} Suggested indexes
   */
  suggestIndexes(records, properties) {
    const indexes = [];

    Object.entries(properties).forEach(([propName, propSchema]) => {
      // Suggest index for unique fields
      if (propSchema.unique) {
        indexes.push({
          name: `idx_${propName}`,
          fields: [propName],
          unique: true,
          reason: 'Unique constraint'
        });
      }

      // Suggest index for frequently queried fields (heuristic)
      if (propName.toLowerCase().includes('id') || 
          propName.toLowerCase().includes('email') ||
          propName.toLowerCase().includes('username')) {
        indexes.push({
          name: `idx_${propName}`,
          fields: [propName],
          reason: 'Commonly queried field'
        });
      }
    });

    return indexes;
  }

  /**
   * Detect potential relationships between tables
   * @param {string} tableName - Current table name
   * @param {Object} schema - Table schema
   */
  detectRelationships(tableName, schema) {
    const tables = localStorageDB.discoverTables();
    const otherTables = tables.filter(name => name !== tableName);

    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      // Look for foreign key patterns
      if (propName.toLowerCase().endsWith('id') || 
          propName.toLowerCase().endsWith('_id')) {
        
        const referencedTable = propName
          .replace(/id$/i, '')
          .replace(/_id$/i, '');

        // Check if referenced table exists
        const matchingTable = otherTables.find(table => 
          table.toLowerCase().includes(referencedTable.toLowerCase())
        );

        if (matchingTable) {
          this.addRelationship({
            fromTable: tableName,
            fromField: propName,
            toTable: matchingTable,
            toField: 'id', // Assume primary key is 'id'
            type: RelationshipTypes.MANY_TO_ONE,
            confidence: 0.8
          });
        }
      }
    });
  }

  /**
   * Add a relationship between tables
   * @param {Object} relationship - Relationship definition
   */
  addRelationship(relationship) {
    const key = `${relationship.fromTable}.${relationship.fromField}`;
    this.relationships[key] = {
      ...relationship,
      createdAt: new Date().toISOString()
    };
    this.saveRelationships();
  }

  /**
   * Get relationships for a table
   * @param {string} tableName - Table name
   * @returns {Array} Relationships involving the table
   */
  getTableRelationships(tableName) {
    return Object.values(this.relationships).filter(rel => 
      rel.fromTable === tableName || rel.toTable === tableName
    );
  }

  /**
   * Validate data against schema
   * @param {string} tableName - Table name
   * @param {any} data - Data to validate
   * @returns {Object} Validation result
   */
  validateData(tableName, data) {
    const schema = this.getSchema(tableName);
    if (!schema) {
      return { valid: true, errors: [], warnings: ['No schema defined'] };
    }

    const errors = [];
    const warnings = [];

    if (Array.isArray(data)) {
      data.forEach((record, index) => {
        const recordErrors = this.validateRecord(schema, record, `Record ${index}`);
        errors.push(...recordErrors);
      });
    } else {
      errors.push(...this.validateRecord(schema, data, 'Data'));
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single record against schema
   * @param {Object} schema - Schema definition
   * @param {Object} record - Record to validate
   * @param {string} context - Context for error messages
   * @returns {Array} Validation errors
   */
  validateRecord(schema, record, context = 'Record') {
    const errors = [];

    if (typeof record !== 'object' || record === null) {
      errors.push(`${context}: Expected object, got ${typeof record}`);
      return errors;
    }

    // Check required fields
    Object.entries(schema.properties || {}).forEach(([propName, propSchema]) => {
      const constraints = schema.constraints[propName] || [];
      const value = record[propName];

      // Required constraint
      const requiredConstraint = constraints.find(c => c.type === ConstraintTypes.REQUIRED);
      if (requiredConstraint && (value === undefined || value === null)) {
        errors.push(`${context}.${propName}: Required field is missing`);
        return;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        const expectedType = propSchema.type;
        const actualType = inferDataType(value);
        
        if (actualType !== expectedType && expectedType !== DataTypes.STRING) {
          errors.push(`${context}.${propName}: Expected ${expectedType}, got ${actualType}`);
        }

        // Constraint validation
        constraints.forEach(constraint => {
          const error = this.validateConstraint(value, constraint, `${context}.${propName}`);
          if (error) errors.push(error);
        });
      }
    });

    return errors;
  }

  /**
   * Validate a value against a constraint
   * @param {any} value - Value to validate
   * @param {Object} constraint - Constraint definition
   * @param {string} context - Context for error message
   * @returns {string|null} Error message or null
   */
  validateConstraint(value, constraint, context) {
    switch (constraint.type) {
      case ConstraintTypes.MIN_LENGTH:
        if (String(value).length < constraint.value) {
          return `${context}: Minimum length is ${constraint.value}`;
        }
        break;

      case ConstraintTypes.MAX_LENGTH:
        if (String(value).length > constraint.value) {
          return `${context}: Maximum length is ${constraint.value}`;
        }
        break;

      case ConstraintTypes.MIN_VALUE:
        if (Number(value) < constraint.value) {
          return `${context}: Minimum value is ${constraint.value}`;
        }
        break;

      case ConstraintTypes.MAX_VALUE:
        if (Number(value) > constraint.value) {
          return `${context}: Maximum value is ${constraint.value}`;
        }
        break;

      case ConstraintTypes.PATTERN:
        try {
          const regex = new RegExp(constraint.value);
          if (!regex.test(String(value))) {
            return `${context}: Does not match required pattern`;
          }
        } catch {
          return `${context}: Invalid pattern constraint`;
        }
        break;

      case ConstraintTypes.ENUM:
        if (!constraint.values.includes(value)) {
          return `${context}: Must be one of: ${constraint.values.join(', ')}`;
        }
        break;
    }

    return null;
  }

  /**
   * Validate schema definition
   * @param {Object} schema - Schema to validate
   * @returns {Object} Validation result
   */
  validateSchemaDefinition(schema) {
    const errors = [];

    if (!schema || typeof schema !== 'object') {
      errors.push('Schema must be an object');
      return { valid: false, errors };
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      errors.push('Schema must have a properties object');
    }

    // Validate property definitions
    Object.entries(schema.properties || {}).forEach(([propName, propSchema]) => {
      if (!propSchema.type || !Object.values(DataTypes).includes(propSchema.type)) {
        errors.push(`Property ${propName}: Invalid or missing type`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all defined schemas
   * @returns {Object} All schemas
   */
  getAllSchemas() {
    return { ...this.schemas };
  }

  /**
   * Get all relationships
   * @returns {Object} All relationships
   */
  getAllRelationships() {
    return { ...this.relationships };
  }
}

/**
 * Singleton instance
 */
export const schemaManager = new SchemaManager();

export default SchemaManager;