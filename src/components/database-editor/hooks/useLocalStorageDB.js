/**
 * Main React Hook for LocalStorage Database Operations
 * Provides a unified interface for all database operations with React state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { localStorageDB } from '../utils/localStorageDB.js';
import { schemaManager } from '../utils/schemaManager.js';
import { relationshipMapper } from '../utils/relationshipMapper.js';
import { exportImportManager } from '../utils/exportImport.js';

/**
 * Main hook for LocalStorage database operations
 * @param {Object} options - Hook configuration options
 * @returns {Object} Database operations and state
 */
export function useLocalStorageDB(options = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableSchemaAnalysis = true,
    enableRelationshipMapping = true
  } = options;

  // Core state
  const [tables, setTables] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [storageStats, setStorageStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analysis state
  const [schemas, setSchemas] = useState({});
  const [relationships, setRelationships] = useState([]);
  const [erdData, setErdData] = useState(null);

  // Refresh data from localStorage
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get basic database info
      const discoveredTables = localStorageDB.discoverTables();
      const dbMetadata = localStorageDB.getMetadata();
      const stats = localStorageDB.getStorageStats();

      setTables(discoveredTables);
      setMetadata(dbMetadata);
      setStorageStats(stats);

      // Run analysis if enabled
      if (enableSchemaAnalysis) {
        const allSchemas = schemaManager.getAllSchemas();
        setSchemas(allSchemas);
      }

      if (enableRelationshipMapping && discoveredTables.length > 1) {
        try {
          const analysis = relationshipMapper.analyzeAllTables();
          setRelationships(analysis.relationships);
          
          const erd = relationshipMapper.generateERD();
          setErdData(erd);
        } catch (analysisError) {
          console.warn('Relationship analysis failed:', analysisError);
        }
      }

    } catch (refreshError) {
      setError(refreshError.message);
      console.error('Database refresh failed:', refreshError);
    } finally {
      setIsLoading(false);
    }
  }, [enableSchemaAnalysis, enableRelationshipMapping]);

  // Auto-refresh effect
  useEffect(() => {
    refreshData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, autoRefresh, refreshInterval]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === localStorage) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  // Table operations
  const tableOperations = useMemo(() => ({
    /**
     * Get table data
     * @param {string} tableName - Name of the table
     * @returns {any} Table data
     */
    getTable: (tableName) => {
      try {
        return localStorageDB.getTable(tableName);
      } catch (error) {
        setError(`Failed to get table ${tableName}: ${error.message}`);
        return null;
      }
    },

    /**
     * Set table data
     * @param {string} tableName - Name of the table
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    setTable: async (tableName, data) => {
      try {
        const success = localStorageDB.setTable(tableName, data);
        if (success) {
          await refreshData();
        }
        return success;
      } catch (error) {
        setError(`Failed to set table ${tableName}: ${error.message}`);
        return false;
      }
    },

    /**
     * Delete table
     * @param {string} tableName - Name of the table
     * @returns {boolean} Success status
     */
    deleteTable: async (tableName) => {
      try {
        const success = localStorageDB.deleteTable(tableName);
        if (success) {
          await refreshData();
        }
        return success;
      } catch (error) {
        setError(`Failed to delete table ${tableName}: ${error.message}`);
        return false;
      }
    },

    /**
     * Clear all tables
     * @returns {boolean} Success status
     */
    clearAll: async () => {
      try {
        const success = localStorageDB.clearAllTables();
        if (success) {
          await refreshData();
        }
        return success;
      } catch (error) {
        setError(`Failed to clear all tables: ${error.message}`);
        return false;
      }
    },

    /**
     * Get table schema
     * @param {string} tableName - Name of the table
     * @returns {Object|null} Table schema
     */
    getTableSchema: (tableName) => {
      try {
        return localStorageDB.getTableSchema(tableName);
      } catch (error) {
        setError(`Failed to get schema for ${tableName}: ${error.message}`);
        return null;
      }
    }
  }), [refreshData]);

  // Schema operations
  const schemaOperations = useMemo(() => ({
    /**
     * Define schema for table
     * @param {string} tableName - Name of the table
     * @param {Object} schema - Schema definition
     * @returns {boolean} Success status
     */
    defineSchema: async (tableName, schema) => {
      try {
        const success = schemaManager.defineSchema(tableName, schema);
        if (success) {
          await refreshData();
        }
        return success;
      } catch (error) {
        setError(`Failed to define schema for ${tableName}: ${error.message}`);
        return false;
      }
    },

    /**
     * Generate schema from existing data
     * @param {string} tableName - Name of the table
     * @param {Object} options - Generation options
     * @returns {Object|null} Generated schema
     */
    generateSchema: (tableName, options = {}) => {
      try {
        return schemaManager.generateSchema(tableName, options);
      } catch (error) {
        setError(`Failed to generate schema for ${tableName}: ${error.message}`);
        return null;
      }
    },

    /**
     * Validate data against schema
     * @param {string} tableName - Name of the table
     * @param {any} data - Data to validate
     * @returns {Object} Validation result
     */
    validateData: (tableName, data) => {
      try {
        return schemaManager.validateData(tableName, data);
      } catch (error) {
        setError(`Failed to validate data for ${tableName}: ${error.message}`);
        return { valid: false, errors: [error.message], warnings: [] };
      }
    },

    /**
     * Remove schema
     * @param {string} tableName - Name of the table
     * @returns {boolean} Success status
     */
    removeSchema: async (tableName) => {
      try {
        const success = schemaManager.removeSchema(tableName);
        if (success) {
          await refreshData();
        }
        return success;
      } catch (error) {
        setError(`Failed to remove schema for ${tableName}: ${error.message}`);
        return false;
      }
    }
  }), [refreshData]);

  // Export/Import operations
  const dataOperations = useMemo(() => ({
    /**
     * Export table data
     * @param {string} tableName - Name of the table
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Object} Export result
     */
    exportTable: (tableName, format, options = {}) => {
      try {
        return exportImportManager.exportTable(tableName, format, options);
      } catch (error) {
        setError(`Failed to export table ${tableName}: ${error.message}`);
        return { success: false, error: error.message };
      }
    },

    /**
     * Import data
     * @param {string} content - Data content
     * @param {string} format - Data format
     * @param {Object} options - Import options
     * @returns {Object} Import result
     */
    importData: async (content, format, options = {}) => {
      try {
        const result = exportImportManager.importData(content, format, options);
        if (result.success) {
          await refreshData();
        }
        return result;
      } catch (error) {
        setError(`Failed to import data: ${error.message}`);
        return { success: false, error: error.message };
      }
    },

    /**
     * Download exported data as file
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadAsFile: (content, filename, mimeType) => {
      try {
        exportImportManager.downloadAsFile(content, filename, mimeType);
      } catch (error) {
        setError(`Failed to download file: ${error.message}`);
      }
    }
  }), [refreshData]);

  // Relationship operations
  const relationshipOperations = useMemo(() => ({
    /**
     * Analyze table relationships
     * @returns {Object} Analysis results
     */
    analyzeRelationships: () => {
      try {
        return relationshipMapper.analyzeAllTables();
      } catch (error) {
        setError(`Failed to analyze relationships: ${error.message}`);
        return { tables: {}, relationships: [], statistics: {} };
      }
    },

    /**
     * Generate ERD data
     * @returns {Object} ERD data structure
     */
    generateERD: () => {
      try {
        return relationshipMapper.generateERD();
      } catch (error) {
        setError(`Failed to generate ERD: ${error.message}`);
        return { nodes: [], edges: [], metadata: {} };
      }
    },

    /**
     * Set confidence threshold for relationship detection
     * @param {number} threshold - Confidence threshold (0-1)
     */
    setConfidenceThreshold: (threshold) => {
      relationshipMapper.setConfidenceThreshold(threshold);
    },

    /**
     * Clear relationship analysis cache
     */
    clearCache: () => {
      relationshipMapper.clearCache();
    }
  }), []);

  // Utility operations
  const utilityOperations = useMemo(() => ({
    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    isAvailable: () => {
      try {
        return localStorageDB.constructor.prototype.constructor === Function;
      } catch {
        return false;
      }
    },

    /**
     * Format bytes to human readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    formatBytes: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Get storage usage percentage
     * @returns {number} Usage percentage
     */
    getUsagePercentage: () => {
      return storageStats.usedPercent || 0;
    },

    /**
     * Clear error state
     */
    clearError: () => {
      setError(null);
    }
  }), [storageStats]);

  return {
    // State
    tables,
    metadata,
    storageStats,
    schemas,
    relationships,
    erdData,
    isLoading,
    error,

    // Operations
    ...tableOperations,
    schema: schemaOperations,
    data: dataOperations,
    relationships: relationshipOperations,
    utils: utilityOperations,

    // Control
    refresh: refreshData
  };
}

export default useLocalStorageDB;