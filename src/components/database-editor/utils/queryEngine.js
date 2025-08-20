/**
 * Query Engine for LocalStorage Database
 * Provides SQL-like querying capabilities with filtering, sorting, and joining
 */

import { localStorageDB, DataTypes, inferDataType } from './localStorageDB.js';
import { isValid, parseISO, compareAsc, compareDesc } from 'date-fns';

/**
 * Query operators for filtering
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
 * Sort directions
 */
export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc'
};

/**
 * Join types
 */
export const JoinType = {
  INNER: 'inner',
  LEFT: 'left',
  RIGHT: 'right',
  FULL: 'full'
};

/**
 * Query Builder Class
 */
export class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.sorts = [];
    this.limitValue = null;
    this.offsetValue = 0;
    this.selectFields = null;
    this.joins = [];
  }

  /**
   * Add a filter condition
   * @param {string} field - Field name to filter on
   * @param {string} operator - Query operator
   * @param {any} value - Value to compare against
   * @param {string} logicalOperator - 'AND' or 'OR' (default: 'AND')
   * @returns {QueryBuilder} This instance for chaining
   */
  where(field, operator, value, logicalOperator = 'AND') {
    this.filters.push({
      field,
      operator,
      value,
      logicalOperator: this.filters.length === 0 ? null : logicalOperator
    });
    return this;
  }

  /**
   * Add an OR filter condition
   * @param {string} field - Field name to filter on
   * @param {string} operator - Query operator
   * @param {any} value - Value to compare against
   * @returns {QueryBuilder} This instance for chaining
   */
  orWhere(field, operator, value) {
    return this.where(field, operator, value, 'OR');
  }

  /**
   * Add sorting
   * @param {string} field - Field name to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {QueryBuilder} This instance for chaining
   */
  orderBy(field, direction = SortDirection.ASC) {
    this.sorts.push({ field, direction });
    return this;
  }

  /**
   * Set result limit
   * @param {number} count - Maximum number of results
   * @returns {QueryBuilder} This instance for chaining
   */
  limit(count) {
    this.limitValue = count;
    return this;
  }

  /**
   * Set result offset
   * @param {number} count - Number of results to skip
   * @returns {QueryBuilder} This instance for chaining
   */
  offset(count) {
    this.offsetValue = count;
    return this;
  }

  /**
   * Select specific fields
   * @param {Array|string} fields - Fields to select
   * @returns {QueryBuilder} This instance for chaining
   */
  select(fields) {
    this.selectFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  /**
   * Add a join operation
   * @param {string} joinTable - Table to join with
   * @param {string} joinField - Field in join table
   * @param {string} localField - Field in local table
   * @param {string} type - Join type
   * @returns {QueryBuilder} This instance for chaining
   */
  join(joinTable, joinField, localField, type = JoinType.INNER) {
    this.joins.push({
      table: joinTable,
      joinField,
      localField,
      type
    });
    return this;
  }

  /**
   * Execute the query
   * @returns {Array} Query results
   */
  execute() {
    return executeQuery(this);
  }

  /**
   * Get the query plan (for debugging)
   * @returns {Object} Query execution plan
   */
  explain() {
    return {
      table: this.tableName,
      filters: this.filters,
      sorts: this.sorts,
      limit: this.limitValue,
      offset: this.offsetValue,
      select: this.selectFields,
      joins: this.joins,
      estimatedComplexity: this.estimateComplexity()
    };
  }

  /**
   * Estimate query complexity
   * @returns {string} Complexity level
   */
  estimateComplexity() {
    let score = 0;
    
    score += this.filters.length; // Each filter adds complexity
    score += this.sorts.length * 2; // Sorting is more expensive
    score += this.joins.length * 5; // Joins are very expensive
    
    if (score <= 2) return 'LOW';
    if (score <= 6) return 'MEDIUM';
    return 'HIGH';
  }
}

/**
 * Execute a query
 * @param {QueryBuilder} query - Query to execute
 * @returns {Array} Query results
 */
export function executeQuery(query) {
  const data = localStorageDB.getTable(query.tableName);
  if (!data) return [];

  // Convert single values to arrays for uniform processing
  let records = Array.isArray(data) ? data : [data];

  // Apply joins first
  if (query.joins.length > 0) {
    records = applyJoins(records, query.joins);
  }

  // Apply filters
  if (query.filters.length > 0) {
    records = applyFilters(records, query.filters);
  }

  // Apply sorting
  if (query.sorts.length > 0) {
    records = applySorting(records, query.sorts);
  }

  // Apply pagination
  if (query.offsetValue > 0 || query.limitValue !== null) {
    const start = query.offsetValue;
    const end = query.limitValue ? start + query.limitValue : undefined;
    records = records.slice(start, end);
  }

  // Apply field selection
  if (query.selectFields && query.selectFields.length > 0) {
    records = applyFieldSelection(records, query.selectFields);
  }

  return records;
}

/**
 * Apply filters to records
 * @param {Array} records - Records to filter
 * @param {Array} filters - Filter conditions
 * @returns {Array} Filtered records
 */
function applyFilters(records, filters) {
  return records.filter(record => {
    let result = true;
    let currentLogicalOp = null;

    for (const filter of filters) {
      const fieldValue = getNestedValue(record, filter.field);
      const conditionResult = evaluateCondition(fieldValue, filter.operator, filter.value);

      if (currentLogicalOp === 'OR') {
        result = result || conditionResult;
      } else if (currentLogicalOp === 'AND' || currentLogicalOp === null) {
        result = result && conditionResult;
      }

      currentLogicalOp = filter.logicalOperator;
    }

    return result;
  });
}

/**
 * Evaluate a single filter condition
 * @param {any} fieldValue - Value from the record
 * @param {string} operator - Comparison operator
 * @param {any} filterValue - Value to compare against
 * @returns {boolean} Condition result
 */
function evaluateCondition(fieldValue, operator, filterValue) {
  // Handle null checks first
  if (operator === QueryOperators.IS_NULL) {
    return fieldValue === null || fieldValue === undefined;
  }
  if (operator === QueryOperators.IS_NOT_NULL) {
    return fieldValue !== null && fieldValue !== undefined;
  }

  // For other operations, skip null values
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  switch (operator) {
    case QueryOperators.EQUALS:
      return fieldValue === filterValue;
    
    case QueryOperators.NOT_EQUALS:
      return fieldValue !== filterValue;
    
    case QueryOperators.GREATER_THAN:
      return compareValues(fieldValue, filterValue) > 0;
    
    case QueryOperators.GREATER_THAN_OR_EQUAL:
      return compareValues(fieldValue, filterValue) >= 0;
    
    case QueryOperators.LESS_THAN:
      return compareValues(fieldValue, filterValue) < 0;
    
    case QueryOperators.LESS_THAN_OR_EQUAL:
      return compareValues(fieldValue, filterValue) <= 0;
    
    case QueryOperators.CONTAINS:
      return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
    
    case QueryOperators.STARTS_WITH:
      return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
    
    case QueryOperators.ENDS_WITH:
      return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
    
    case QueryOperators.REGEX:
      try {
        const regex = new RegExp(filterValue, 'i');
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }
    
    case QueryOperators.IN:
      return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    
    case QueryOperators.NOT_IN:
      return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
    
    case QueryOperators.DATE_BEFORE:
    case QueryOperators.DATE_AFTER:
    case QueryOperators.DATE_BETWEEN:
      return evaluateDateCondition(fieldValue, operator, filterValue);
    
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Compare two values with type-aware logic
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {number} Comparison result (-1, 0, 1)
 */
function compareValues(a, b) {
  // Type coercion for numbers
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  // Date comparison
  const dateA = new Date(a);
  const dateB = new Date(b);
  if (isValid(dateA) && isValid(dateB)) {
    return compareAsc(dateA, dateB);
  }

  // String comparison
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  return strA.localeCompare(strB);
}

/**
 * Evaluate date-specific conditions
 * @param {any} fieldValue - Date value from record
 * @param {string} operator - Date operator
 * @param {any} filterValue - Date value to compare
 * @returns {boolean} Condition result
 */
function evaluateDateCondition(fieldValue, operator, filterValue) {
  const fieldDate = new Date(fieldValue);
  if (!isValid(fieldDate)) return false;

  switch (operator) {
    case QueryOperators.DATE_BEFORE:
      const beforeDate = new Date(filterValue);
      return isValid(beforeDate) && compareAsc(fieldDate, beforeDate) < 0;
    
    case QueryOperators.DATE_AFTER:
      const afterDate = new Date(filterValue);
      return isValid(afterDate) && compareAsc(fieldDate, afterDate) > 0;
    
    case QueryOperators.DATE_BETWEEN:
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
      const [startDate, endDate] = filterValue.map(d => new Date(d));
      return isValid(startDate) && isValid(endDate) &&
             compareAsc(fieldDate, startDate) >= 0 &&
             compareAsc(fieldDate, endDate) <= 0;
    
    default:
      return false;
  }
}

/**
 * Apply sorting to records
 * @param {Array} records - Records to sort
 * @param {Array} sorts - Sort specifications
 * @returns {Array} Sorted records
 */
function applySorting(records, sorts) {
  return records.sort((a, b) => {
    for (const sort of sorts) {
      const valueA = getNestedValue(a, sort.field);
      const valueB = getNestedValue(b, sort.field);
      
      const comparison = compareValues(valueA, valueB);
      
      if (comparison !== 0) {
        return sort.direction === SortDirection.ASC ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Apply field selection to records
 * @param {Array} records - Records to process
 * @param {Array} fields - Fields to select
 * @returns {Array} Records with selected fields only
 */
function applyFieldSelection(records, fields) {
  return records.map(record => {
    const selected = {};
    fields.forEach(field => {
      selected[field] = getNestedValue(record, field);
    });
    return selected;
  });
}

/**
 * Apply joins to records
 * @param {Array} records - Primary records
 * @param {Array} joins - Join specifications
 * @returns {Array} Joined records
 */
function applyJoins(records, joins) {
  let result = records;

  for (const join of joins) {
    const joinData = localStorageDB.getTable(join.table);
    if (!joinData) continue;

    const joinRecords = Array.isArray(joinData) ? joinData : [joinData];
    result = performJoin(result, joinRecords, join);
  }

  return result;
}

/**
 * Perform a single join operation
 * @param {Array} leftRecords - Left side records
 * @param {Array} rightRecords - Right side records
 * @param {Object} joinSpec - Join specification
 * @returns {Array} Joined records
 */
function performJoin(leftRecords, rightRecords, joinSpec) {
  const joined = [];

  for (const leftRecord of leftRecords) {
    const leftValue = getNestedValue(leftRecord, joinSpec.localField);
    let hasMatch = false;

    for (const rightRecord of rightRecords) {
      const rightValue = getNestedValue(rightRecord, joinSpec.joinField);
      
      if (leftValue === rightValue) {
        hasMatch = true;
        joined.push({
          ...leftRecord,
          [`${joinSpec.table}_${joinSpec.joinField}`]: rightRecord
        });
      }
    }

    // Handle different join types
    if (!hasMatch && (joinSpec.type === JoinType.LEFT || joinSpec.type === JoinType.FULL)) {
      joined.push({
        ...leftRecord,
        [`${joinSpec.table}_${joinSpec.joinField}`]: null
      });
    }
  }

  // Handle RIGHT and FULL joins (add unmatched right records)
  if (joinSpec.type === JoinType.RIGHT || joinSpec.type === JoinType.FULL) {
    for (const rightRecord of rightRecords) {
      const rightValue = getNestedValue(rightRecord, joinSpec.joinField);
      const hasMatch = leftRecords.some(leftRecord => 
        getNestedValue(leftRecord, joinSpec.localField) === rightValue
      );

      if (!hasMatch) {
        joined.push({
          [`${joinSpec.table}_${joinSpec.joinField}`]: rightRecord
        });
      }
    }
  }

  return joined;
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-separated path
 * @returns {any} Value at path
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return obj;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Create a new query builder
 * @param {string} tableName - Name of the table to query
 * @returns {QueryBuilder} New query builder instance
 */
export function query(tableName) {
  return new QueryBuilder(tableName);
}

/**
 * Quick query helpers
 */
export const quickQuery = {
  /**
   * Find all records matching criteria
   * @param {string} tableName - Table name
   * @param {Object} criteria - Simple key-value criteria
   * @returns {Array} Matching records
   */
  findWhere(tableName, criteria) {
    const builder = new QueryBuilder(tableName);
    
    Object.entries(criteria).forEach(([key, value]) => {
      builder.where(key, QueryOperators.EQUALS, value);
    });
    
    return builder.execute();
  },

  /**
   * Find first record matching criteria
   * @param {string} tableName - Table name
   * @param {Object} criteria - Simple key-value criteria
   * @returns {Object|null} First matching record
   */
  findOneWhere(tableName, criteria) {
    const results = this.findWhere(tableName, criteria);
    return results.length > 0 ? results[0] : null;
  },

  /**
   * Search across all string fields
   * @param {string} tableName - Table name
   * @param {string} searchTerm - Term to search for
   * @returns {Array} Matching records
   */
  search(tableName, searchTerm) {
    const data = localStorageDB.getTable(tableName);
    if (!data) return [];

    const records = Array.isArray(data) ? data : [data];
    const searchLower = searchTerm.toLowerCase();

    return records.filter(record => {
      if (typeof record !== 'object' || record === null) {
        return String(record).toLowerCase().includes(searchLower);
      }

      return Object.values(record).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    });
  }
};

export default QueryBuilder;