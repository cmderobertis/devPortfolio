/**
 * Table Operations Hook
 * Specialized hook for CRUD operations on table data with undo/redo and batch operations
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { query, quickQuery } from '../utils/queryEngine.js';
import { localStorageDB } from '../utils/localStorageDB.js';

/**
 * Hook for table-specific CRUD operations
 * @param {string} tableName - Name of the table to operate on
 * @param {Object} options - Hook configuration options
 * @returns {Object} Table operations and state
 */
export function useTableOperations(tableName, options = {}) {
  const {
    enableUndo = true,
    maxUndoSteps = 10,
    autoSave = true,
    onDataChange = null
  } = options;

  // State
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Refs for internal state
  const lastSavedData = useRef(null);
  const operationCounter = useRef(0);

  // Load data from localStorage
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tableData = localStorageDB.getTable(tableName);
      setData(tableData);
      lastSavedData.current = tableData;
      setIsDirty(false);

    } catch (loadError) {
      setError(`Failed to load table ${tableName}: ${loadError.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [tableName]);

  // Save data to localStorage
  const saveData = useCallback(async (newData) => {
    try {
      const success = localStorageDB.setTable(tableName, newData);
      if (success) {
        lastSavedData.current = newData;
        setIsDirty(false);
        if (onDataChange) {
          onDataChange(newData, 'save');
        }
        return true;
      }
      return false;
    } catch (saveError) {
      setError(`Failed to save table ${tableName}: ${saveError.message}`);
      return false;
    }
  }, [tableName, onDataChange]);

  // Add to undo stack
  const addToUndoStack = useCallback((previousData, operation, description) => {
    if (!enableUndo) return;

    setUndoStack(prev => {
      const newStack = [...prev, {
        data: previousData,
        operation,
        description,
        timestamp: new Date().toISOString(),
        id: ++operationCounter.current
      }];

      // Limit stack size
      if (newStack.length > maxUndoSteps) {
        newStack.shift();
      }

      return newStack;
    });

    // Clear redo stack when new operation is performed
    setRedoStack([]);
  }, [enableUndo, maxUndoSteps]);

  // Update undo/redo availability
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(undoStack.length > 0);
    setCanRedo(redoStack.length > 0);
  }, [undoStack.length, redoStack.length]);

  // Effect to update undo/redo state
  useState(() => {
    updateUndoRedoState();
  }, [undoStack, redoStack, updateUndoRedoState]);

  // Update data with undo support
  const updateData = useCallback(async (newData, operation = 'update', description = 'Data updated') => {
    try {
      const previousData = data;
      
      // Add to undo stack before changing
      if (previousData !== null) {
        addToUndoStack(previousData, operation, description);
      }

      setData(newData);
      setIsDirty(true);

      if (autoSave) {
        await saveData(newData);
      }

      if (onDataChange) {
        onDataChange(newData, operation);
      }

      return true;
    } catch (updateError) {
      setError(`Failed to update data: ${updateError.message}`);
      return false;
    }
  }, [data, addToUndoStack, autoSave, saveData, onDataChange]);

  // CRUD Operations
  const crudOperations = useMemo(() => ({
    /**
     * Create new record(s)
     * @param {any} newRecord - New record or array of records to add
     * @returns {boolean} Success status
     */
    create: async (newRecord) => {
      try {
        const currentData = data || [];
        let newData;

        if (Array.isArray(currentData)) {
          newData = Array.isArray(newRecord) 
            ? [...currentData, ...newRecord]
            : [...currentData, newRecord];
        } else {
          // If current data is not array, convert to array
          newData = Array.isArray(newRecord)
            ? [currentData, ...newRecord]
            : [currentData, newRecord];
        }

        return await updateData(newData, 'create', `Added ${Array.isArray(newRecord) ? newRecord.length : 1} record(s)`);
      } catch (createError) {
        setError(`Failed to create record: ${createError.message}`);
        return false;
      }
    },

    /**
     * Read/Query records
     * @param {Object} criteria - Query criteria (optional)
     * @returns {Array|any} Matching records
     */
    read: (criteria = null) => {
      try {
        if (!data) return null;

        if (!criteria) return data;

        // Use quick query for simple criteria
        if (typeof criteria === 'object' && !criteria.operator) {
          return quickQuery.findWhere(tableName, criteria);
        }

        // Use query builder for complex criteria
        const queryBuilder = query(tableName);
        
        if (criteria.where) {
          criteria.where.forEach(condition => {
            queryBuilder.where(condition.field, condition.operator, condition.value);
          });
        }

        if (criteria.orderBy) {
          criteria.orderBy.forEach(sort => {
            queryBuilder.orderBy(sort.field, sort.direction);
          });
        }

        if (criteria.limit) {
          queryBuilder.limit(criteria.limit);
        }

        if (criteria.offset) {
          queryBuilder.offset(criteria.offset);
        }

        return queryBuilder.execute();
      } catch (readError) {
        setError(`Failed to read records: ${readError.message}`);
        return null;
      }
    },

    /**
     * Update record(s)
     * @param {Function|Object} updateSpec - Update function or object with criteria and updates
     * @returns {boolean} Success status
     */
    update: async (updateSpec) => {
      try {
        if (!data) return false;

        let newData;

        if (typeof updateSpec === 'function') {
          // Function-based update
          newData = Array.isArray(data) 
            ? data.map(updateSpec)
            : updateSpec(data);
        } else if (updateSpec.criteria && updateSpec.updates) {
          // Criteria-based update
          if (!Array.isArray(data)) {
            setError('Criteria-based updates require array data');
            return false;
          }

          newData = data.map(record => {
            const matches = Object.entries(updateSpec.criteria).every(([key, value]) => 
              record[key] === value
            );

            if (matches) {
              return typeof updateSpec.updates === 'function'
                ? updateSpec.updates(record)
                : { ...record, ...updateSpec.updates };
            }

            return record;
          });
        } else {
          setError('Invalid update specification');
          return false;
        }

        return await updateData(newData, 'update', 'Updated records');
      } catch (updateError) {
        setError(`Failed to update records: ${updateError.message}`);
        return false;
      }
    },

    /**
     * Delete record(s)
     * @param {Function|Object} deleteSpec - Delete criteria or filter function
     * @returns {boolean} Success status
     */
    delete: async (deleteSpec) => {
      try {
        if (!data) return false;

        let newData;

        if (typeof deleteSpec === 'function') {
          // Function-based deletion
          newData = Array.isArray(data)
            ? data.filter(record => !deleteSpec(record))
            : deleteSpec(data) ? null : data;
        } else if (typeof deleteSpec === 'object') {
          // Criteria-based deletion
          if (!Array.isArray(data)) {
            setError('Criteria-based deletion requires array data');
            return false;
          }

          newData = data.filter(record => {
            return !Object.entries(deleteSpec).every(([key, value]) => 
              record[key] === value
            );
          });
        } else {
          setError('Invalid delete specification');
          return false;
        }

        return await updateData(newData, 'delete', 'Deleted records');
      } catch (deleteError) {
        setError(`Failed to delete records: ${deleteError.message}`);
        return false;
      }
    }
  }), [data, tableName, updateData]);

  // Batch Operations
  const batchOperations = useMemo(() => ({
    /**
     * Perform multiple operations in batch
     * @param {Array} operations - Array of operation objects
     * @returns {boolean} Success status
     */
    batch: async (operations) => {
      try {
        let currentData = data || [];
        const batchDescription = `Batch operation: ${operations.length} operations`;

        // Add to undo stack before batch
        if (currentData !== null) {
          addToUndoStack(currentData, 'batch', batchDescription);
        }

        for (const operation of operations) {
          switch (operation.type) {
            case 'create':
              if (Array.isArray(currentData)) {
                currentData = [...currentData, operation.data];
              } else {
                currentData = [currentData, operation.data];
              }
              break;

            case 'update':
              if (Array.isArray(currentData)) {
                const index = currentData.findIndex(record => 
                  Object.entries(operation.criteria || {}).every(([key, value]) => 
                    record[key] === value
                  )
                );
                if (index !== -1) {
                  currentData[index] = { ...currentData[index], ...operation.updates };
                }
              }
              break;

            case 'delete':
              if (Array.isArray(currentData)) {
                currentData = currentData.filter(record => 
                  !Object.entries(operation.criteria || {}).every(([key, value]) => 
                    record[key] === value
                  )
                );
              }
              break;

            default:
              console.warn(`Unknown batch operation type: ${operation.type}`);
          }
        }

        setData(currentData);
        setIsDirty(true);

        if (autoSave) {
          await saveData(currentData);
        }

        if (onDataChange) {
          onDataChange(currentData, 'batch');
        }

        return true;
      } catch (batchError) {
        setError(`Failed to perform batch operations: ${batchError.message}`);
        return false;
      }
    },

    /**
     * Bulk insert records
     * @param {Array} records - Records to insert
     * @returns {boolean} Success status
     */
    bulkInsert: async (records) => {
      try {
        if (!Array.isArray(records)) {
          setError('Bulk insert requires array of records');
          return false;
        }

        return await crudOperations.create(records);
      } catch (bulkError) {
        setError(`Failed to bulk insert: ${bulkError.message}`);
        return false;
      }
    },

    /**
     * Bulk update records
     * @param {Object} criteria - Update criteria
     * @param {Object|Function} updates - Updates to apply
     * @returns {boolean} Success status
     */
    bulkUpdate: async (criteria, updates) => {
      try {
        return await crudOperations.update({ criteria, updates });
      } catch (bulkError) {
        setError(`Failed to bulk update: ${bulkError.message}`);
        return false;
      }
    },

    /**
     * Bulk delete records
     * @param {Object} criteria - Delete criteria
     * @returns {boolean} Success status
     */
    bulkDelete: async (criteria) => {
      try {
        return await crudOperations.delete(criteria);
      } catch (bulkError) {
        setError(`Failed to bulk delete: ${bulkError.message}`);
        return false;
      }
    }
  }), [data, addToUndoStack, autoSave, saveData, onDataChange, crudOperations]);

  // Undo/Redo Operations
  const historyOperations = useMemo(() => ({
    /**
     * Undo last operation
     * @returns {boolean} Success status
     */
    undo: async () => {
      try {
        if (undoStack.length === 0) return false;

        const lastOperation = undoStack[undoStack.length - 1];
        
        // Move current state to redo stack
        setRedoStack(prev => [...prev, {
          data: data,
          operation: 'redo_point',
          description: 'Redo point',
          timestamp: new Date().toISOString(),
          id: ++operationCounter.current
        }]);

        // Remove from undo stack
        setUndoStack(prev => prev.slice(0, -1));

        // Restore previous data
        setData(lastOperation.data);
        setIsDirty(true);

        if (autoSave) {
          await saveData(lastOperation.data);
        }

        if (onDataChange) {
          onDataChange(lastOperation.data, 'undo');
        }

        return true;
      } catch (undoError) {
        setError(`Failed to undo: ${undoError.message}`);
        return false;
      }
    },

    /**
     * Redo last undone operation
     * @returns {boolean} Success status
     */
    redo: async () => {
      try {
        if (redoStack.length === 0) return false;

        const redoOperation = redoStack[redoStack.length - 1];
        
        // Move current state to undo stack
        setUndoStack(prev => [...prev, {
          data: data,
          operation: 'undo_point',
          description: 'Undo point',
          timestamp: new Date().toISOString(),
          id: ++operationCounter.current
        }]);

        // Remove from redo stack
        setRedoStack(prev => prev.slice(0, -1));

        // Restore redo data
        setData(redoOperation.data);
        setIsDirty(true);

        if (autoSave) {
          await saveData(redoOperation.data);
        }

        if (onDataChange) {
          onDataChange(redoOperation.data, 'redo');
        }

        return true;
      } catch (redoError) {
        setError(`Failed to redo: ${redoError.message}`);
        return false;
      }
    },

    /**
     * Clear undo/redo history
     */
    clearHistory: () => {
      setUndoStack([]);
      setRedoStack([]);
    },

    /**
     * Get undo/redo history
     * @returns {Object} History information
     */
    getHistory: () => {
      return {
        undoStack: undoStack.map(item => ({
          operation: item.operation,
          description: item.description,
          timestamp: item.timestamp,
          id: item.id
        })),
        redoStack: redoStack.map(item => ({
          operation: item.operation,
          description: item.description,
          timestamp: item.timestamp,
          id: item.id
        })),
        canUndo,
        canRedo
      };
    }
  }), [undoStack, redoStack, data, autoSave, saveData, onDataChange, canUndo, canRedo]);

  // Utility operations
  const utilityOperations = useMemo(() => ({
    /**
     * Manually save data
     * @returns {boolean} Success status
     */
    save: async () => {
      if (!isDirty) return true;
      return await saveData(data);
    },

    /**
     * Reload data from localStorage
     */
    reload: loadData,

    /**
     * Reset to last saved state
     */
    reset: async () => {
      if (lastSavedData.current !== null) {
        await updateData(lastSavedData.current, 'reset', 'Reset to saved state');
      }
    },

    /**
     * Get record count
     * @returns {number} Number of records
     */
    getRecordCount: () => {
      if (!data) return 0;
      return Array.isArray(data) ? data.length : 1;
    },

    /**
     * Search records
     * @param {string} searchTerm - Term to search for
     * @returns {Array} Matching records
     */
    search: (searchTerm) => {
      return quickQuery.search(tableName, searchTerm);
    },

    /**
     * Clear error state
     */
    clearError: () => {
      setError(null);
    }
  }), [data, isDirty, saveData, loadData, updateData, tableName]);

  return {
    // State
    data,
    isLoading,
    error,
    isDirty,
    canUndo,
    canRedo,

    // Core CRUD operations
    ...crudOperations,

    // Batch operations
    batch: batchOperations,

    // History operations
    history: historyOperations,

    // Utility operations
    utils: utilityOperations,

    // Manual control
    load: loadData,
    save: saveData
  };
}

export default useTableOperations;