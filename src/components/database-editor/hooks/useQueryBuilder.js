/**
 * Query Builder Hook
 * React hook for building and executing complex queries with visual query builder integration
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { QueryBuilder, QueryOperators, SortDirection, JoinType, executeQuery } from '../utils/queryEngine.js';
import { localStorageDB } from '../utils/localStorageDB.js';

/**
 * Hook for building and executing queries
 * @param {string} tableName - Primary table name
 * @param {Object} options - Hook configuration options
 * @returns {Object} Query building operations and state
 */
export function useQueryBuilder(tableName, options = {}) {
  const {
    autoExecute = false,
    enableHistory = true,
    maxHistorySize = 20,
    debounceMs = 300
  } = options;

  // Core state
  const [queryBuilder, setQueryBuilder] = useState(() => new QueryBuilder(tableName));
  const [results, setResults] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);

  // Query configuration state
  const [filters, setFilters] = useState([]);
  const [sorts, setSorts] = useState([]);
  const [pagination, setPagination] = useState({ limit: null, offset: 0 });
  const [selectedFields, setSelectedFields] = useState(null);
  const [joins, setJoins] = useState([]);

  // Query history
  const [queryHistory, setQueryHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Metadata
  const [queryPlan, setQueryPlan] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [tableColumns, setTableColumns] = useState({});

  // Initialize available tables and columns
  useEffect(() => {
    const tables = localStorageDB.discoverTables();
    setAvailableTables(tables);

    const columns = {};
    tables.forEach(table => {
      try {
        const schema = localStorageDB.getTableSchema(table);
        if (schema && schema.properties) {
          columns[table] = Object.keys(schema.properties);
        } else {
          // Fallback: analyze actual data
          const data = localStorageDB.getTable(table);
          if (data) {
            const records = Array.isArray(data) ? data : [data];
            if (records.length > 0 && typeof records[0] === 'object' && records[0] !== null) {
              const columnSet = new Set();
              records.slice(0, 10).forEach(record => {
                Object.keys(record).forEach(key => columnSet.add(key));
              });
              columns[table] = Array.from(columnSet);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to get columns for table ${table}:`, error);
        columns[table] = [];
      }
    });
    setTableColumns(columns);
  }, [tableName]);

  // Rebuild query when components change
  const rebuildQuery = useCallback(() => {
    const newBuilder = new QueryBuilder(tableName);

    // Add filters
    filters.forEach(filter => {
      if (filter.logicalOperator === 'OR') {
        newBuilder.orWhere(filter.field, filter.operator, filter.value);
      } else {
        newBuilder.where(filter.field, filter.operator, filter.value);
      }
    });

    // Add sorts
    sorts.forEach(sort => {
      newBuilder.orderBy(sort.field, sort.direction);
    });

    // Add pagination
    if (pagination.limit) {
      newBuilder.limit(pagination.limit);
    }
    if (pagination.offset > 0) {
      newBuilder.offset(pagination.offset);
    }

    // Add field selection
    if (selectedFields && selectedFields.length > 0) {
      newBuilder.select(selectedFields);
    }

    // Add joins
    joins.forEach(join => {
      newBuilder.join(join.table, join.joinField, join.localField, join.type);
    });

    setQueryBuilder(newBuilder);
    setQueryPlan(newBuilder.explain());

    return newBuilder;
  }, [tableName, filters, sorts, pagination, selectedFields, joins]);

  // Execute query
  const executeCurrentQuery = useCallback(async (builder = null) => {
    try {
      setIsExecuting(true);
      setError(null);

      const queryToExecute = builder || queryBuilder;
      const startTime = performance.now();
      
      const queryResults = executeQuery(queryToExecute);
      
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
      
      setResults(queryResults);

      // Add to history if enabled
      if (enableHistory) {
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          query: queryToExecute.explain(),
          resultCount: queryResults.length,
          executionTime: endTime - startTime
        };

        setQueryHistory(prev => {
          const newHistory = [historyEntry, ...prev];
          return newHistory.slice(0, maxHistorySize);
        });
        setCurrentHistoryIndex(0);
      }

      return queryResults;
    } catch (executeError) {
      setError(`Query execution failed: ${executeError.message}`);
      return [];
    } finally {
      setIsExecuting(false);
    }
  }, [queryBuilder, enableHistory, maxHistorySize]);

  // Auto-execute when query changes
  useEffect(() => {
    const newBuilder = rebuildQuery();
    
    if (autoExecute) {
      const timeoutId = setTimeout(() => {
        executeCurrentQuery(newBuilder);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }
  }, [rebuildQuery, autoExecute, debounceMs, executeCurrentQuery]);

  // Filter operations
  const filterOperations = useMemo(() => ({
    /**
     * Add a filter condition
     * @param {string} field - Field name
     * @param {string} operator - Query operator
     * @param {any} value - Filter value
     * @param {string} logicalOperator - 'AND' or 'OR'
     */
    addFilter: (field, operator, value, logicalOperator = 'AND') => {
      const newFilter = {
        id: Date.now(),
        field,
        operator,
        value,
        logicalOperator: filters.length === 0 ? null : logicalOperator
      };
      setFilters(prev => [...prev, newFilter]);
    },

    /**
     * Update a filter
     * @param {number} filterId - Filter ID
     * @param {Object} updates - Updates to apply
     */
    updateFilter: (filterId, updates) => {
      setFilters(prev => prev.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      ));
    },

    /**
     * Remove a filter
     * @param {number} filterId - Filter ID
     */
    removeFilter: (filterId) => {
      setFilters(prev => prev.filter(filter => filter.id !== filterId));
    },

    /**
     * Clear all filters
     */
    clearFilters: () => {
      setFilters([]);
    },

    /**
     * Get available operators for field type
     * @param {string} field - Field name
     * @returns {Array} Available operators
     */
    getAvailableOperators: (field) => {
      // This would typically use schema information
      // For now, return all operators
      return Object.values(QueryOperators);
    }
  }), [filters]);

  // Sort operations
  const sortOperations = useMemo(() => ({
    /**
     * Add sort criteria
     * @param {string} field - Field name
     * @param {string} direction - Sort direction
     */
    addSort: (field, direction = SortDirection.ASC) => {
      const newSort = {
        id: Date.now(),
        field,
        direction
      };
      setSorts(prev => [...prev, newSort]);
    },

    /**
     * Update sort criteria
     * @param {number} sortId - Sort ID
     * @param {Object} updates - Updates to apply
     */
    updateSort: (sortId, updates) => {
      setSorts(prev => prev.map(sort => 
        sort.id === sortId ? { ...sort, ...updates } : sort
      ));
    },

    /**
     * Remove sort criteria
     * @param {number} sortId - Sort ID
     */
    removeSort: (sortId) => {
      setSorts(prev => prev.filter(sort => sort.id !== sortId));
    },

    /**
     * Clear all sorts
     */
    clearSorts: () => {
      setSorts([]);
    },

    /**
     * Move sort up in priority
     * @param {number} sortId - Sort ID
     */
    moveSortUp: (sortId) => {
      setSorts(prev => {
        const index = prev.findIndex(sort => sort.id === sortId);
        if (index > 0) {
          const newSorts = [...prev];
          [newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]];
          return newSorts;
        }
        return prev;
      });
    },

    /**
     * Move sort down in priority
     * @param {number} sortId - Sort ID
     */
    moveSortDown: (sortId) => {
      setSorts(prev => {
        const index = prev.findIndex(sort => sort.id === sortId);
        if (index < prev.length - 1) {
          const newSorts = [...prev];
          [newSorts[index], newSorts[index + 1]] = [newSorts[index + 1], newSorts[index]];
          return newSorts;
        }
        return prev;
      });
    }
  }), []);

  // Join operations
  const joinOperations = useMemo(() => ({
    /**
     * Add join
     * @param {string} joinTable - Table to join
     * @param {string} joinField - Field in join table
     * @param {string} localField - Field in local table
     * @param {string} type - Join type
     */
    addJoin: (joinTable, joinField, localField, type = JoinType.INNER) => {
      const newJoin = {
        id: Date.now(),
        table: joinTable,
        joinField,
        localField,
        type
      };
      setJoins(prev => [...prev, newJoin]);
    },

    /**
     * Update join
     * @param {number} joinId - Join ID
     * @param {Object} updates - Updates to apply
     */
    updateJoin: (joinId, updates) => {
      setJoins(prev => prev.map(join => 
        join.id === joinId ? { ...join, ...updates } : join
      ));
    },

    /**
     * Remove join
     * @param {number} joinId - Join ID
     */
    removeJoin: (joinId) => {
      setJoins(prev => prev.filter(join => join.id !== joinId));
    },

    /**
     * Clear all joins
     */
    clearJoins: () => {
      setJoins([]);
    }
  }), []);

  // Pagination operations
  const paginationOperations = useMemo(() => ({
    /**
     * Set page size
     * @param {number} size - Page size
     */
    setPageSize: (size) => {
      setPagination(prev => ({ ...prev, limit: size }));
    },

    /**
     * Set current page
     * @param {number} page - Page number (0-based)
     */
    setPage: (page) => {
      setPagination(prev => ({ 
        ...prev, 
        offset: prev.limit ? page * prev.limit : 0 
      }));
    },

    /**
     * Go to next page
     */
    nextPage: () => {
      setPagination(prev => ({
        ...prev,
        offset: prev.limit ? prev.offset + prev.limit : 0
      }));
    },

    /**
     * Go to previous page
     */
    previousPage: () => {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - (prev.limit || 0))
      }));
    },

    /**
     * Reset pagination
     */
    resetPagination: () => {
      setPagination({ limit: null, offset: 0 });
    }
  }), []);

  // Field selection operations
  const fieldOperations = useMemo(() => ({
    /**
     * Select specific fields
     * @param {Array} fields - Field names to select
     */
    selectFields: (fields) => {
      setSelectedFields(Array.isArray(fields) ? fields : [fields]);
    },

    /**
     * Add field to selection
     * @param {string} field - Field name
     */
    addField: (field) => {
      setSelectedFields(prev => {
        if (!prev) return [field];
        if (prev.includes(field)) return prev;
        return [...prev, field];
      });
    },

    /**
     * Remove field from selection
     * @param {string} field - Field name
     */
    removeField: (field) => {
      setSelectedFields(prev => {
        if (!prev) return null;
        const newFields = prev.filter(f => f !== field);
        return newFields.length === 0 ? null : newFields;
      });
    },

    /**
     * Select all fields
     */
    selectAllFields: () => {
      setSelectedFields(null);
    },

    /**
     * Get available fields for table
     * @param {string} table - Table name (defaults to primary table)
     * @returns {Array} Available field names
     */
    getAvailableFields: (table = tableName) => {
      return tableColumns[table] || [];
    }
  }), [tableColumns, tableName]);

  // History operations
  const historyOperations = useMemo(() => ({
    /**
     * Load query from history
     * @param {number} historyIndex - History index
     */
    loadFromHistory: (historyIndex) => {
      if (historyIndex >= 0 && historyIndex < queryHistory.length) {
        const historyEntry = queryHistory[historyIndex];
        const plan = historyEntry.query;
        
        // Restore query state from plan
        setFilters(plan.filters || []);
        setSorts(plan.sorts || []);
        setPagination({ 
          limit: plan.limit, 
          offset: plan.offset || 0 
        });
        setSelectedFields(plan.select);
        setJoins(plan.joins || []);
        
        setCurrentHistoryIndex(historyIndex);
      }
    },

    /**
     * Clear query history
     */
    clearHistory: () => {
      setQueryHistory([]);
      setCurrentHistoryIndex(-1);
    },

    /**
     * Export query as SQL
     * @returns {string} SQL representation
     */
    exportAsSQL: () => {
      // This would generate SQL from the current query
      // Implementation depends on specific SQL dialect
      return '-- SQL export not yet implemented';
    }
  }), [queryHistory]);

  // Utility operations
  const utilityOperations = useMemo(() => ({
    /**
     * Reset query to initial state
     */
    resetQuery: () => {
      setFilters([]);
      setSorts([]);
      setPagination({ limit: null, offset: 0 });
      setSelectedFields(null);
      setJoins([]);
      setResults([]);
      setError(null);
    },

    /**
     * Get query summary
     * @returns {Object} Query summary
     */
    getQuerySummary: () => {
      return {
        table: tableName,
        filterCount: filters.length,
        sortCount: sorts.length,
        joinCount: joins.length,
        hasFieldSelection: selectedFields !== null,
        hasPagination: pagination.limit !== null,
        estimatedComplexity: queryPlan?.estimatedComplexity || 'UNKNOWN',
        lastExecutionTime: executionTime,
        resultCount: results.length
      };
    },

    /**
     * Validate current query
     * @returns {Object} Validation result
     */
    validateQuery: () => {
      const errors = [];
      const warnings = [];

      // Check if table exists
      if (!availableTables.includes(tableName)) {
        errors.push(`Table '${tableName}' does not exist`);
      }

      // Validate filter fields
      filters.forEach(filter => {
        const availableFields = tableColumns[tableName] || [];
        if (!availableFields.includes(filter.field)) {
          warnings.push(`Field '${filter.field}' may not exist in table '${tableName}'`);
        }
      });

      // Validate sort fields
      sorts.forEach(sort => {
        const availableFields = tableColumns[tableName] || [];
        if (!availableFields.includes(sort.field)) {
          warnings.push(`Sort field '${sort.field}' may not exist in table '${tableName}'`);
        }
      });

      // Validate joins
      joins.forEach(join => {
        if (!availableTables.includes(join.table)) {
          errors.push(`Join table '${join.table}' does not exist`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    }
  }), [tableName, filters, sorts, joins, selectedFields, pagination, queryPlan, executionTime, results, availableTables, tableColumns]);

  return {
    // State
    results,
    isExecuting,
    error,
    executionTime,
    queryPlan,
    filters,
    sorts,
    pagination,
    selectedFields,
    joins,
    queryHistory,
    currentHistoryIndex,
    availableTables,
    tableColumns,

    // Operations
    filter: filterOperations,
    sort: sortOperations,
    join: joinOperations,
    pagination: paginationOperations,
    fields: fieldOperations,
    history: historyOperations,
    utils: utilityOperations,

    // Core actions
    execute: executeCurrentQuery,
    rebuild: rebuildQuery,

    // Query builder access
    queryBuilder
  };
}

export default useQueryBuilder;