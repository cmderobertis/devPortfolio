/**
 * Type Definitions for Database Editor
 * Provides TypeScript-like type definitions and runtime validation for JavaScript
 */

/**
 * Data type definitions
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
 * Query operator definitions
 */
export const QueryOperators = {
  // Comparison
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  
  // String operations
  CONTAINS: 'contains',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  REGEX: 'regex',
  
  // Array operations
  IN: 'in',
  NOT_IN: 'notIn',
  
  // Null checks
  IS_NULL: 'isNull',
  IS_NOT_NULL: 'isNotNull',
  
  // Date operations
  DATE_BEFORE: 'dateBefore',
  DATE_AFTER: 'dateAfter',
  DATE_BETWEEN: 'dateBetween'
};

/**
 * Sort direction definitions
 */
export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc'
};

/**
 * Join type definitions
 */
export const JoinType = {
  INNER: 'inner',
  LEFT: 'left',
  RIGHT: 'right',
  FULL: 'full'
};

/**
 * Export format definitions
 */
export const ExportFormats = {
  JSON: 'json',
  CSV: 'csv',
  SQL: 'sql',
  XML: 'xml',
  YAML: 'yaml'
};

/**
 * Relationship type definitions
 */
export const RelationshipTypes = {
  ONE_TO_ONE: 'oneToOne',
  ONE_TO_MANY: 'oneToMany',
  MANY_TO_ONE: 'manyToOne',
  MANY_TO_MANY: 'manyToMany'
};

/**
 * Constraint type definitions
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
 * Type validators
 */
export const TypeValidators = {
  /**
   * Validate database metadata
   * @param {any} metadata - Metadata to validate
   * @returns {Object} Validation result
   */
  validateMetadata: (metadata) => {
    const errors = [];
    
    if (!metadata || typeof metadata !== 'object') {
      errors.push('Metadata must be an object');
      return { valid: false, errors };
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      errors.push('Metadata must have a version string');
    }

    if (!metadata.created || !Date.parse(metadata.created)) {
      errors.push('Metadata must have a valid created date');
    }

    if (!metadata.tables || typeof metadata.tables !== 'object') {
      errors.push('Metadata must have a tables object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate table schema
   * @param {any} schema - Schema to validate
   * @returns {Object} Validation result
   */
  validateTableSchema: (schema) => {
    const errors = [];
    
    if (!schema || typeof schema !== 'object') {
      errors.push('Schema must be an object');
      return { valid: false, errors };
    }

    if (!schema.type || !Object.values(DataTypes).includes(schema.type)) {
      errors.push('Schema must have a valid type');
    }

    if (schema.properties && typeof schema.properties !== 'object') {
      errors.push('Schema properties must be an object');
    }

    if (schema.constraints && typeof schema.constraints !== 'object') {
      errors.push('Schema constraints must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate query filter
   * @param {any} filter - Filter to validate
   * @returns {Object} Validation result
   */
  validateQueryFilter: (filter) => {
    const errors = [];
    
    if (!filter || typeof filter !== 'object') {
      errors.push('Filter must be an object');
      return { valid: false, errors };
    }

    if (!filter.field || typeof filter.field !== 'string') {
      errors.push('Filter must have a field string');
    }

    if (!filter.operator || !Object.values(QueryOperators).includes(filter.operator)) {
      errors.push('Filter must have a valid operator');
    }

    if (filter.value === undefined) {
      errors.push('Filter must have a value');
    }

    if (filter.logicalOperator && !['AND', 'OR'].includes(filter.logicalOperator)) {
      errors.push('Filter logical operator must be AND or OR');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate sort specification
   * @param {any} sort - Sort to validate
   * @returns {Object} Validation result
   */
  validateSort: (sort) => {
    const errors = [];
    
    if (!sort || typeof sort !== 'object') {
      errors.push('Sort must be an object');
      return { valid: false, errors };
    }

    if (!sort.field || typeof sort.field !== 'string') {
      errors.push('Sort must have a field string');
    }

    if (!sort.direction || !Object.values(SortDirection).includes(sort.direction)) {
      errors.push('Sort must have a valid direction');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate join specification
   * @param {any} join - Join to validate
   * @returns {Object} Validation result
   */
  validateJoin: (join) => {
    const errors = [];
    
    if (!join || typeof join !== 'object') {
      errors.push('Join must be an object');
      return { valid: false, errors };
    }

    if (!join.table || typeof join.table !== 'string') {
      errors.push('Join must have a table string');
    }

    if (!join.joinField || typeof join.joinField !== 'string') {
      errors.push('Join must have a joinField string');
    }

    if (!join.localField || typeof join.localField !== 'string') {
      errors.push('Join must have a localField string');
    }

    if (!join.type || !Object.values(JoinType).includes(join.type)) {
      errors.push('Join must have a valid type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate relationship definition
   * @param {any} relationship - Relationship to validate
   * @returns {Object} Validation result
   */
  validateRelationship: (relationship) => {
    const errors = [];
    
    if (!relationship || typeof relationship !== 'object') {
      errors.push('Relationship must be an object');
      return { valid: false, errors };
    }

    if (!relationship.fromTable || typeof relationship.fromTable !== 'string') {
      errors.push('Relationship must have a fromTable string');
    }

    if (!relationship.fromColumn || typeof relationship.fromColumn !== 'string') {
      errors.push('Relationship must have a fromColumn string');
    }

    if (!relationship.toTable || typeof relationship.toTable !== 'string') {
      errors.push('Relationship must have a toTable string');
    }

    if (!relationship.toColumn || typeof relationship.toColumn !== 'string') {
      errors.push('Relationship must have a toColumn string');
    }

    if (!relationship.type || !Object.values(RelationshipTypes).includes(relationship.type)) {
      errors.push('Relationship must have a valid type');
    }

    if (relationship.confidence !== undefined && 
        (typeof relationship.confidence !== 'number' || 
         relationship.confidence < 0 || 
         relationship.confidence > 1)) {
      errors.push('Relationship confidence must be a number between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate export options
   * @param {any} options - Export options to validate
   * @returns {Object} Validation result
   */
  validateExportOptions: (options) => {
    const errors = [];
    
    if (!options || typeof options !== 'object') {
      errors.push('Export options must be an object');
      return { valid: false, errors };
    }

    if (options.format && !Object.values(ExportFormats).includes(options.format)) {
      errors.push('Export format must be valid');
    }

    if (options.includeMetadata !== undefined && typeof options.includeMetadata !== 'boolean') {
      errors.push('includeMetadata must be a boolean');
    }

    if (options.prettify !== undefined && typeof options.prettify !== 'boolean') {
      errors.push('prettify must be a boolean');
    }

    if (options.dateFormat && typeof options.dateFormat !== 'string') {
      errors.push('dateFormat must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

/**
 * Type checking utilities
 */
export const TypeUtils = {
  /**
   * Check if value matches expected type
   * @param {any} value - Value to check
   * @param {string} expectedType - Expected data type
   * @returns {boolean} True if value matches type
   */
  isType: (value, expectedType) => {
    switch (expectedType) {
      case DataTypes.STRING:
        return typeof value === 'string';
      case DataTypes.NUMBER:
        return typeof value === 'number' && !isNaN(value);
      case DataTypes.BOOLEAN:
        return typeof value === 'boolean';
      case DataTypes.DATE:
        return value instanceof Date || 
               (typeof value === 'string' && !isNaN(Date.parse(value)));
      case DataTypes.JSON:
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case DataTypes.ARRAY:
        return Array.isArray(value);
      case DataTypes.NULL:
        return value === null;
      case DataTypes.UNDEFINED:
        return value === undefined;
      default:
        return false;
    }
  },

  /**
   * Infer type from value
   * @param {any} value - Value to analyze
   * @returns {string} Inferred type
   */
  inferType: (value) => {
    if (value === null) return DataTypes.NULL;
    if (value === undefined) return DataTypes.UNDEFINED;
    
    const jsType = typeof value;
    
    if (jsType === 'boolean') return DataTypes.BOOLEAN;
    if (jsType === 'number') return DataTypes.NUMBER;
    if (jsType === 'string') {
      // Check if it's a date string
      if (!isNaN(Date.parse(value))) {
        const date = new Date(value);
        if (date.toISOString() === value || 
            date.toDateString() !== 'Invalid Date') {
          return DataTypes.DATE;
        }
      }
      return DataTypes.STRING;
    }
    
    if (Array.isArray(value)) return DataTypes.ARRAY;
    if (jsType === 'object') return DataTypes.JSON;
    
    return DataTypes.STRING; // fallback
  },

  /**
   * Convert value to specified type
   * @param {any} value - Value to convert
   * @param {string} targetType - Target type
   * @returns {any} Converted value
   */
  convertType: (value, targetType) => {
    if (value === null || value === undefined) {
      return value;
    }

    try {
      switch (targetType) {
        case DataTypes.STRING:
          return String(value);
        case DataTypes.NUMBER:
          const num = Number(value);
          return isNaN(num) ? value : num;
        case DataTypes.BOOLEAN:
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'true' || lower === '1') return true;
            if (lower === 'false' || lower === '0') return false;
          }
          return Boolean(value);
        case DataTypes.DATE:
          return new Date(value);
        case DataTypes.JSON:
          return typeof value === 'string' ? JSON.parse(value) : value;
        case DataTypes.ARRAY:
          return Array.isArray(value) ? value : [value];
        default:
          return value;
      }
    } catch (error) {
      console.warn(`Type conversion failed for ${value} to ${targetType}:`, error);
      return value;
    }
  },

  /**
   * Check if two types are compatible for comparison
   * @param {string} type1 - First type
   * @param {string} type2 - Second type
   * @returns {boolean} True if types are compatible
   */
  areTypesCompatible: (type1, type2) => {
    if (type1 === type2) return true;
    
    // Numbers and strings can be compared
    if ((type1 === DataTypes.NUMBER && type2 === DataTypes.STRING) ||
        (type1 === DataTypes.STRING && type2 === DataTypes.NUMBER)) {
      return true;
    }
    
    // Dates and strings can be compared
    if ((type1 === DataTypes.DATE && type2 === DataTypes.STRING) ||
        (type1 === DataTypes.STRING && type2 === DataTypes.DATE)) {
      return true;
    }
    
    return false;
  }
};

/**
 * Runtime type checking decorators/wrappers
 */
export const TypeSafety = {
  /**
   * Wrap function with type checking
   * @param {Function} fn - Function to wrap
   * @param {Object} paramTypes - Parameter type specifications
   * @param {string} returnType - Expected return type
   * @returns {Function} Wrapped function
   */
  typeCheck: (fn, paramTypes = {}, returnType = null) => {
    return function(...args) {
      // Check parameter types
      Object.entries(paramTypes).forEach(([paramIndex, expectedType]) => {
        const argIndex = parseInt(paramIndex);
        if (args.length > argIndex) {
          const actualType = TypeUtils.inferType(args[argIndex]);
          if (!TypeUtils.areTypesCompatible(actualType, expectedType)) {
            console.warn(`Type mismatch: parameter ${argIndex} expected ${expectedType}, got ${actualType}`);
          }
        }
      });

      // Call original function
      const result = fn.apply(this, args);

      // Check return type
      if (returnType && result !== undefined) {
        const actualReturnType = TypeUtils.inferType(result);
        if (!TypeUtils.areTypesCompatible(actualReturnType, returnType)) {
          console.warn(`Return type mismatch: expected ${returnType}, got ${actualReturnType}`);
        }
      }

      return result;
    };
  },

  /**
   * Validate object against type schema
   * @param {any} obj - Object to validate
   * @param {Object} schema - Type schema
   * @returns {Object} Validation result
   */
  validateObject: (obj, schema) => {
    const errors = [];
    const warnings = [];

    if (typeof obj !== 'object' || obj === null) {
      errors.push('Expected object, got ' + typeof obj);
      return { valid: false, errors, warnings };
    }

    Object.entries(schema).forEach(([key, expectedType]) => {
      const value = obj[key];
      
      if (value === undefined) {
        warnings.push(`Missing property: ${key}`);
        return;
      }

      const actualType = TypeUtils.inferType(value);
      if (!TypeUtils.areTypesCompatible(actualType, expectedType)) {
        errors.push(`Property ${key}: expected ${expectedType}, got ${actualType}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

/**
 * Default type schemas for common objects
 */
export const DefaultSchemas = {
  TableMetadata: {
    lastModified: DataTypes.DATE,
    size: DataTypes.NUMBER,
    type: DataTypes.STRING
  },

  QueryFilter: {
    field: DataTypes.STRING,
    operator: DataTypes.STRING,
    value: DataTypes.STRING, // Can be any type, but we'll use string as default
    logicalOperator: DataTypes.STRING
  },

  SortSpecification: {
    field: DataTypes.STRING,
    direction: DataTypes.STRING
  },

  JoinSpecification: {
    table: DataTypes.STRING,
    joinField: DataTypes.STRING,
    localField: DataTypes.STRING,
    type: DataTypes.STRING
  },

  RelationshipDefinition: {
    fromTable: DataTypes.STRING,
    fromColumn: DataTypes.STRING,
    toTable: DataTypes.STRING,
    toColumn: DataTypes.STRING,
    type: DataTypes.STRING,
    confidence: DataTypes.NUMBER
  },

  ExportResult: {
    success: DataTypes.BOOLEAN,
    data: DataTypes.STRING,
    metadata: DataTypes.JSON
  },

  ImportResult: {
    success: DataTypes.BOOLEAN,
    tableName: DataTypes.STRING,
    recordCount: DataTypes.NUMBER,
    message: DataTypes.STRING
  }
};

export default {
  DataTypes,
  QueryOperators,
  SortDirection,
  JoinType,
  ExportFormats,
  RelationshipTypes,
  ConstraintTypes,
  TypeValidators,
  TypeUtils,
  TypeSafety,
  DefaultSchemas
};