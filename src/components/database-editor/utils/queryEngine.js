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
 * Aggregation functions
 */
export const AggregationFunctions = {
  COUNT: 'count',
  SUM: 'sum',
  AVG: 'avg',
  MIN: 'min',
  MAX: 'max',
  FIRST: 'first',
  LAST: 'last',
  COUNT_DISTINCT: 'countDistinct',
  STRING_AGG: 'stringAgg'
};

/**
 * Data type conversion functions
 */
export const DataTypeFunctions = {
  CAST: 'cast',
  TO_STRING: 'toString',
  TO_NUMBER: 'toNumber',
  TO_DATE: 'toDate',
  TO_BOOLEAN: 'toBoolean',
  LENGTH: 'length',
  UPPER: 'upper',
  LOWER: 'lower',
  TRIM: 'trim',
  SUBSTRING: 'substring',
  CONCAT: 'concat',
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  ABS: 'abs'
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
    this.groupByFields = [];
    this.aggregations = [];
    this.havingConditions = [];
    this.subqueries = [];
    this.unionQueries = [];
    this.calculatedFields = [];
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
   * Add GROUP BY field
   * @param {string|Array} fields - Field(s) to group by
   * @returns {QueryBuilder} This instance for chaining
   */
  groupBy(fields) {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];
    this.groupByFields.push(...fieldsArray);
    return this;
  }

  /**
   * Add aggregation function
   * @param {string} func - Aggregation function name
   * @param {string} field - Field to aggregate (null for COUNT(*))
   * @param {string} alias - Alias for the result
   * @returns {QueryBuilder} This instance for chaining
   */
  aggregate(func, field = null, alias = null) {
    this.aggregations.push({
      function: func,
      field,
      alias: alias || `${func}_${field || 'all'}`
    });
    return this;
  }

  /**
   * Add HAVING condition for aggregated results
   * @param {string} aggregateField - Aggregated field or alias
   * @param {string} operator - Comparison operator
   * @param {any} value - Value to compare
   * @param {string} logicalOperator - 'AND' or 'OR'
   * @returns {QueryBuilder} This instance for chaining
   */
  having(aggregateField, operator, value, logicalOperator = 'AND') {
    this.havingConditions.push({
      field: aggregateField,
      operator,
      value,
      logicalOperator: this.havingConditions.length === 0 ? null : logicalOperator
    });
    return this;
  }

  /**
   * Add subquery in WHERE clause
   * @param {string} field - Field to compare
   * @param {string} operator - Comparison operator (IN, EXISTS, etc.)
   * @param {QueryBuilder} subquery - Subquery builder
   * @param {string} logicalOperator - 'AND' or 'OR'
   * @returns {QueryBuilder} This instance for chaining
   */
  whereSubquery(field, operator, subquery, logicalOperator = 'AND') {
    this.subqueries.push({
      field,
      operator,
      subquery,
      logicalOperator: this.filters.length === 0 && this.subqueries.length === 1 ? null : logicalOperator,
      type: 'WHERE'
    });
    return this;
  }

  /**
   * Add EXISTS subquery
   * @param {QueryBuilder} subquery - Subquery builder
   * @param {boolean} notExists - Use NOT EXISTS instead
   * @param {string} logicalOperator - 'AND' or 'OR'
   * @returns {QueryBuilder} This instance for chaining
   */
  whereExists(subquery, notExists = false, logicalOperator = 'AND') {
    return this.whereSubquery(null, notExists ? 'NOT EXISTS' : 'EXISTS', subquery, logicalOperator);
  }

  /**
   * Add UNION query
   * @param {QueryBuilder} query - Query to union with
   * @param {boolean} unionAll - Use UNION ALL instead of UNION
   * @returns {QueryBuilder} This instance for chaining
   */
  union(query, unionAll = false) {
    this.unionQueries.push({
      query,
      unionAll
    });
    return this;
  }

  /**
   * Add calculated field with CASE/WHEN expression
   * @param {string} alias - Alias for the calculated field
   * @param {Object} caseExpression - Case expression definition
   * @returns {QueryBuilder} This instance for chaining
   */
  addCase(alias, caseExpression) {
    this.calculatedFields.push({
      type: 'CASE',
      alias,
      expression: caseExpression
    });
    return this;
  }

  /**
   * Add calculated field with custom function
   * @param {string} alias - Alias for the calculated field
   * @param {Function} calculator - Function to calculate field value
   * @returns {QueryBuilder} This instance for chaining
   */
  addCalculatedField(alias, calculator) {
    this.calculatedFields.push({
      type: 'FUNCTION',
      alias,
      calculator
    });
    return this;
  }

  /**
   * Add field with data type conversion
   * @param {string} alias - Alias for the converted field
   * @param {string} field - Source field name
   * @param {string} dataTypeFunction - Conversion function name
   * @param {any} params - Additional parameters for conversion
   * @returns {QueryBuilder} This instance for chaining
   */
  addConvertedField(alias, field, dataTypeFunction, params = null) {
    this.calculatedFields.push({
      type: 'CONVERT',
      alias,
      field,
      function: dataTypeFunction,
      params
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
      groupBy: this.groupByFields,
      aggregations: this.aggregations,
      having: this.havingConditions,
      subqueries: this.subqueries,
      unions: this.unionQueries,
      calculatedFields: this.calculatedFields,
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
    score += this.groupByFields.length * 3; // Grouping is expensive
    score += this.aggregations.length * 2; // Aggregations add complexity
    score += this.havingConditions.length * 2; // Having conditions add complexity
    score += this.subqueries.length * 4; // Subqueries are expensive
    score += this.unionQueries.length * 3; // Unions add complexity
    score += this.calculatedFields.length * 2; // Calculated fields add complexity
    
    if (score <= 2) return 'LOW';
    if (score <= 8) return 'MEDIUM';
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

  // Apply filters and subqueries
  if (query.filters.length > 0 || query.subqueries.length > 0) {
    records = applyFiltersAndSubqueries(records, query.filters, query.subqueries);
  }

  // Apply grouping and aggregation
  if (query.groupByFields.length > 0 || query.aggregations.length > 0) {
    records = applyGroupByAndAggregation(records, query.groupByFields, query.aggregations);
    
    // Apply having conditions after aggregation
    if (query.havingConditions.length > 0) {
      records = applyFilters(records, query.havingConditions);
    }
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

  // Apply calculated fields
  if (query.calculatedFields.length > 0) {
    records = applyCalculatedFields(records, query.calculatedFields);
  }

  // Apply field selection (only if no grouping/aggregation)
  if (query.selectFields && query.selectFields.length > 0 && query.groupByFields.length === 0 && query.aggregations.length === 0) {
    records = applyFieldSelection(records, query.selectFields);
  }

  // Apply union operations
  if (query.unionQueries.length > 0) {
    records = applyUnionOperations(records, query.unionQueries);
  }

  return records;
}

/**
 * Apply filters and subqueries to records
 * @param {Array} records - Records to filter
 * @param {Array} filters - Filter conditions
 * @param {Array} subqueries - Subquery conditions
 * @returns {Array} Filtered records
 */
function applyFiltersAndSubqueries(records, filters = [], subqueries = []) {
  return records.filter(record => {
    let result = true;
    let currentLogicalOp = null;

    // Apply regular filters
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

    // Apply subquery conditions
    for (const subqueryCondition of subqueries) {
      const conditionResult = evaluateSubqueryCondition(record, subqueryCondition);

      if (currentLogicalOp === 'OR') {
        result = result || conditionResult;
      } else if (currentLogicalOp === 'AND' || currentLogicalOp === null) {
        result = result && conditionResult;
      }

      currentLogicalOp = subqueryCondition.logicalOperator;
    }

    return result;
  });
}

/**
 * Apply filters to records (kept for backward compatibility)
 * @param {Array} records - Records to filter
 * @param {Array} filters - Filter conditions
 * @returns {Array} Filtered records
 */
function applyFilters(records, filters) {
  return applyFiltersAndSubqueries(records, filters, []);
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
 * Apply GROUP BY and aggregation
 * @param {Array} records - Records to group and aggregate
 * @param {Array} groupFields - Fields to group by
 * @param {Array} aggregations - Aggregation specifications
 * @returns {Array} Grouped and aggregated records
 */
function applyGroupByAndAggregation(records, groupFields, aggregations) {
  if (groupFields.length === 0 && aggregations.length === 0) {
    return records;
  }

  // If no grouping but has aggregations, treat as single group
  if (groupFields.length === 0 && aggregations.length > 0) {
    const result = {};
    
    // Apply aggregations to the entire dataset
    aggregations.forEach(agg => {
      result[agg.alias] = calculateAggregation(records, agg.function, agg.field);
    });
    
    return [result];
  }

  // Group records by specified fields
  const groups = new Map();
  
  records.forEach(record => {
    const groupKey = groupFields.map(field => getNestedValue(record, field)).join('|');
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    
    groups.get(groupKey).push(record);
  });

  // Calculate aggregations for each group
  const results = [];
  
  for (const [groupKey, groupRecords] of groups.entries()) {
    const result = {};
    
    // Include group fields in result
    const groupValues = groupKey.split('|');
    groupFields.forEach((field, index) => {
      result[field] = groupValues[index];
    });
    
    // Calculate aggregations
    aggregations.forEach(agg => {
      result[agg.alias] = calculateAggregation(groupRecords, agg.function, agg.field);
    });
    
    results.push(result);
  }

  return results;
}

/**
 * Calculate aggregation value
 * @param {Array} records - Records to aggregate
 * @param {string} func - Aggregation function
 * @param {string} field - Field to aggregate
 * @returns {any} Aggregated value
 */
function calculateAggregation(records, func, field) {
  if (records.length === 0) return null;

  const values = field ? records.map(record => getNestedValue(record, field)).filter(v => v !== null && v !== undefined) : records;

  switch (func) {
    case AggregationFunctions.COUNT:
      return field ? values.length : records.length;
    
    case AggregationFunctions.COUNT_DISTINCT:
      return new Set(values).size;
    
    case AggregationFunctions.SUM:
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0);
    
    case AggregationFunctions.AVG:
      if (values.length === 0) return null;
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length;
    
    case AggregationFunctions.MIN:
      if (values.length === 0) return null;
      return values.reduce((min, val) => {
        const numVal = Number(val);
        return isNaN(numVal) ? min : Math.min(min, numVal);
      }, Number.MAX_VALUE);
    
    case AggregationFunctions.MAX:
      if (values.length === 0) return null;
      return values.reduce((max, val) => {
        const numVal = Number(val);
        return isNaN(numVal) ? max : Math.max(max, numVal);
      }, Number.MIN_VALUE);
    
    case AggregationFunctions.FIRST:
      return values.length > 0 ? values[0] : null;
    
    case AggregationFunctions.LAST:
      return values.length > 0 ? values[values.length - 1] : null;
    
    case AggregationFunctions.STRING_AGG:
      return values.join(', ');
    
    default:
      console.warn(`Unknown aggregation function: ${func}`);
      return null;
  }
}

/**
 * Evaluate subquery condition
 * @param {Object} record - Record to evaluate against
 * @param {Object} subqueryCondition - Subquery condition
 * @returns {boolean} Condition result
 */
function evaluateSubqueryCondition(record, subqueryCondition) {
  const { field, operator, subquery } = subqueryCondition;
  
  // Execute subquery
  const subqueryResults = executeQuery(subquery);
  
  switch (operator) {
    case 'EXISTS':
      return subqueryResults.length > 0;
    
    case 'NOT EXISTS':
      return subqueryResults.length === 0;
    
    case 'IN':
      if (!field || subqueryResults.length === 0) return false;
      const fieldValue = getNestedValue(record, field);
      // Assume subquery returns single column, use first column of each row
      const subqueryValues = subqueryResults.map(row => {
        const keys = Object.keys(row);
        return keys.length > 0 ? row[keys[0]] : null;
      });
      return subqueryValues.includes(fieldValue);
    
    case 'NOT IN':
      if (!field || subqueryResults.length === 0) return true;
      const fieldVal = getNestedValue(record, field);
      const subVals = subqueryResults.map(row => {
        const keys = Object.keys(row);
        return keys.length > 0 ? row[keys[0]] : null;
      });
      return !subVals.includes(fieldVal);
    
    default:
      console.warn(`Unknown subquery operator: ${operator}`);
      return false;
  }
}

/**
 * Apply union operations
 * @param {Array} records - Primary query records
 * @param {Array} unionQueries - Union query specifications
 * @returns {Array} Combined records
 */
function applyUnionOperations(records, unionQueries) {
  let result = [...records];
  
  for (const unionSpec of unionQueries) {
    const unionResults = executeQuery(unionSpec.query);
    
    if (unionSpec.unionAll) {
      // UNION ALL: keep duplicates
      result = result.concat(unionResults);
    } else {
      // UNION: remove duplicates
      const existingKeys = new Set(result.map(r => JSON.stringify(r)));
      const uniqueUnionResults = unionResults.filter(r => !existingKeys.has(JSON.stringify(r)));
      result = result.concat(uniqueUnionResults);
    }
  }
  
  return result;
}

/**
 * Apply calculated fields to records
 * @param {Array} records - Records to process
 * @param {Array} calculatedFields - Calculated field specifications
 * @returns {Array} Records with calculated fields
 */
function applyCalculatedFields(records, calculatedFields) {
  return records.map(record => {
    const newRecord = { ...record };
    
    calculatedFields.forEach(field => {
      if (field.type === 'CASE') {
        newRecord[field.alias] = evaluateCaseExpression(record, field.expression);
      } else if (field.type === 'FUNCTION') {
        try {
          newRecord[field.alias] = field.calculator(record);
        } catch (error) {
          console.warn(`Error calculating field ${field.alias}:`, error);
          newRecord[field.alias] = null;
        }
      } else if (field.type === 'CONVERT') {
        try {
          const sourceValue = getNestedValue(record, field.field);
          newRecord[field.alias] = applyDataTypeFunction(sourceValue, field.function, field.params);
        } catch (error) {
          console.warn(`Error converting field ${field.alias}:`, error);
          newRecord[field.alias] = null;
        }
      }
    });
    
    return newRecord;
  });
}

/**
 * Evaluate CASE expression
 * @param {Object} record - Record to evaluate against
 * @param {Object} caseExpr - Case expression definition
 * @returns {any} Result of case expression
 */
function evaluateCaseExpression(record, caseExpr) {
  const { conditions, defaultValue = null } = caseExpr;
  
  for (const condition of conditions) {
    const { field, operator, value, result } = condition;
    const fieldValue = getNestedValue(record, field);
    
    if (evaluateCondition(fieldValue, operator, value)) {
      return typeof result === 'function' ? result(record) : result;
    }
  }
  
  return typeof defaultValue === 'function' ? defaultValue(record) : defaultValue;
}

/**
 * Apply data type conversion function
 * @param {any} value - Value to convert
 * @param {string} func - Function name
 * @param {any} params - Additional parameters
 * @returns {any} Converted value
 */
function applyDataTypeFunction(value, func, params) {
  if (value === null || value === undefined) {
    return null;
  }

  switch (func) {
    case DataTypeFunctions.CAST:
    case DataTypeFunctions.TO_STRING:
      return String(value);
    
    case DataTypeFunctions.TO_NUMBER:
      const num = Number(value);
      return isNaN(num) ? null : num;
    
    case DataTypeFunctions.TO_DATE:
      try {
        const date = new Date(value);
        return isValid(date) ? date : null;
      } catch {
        return null;
      }
    
    case DataTypeFunctions.TO_BOOLEAN:
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
      }
      return Boolean(value);
    
    case DataTypeFunctions.LENGTH:
      return String(value).length;
    
    case DataTypeFunctions.UPPER:
      return String(value).toUpperCase();
    
    case DataTypeFunctions.LOWER:
      return String(value).toLowerCase();
    
    case DataTypeFunctions.TRIM:
      return String(value).trim();
    
    case DataTypeFunctions.SUBSTRING:
      if (!params || !Array.isArray(params) || params.length < 1) return value;
      const str = String(value);
      const [start, length] = params;
      return length !== undefined ? str.substring(start, start + length) : str.substring(start);
    
    case DataTypeFunctions.CONCAT:
      if (!params || !Array.isArray(params)) return value;
      return String(value) + params.map(p => String(p)).join('');
    
    case DataTypeFunctions.ROUND:
      const numVal = Number(value);
      if (isNaN(numVal)) return null;
      const digits = params && typeof params === 'number' ? params : 0;
      return Math.round(numVal * Math.pow(10, digits)) / Math.pow(10, digits);
    
    case DataTypeFunctions.FLOOR:
      return Math.floor(Number(value) || 0);
    
    case DataTypeFunctions.CEIL:
      return Math.ceil(Number(value) || 0);
    
    case DataTypeFunctions.ABS:
      return Math.abs(Number(value) || 0);
    
    default:
      console.warn(`Unknown data type function: ${func}`);
      return value;
  }
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
 * Export query as SQL string
 * @param {QueryBuilder} queryBuilder - Query builder instance
 * @param {string} dialect - SQL dialect ('standard', 'mysql', 'postgresql', 'sqlite')
 * @returns {string} SQL query string
 */
export function exportToSQL(queryBuilder, dialect = 'standard') {
  const plan = queryBuilder.explain();
  const parts = [];
  
  // SELECT clause
  let selectClause = '*';
  if (plan.select && plan.select.length > 0) {
    selectClause = plan.select.join(', ');
  } else if (plan.groupBy && plan.groupBy.length > 0) {
    const selectParts = [...plan.groupBy];
    if (plan.aggregations && plan.aggregations.length > 0) {
      selectParts.push(...plan.aggregations.map(agg => {
        const funcCall = agg.field ? `${agg.function.toUpperCase()}(${agg.field})` : `${agg.function.toUpperCase()}(*)`;
        return agg.alias ? `${funcCall} AS ${agg.alias}` : funcCall;
      }));
    }
    selectClause = selectParts.join(', ');
  }
  
  // Add calculated fields to SELECT
  if (plan.calculatedFields && plan.calculatedFields.length > 0) {
    const calcFields = plan.calculatedFields.map(field => {
      if (field.type === 'CASE') {
        return `CASE ${generateCaseSQL(field.expression)} END AS ${field.alias}`;
      } else if (field.type === 'CONVERT') {
        return `${generateConvertSQL(field, dialect)} AS ${field.alias}`;
      }
      return `${field.alias}`; // Custom functions can't be easily converted
    });
    selectClause = selectClause === '*' ? calcFields.join(', ') : `${selectClause}, ${calcFields.join(', ')}`;
  }
  
  parts.push(`SELECT ${selectClause}`);
  parts.push(`FROM ${plan.table}`);
  
  // JOIN clauses
  if (plan.joins && plan.joins.length > 0) {
    plan.joins.forEach(join => {
      const joinType = join.type.toUpperCase();
      parts.push(`${joinType} JOIN ${join.table} ON ${plan.table}.${join.localField} = ${join.table}.${join.joinField}`);
    });
  }
  
  // WHERE clause
  if (plan.filters && plan.filters.length > 0) {
    const whereClause = generateWhereClause(plan.filters);
    if (whereClause) {
      parts.push(`WHERE ${whereClause}`);
    }
  }
  
  // Subqueries in WHERE
  if (plan.subqueries && plan.subqueries.length > 0) {
    const subqueryClause = generateSubqueryClause(plan.subqueries, dialect);
    if (subqueryClause) {
      const connector = plan.filters && plan.filters.length > 0 ? ' AND ' : 'WHERE ';
      parts.push(connector + subqueryClause);
    }
  }
  
  // GROUP BY clause
  if (plan.groupBy && plan.groupBy.length > 0) {
    parts.push(`GROUP BY ${plan.groupBy.join(', ')}`);
  }
  
  // HAVING clause
  if (plan.having && plan.having.length > 0) {
    const havingClause = generateWhereClause(plan.having);
    if (havingClause) {
      parts.push(`HAVING ${havingClause}`);
    }
  }
  
  // ORDER BY clause
  if (plan.sorts && plan.sorts.length > 0) {
    const orderClause = plan.sorts
      .map(sort => `${sort.field} ${sort.direction.toUpperCase()}`)
      .join(', ');
    parts.push(`ORDER BY ${orderClause}`);
  }
  
  // LIMIT clause
  if (plan.limit !== null) {
    if (dialect === 'mysql' || dialect === 'postgresql' || dialect === 'sqlite') {
      parts.push(`LIMIT ${plan.limit}`);
      if (plan.offset > 0) {
        parts.push(`OFFSET ${plan.offset}`);
      }
    } else {
      // Standard SQL with TOP or FETCH
      if (plan.offset > 0) {
        parts.push(`OFFSET ${plan.offset} ROWS FETCH NEXT ${plan.limit} ROWS ONLY`);
      } else {
        parts[0] = parts[0].replace('SELECT', `SELECT TOP ${plan.limit}`);
      }
    }
  }
  
  // UNION clauses
  if (plan.unions && plan.unions.length > 0) {
    plan.unions.forEach(unionSpec => {
      const unionSQL = exportToSQL(unionSpec.query, dialect);
      parts.push(unionSpec.unionAll ? `UNION ALL` : `UNION`);
      parts.push(unionSQL);
    });
  }
  
  return parts.join(' ');
}

/**
 * Generate WHERE clause from filters
 * @param {Array} filters - Filter conditions
 * @returns {string} WHERE clause
 */
function generateWhereClause(filters) {
  return filters
    .filter(f => f.field && f.operator && f.value !== '')
    .map((f, index) => {
      const condition = generateConditionSQL(f.field, f.operator, f.value);
      const prefix = index === 0 ? '' : ` ${f.logicalOperator || 'AND'} `;
      return prefix + condition;
    })
    .join('');
}

/**
 * Generate SQL condition
 * @param {string} field - Field name
 * @param {string} operator - Operator
 * @param {any} value - Value
 * @returns {string} SQL condition
 */
function generateConditionSQL(field, operator, value) {
  switch (operator) {
    case 'contains':
      return `${field} LIKE '%${value}%'`;
    case 'startsWith':
      return `${field} LIKE '${value}%'`;
    case 'endsWith':
      return `${field} LIKE '%${value}'`;
    case 'in':
      const values = Array.isArray(value) ? value : value.split(',').map(v => v.trim());
      return `${field} IN (${values.map(v => `'${v}'`).join(', ')})`;
    case 'between':
      const [min, max] = value.split(',').map(v => v.trim());
      return `${field} BETWEEN '${min}' AND '${max}'`;
    default:
      return `${field} ${operator} '${value}'`;
  }
}

/**
 * Generate CASE SQL
 * @param {Object} caseExpr - Case expression
 * @returns {string} CASE SQL
 */
function generateCaseSQL(caseExpr) {
  const conditions = caseExpr.conditions.map(cond => 
    `WHEN ${generateConditionSQL(cond.field, cond.operator, cond.value)} THEN '${cond.result}'`
  ).join(' ');
  
  const elsePart = caseExpr.defaultValue !== null ? ` ELSE '${caseExpr.defaultValue}'` : '';
  return conditions + elsePart;
}

/**
 * Generate convert/cast SQL
 * @param {Object} field - Field specification
 * @param {string} dialect - SQL dialect
 * @returns {string} Convert SQL
 */
function generateConvertSQL(field, dialect) {
  const { field: sourceField, function: func, params } = field;
  
  switch (func) {
    case DataTypeFunctions.TO_STRING:
      return dialect === 'postgresql' ? `${sourceField}::TEXT` : `CAST(${sourceField} AS VARCHAR)`;
    case DataTypeFunctions.TO_NUMBER:
      return dialect === 'postgresql' ? `${sourceField}::NUMERIC` : `CAST(${sourceField} AS DECIMAL)`;
    case DataTypeFunctions.TO_DATE:
      return dialect === 'postgresql' ? `${sourceField}::DATE` : `CAST(${sourceField} AS DATE)`;
    case DataTypeFunctions.UPPER:
      return `UPPER(${sourceField})`;
    case DataTypeFunctions.LOWER:
      return `LOWER(${sourceField})`;
    case DataTypeFunctions.TRIM:
      return `TRIM(${sourceField})`;
    case DataTypeFunctions.LENGTH:
      return dialect === 'sqlite' ? `LENGTH(${sourceField})` : `LEN(${sourceField})`;
    case DataTypeFunctions.SUBSTRING:
      if (params && Array.isArray(params)) {
        const [start, length] = params;
        return length !== undefined ? `SUBSTRING(${sourceField}, ${start + 1}, ${length})` : `SUBSTRING(${sourceField}, ${start + 1})`;
      }
      return sourceField;
    case DataTypeFunctions.ROUND:
      const digits = params && typeof params === 'number' ? params : 0;
      return `ROUND(${sourceField}, ${digits})`;
    case DataTypeFunctions.FLOOR:
      return `FLOOR(${sourceField})`;
    case DataTypeFunctions.CEIL:
      return dialect === 'postgresql' ? `CEIL(${sourceField})` : `CEILING(${sourceField})`;
    case DataTypeFunctions.ABS:
      return `ABS(${sourceField})`;
    default:
      return sourceField;
  }
}

/**
 * Generate subquery clause
 * @param {Array} subqueries - Subquery specifications
 * @param {string} dialect - SQL dialect
 * @returns {string} Subquery clause
 */
function generateSubqueryClause(subqueries, dialect) {
  return subqueries
    .map((sub, index) => {
      const subSQL = exportToSQL(sub.subquery, dialect);
      let condition = '';
      
      if (sub.operator === 'EXISTS' || sub.operator === 'NOT EXISTS') {
        condition = `${sub.operator} (${subSQL})`;
      } else if (sub.field) {
        condition = `${sub.field} ${sub.operator} (${subSQL})`;
      }
      
      const prefix = index === 0 ? '' : ` ${sub.logicalOperator || 'AND'} `;
      return prefix + condition;
    })
    .join('');
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

/**
 * Query optimization utilities
 */
export const QueryOptimizer = {
  /**
   * Analyze query performance
   * @param {QueryBuilder} queryBuilder - Query to analyze
   * @returns {Object} Performance analysis
   */
  analyzePerformance(queryBuilder) {
    const plan = queryBuilder.explain();
    const issues = [];
    const suggestions = [];
    
    // Check for potential performance issues
    if (plan.filters.length === 0 && !plan.limit) {
      issues.push('Full table scan without filters or limit');
      suggestions.push('Consider adding WHERE conditions or LIMIT clause');
    }
    
    if (plan.joins.length > 3) {
      issues.push('Multiple joins may impact performance');
      suggestions.push('Consider denormalizing data or using subqueries');
    }
    
    if (plan.sorts.length > 2 && !plan.limit) {
      issues.push('Multiple sort fields without limit');
      suggestions.push('Consider adding LIMIT or reducing sort criteria');
    }
    
    if (plan.subqueries.length > 2) {
      issues.push('Multiple subqueries detected');
      suggestions.push('Consider using JOINs instead of subqueries where possible');
    }
    
    return {
      complexity: plan.estimatedComplexity,
      issues,
      suggestions,
      estimatedCost: this.estimateQueryCost(plan)
    };
  },
  
  /**
   * Estimate query execution cost
   * @param {Object} plan - Query plan
   * @returns {number} Estimated cost (arbitrary units)
   */
  estimateQueryCost(plan) {
    let cost = 1; // Base cost
    
    cost += plan.filters.length * 0.5;
    cost += plan.joins.length * 2;
    cost += plan.sorts.length * 1.5;
    cost += plan.groupBy.length * 2;
    cost += plan.aggregations.length * 1;
    cost += plan.subqueries.length * 3;
    cost += plan.unions.length * 2;
    cost += plan.calculatedFields.length * 0.5;
    
    // Penalty for no filters
    if (plan.filters.length === 0 && !plan.limit) {
      cost *= 2;
    }
    
    return Math.round(cost * 10) / 10;
  }
};

export default QueryBuilder;