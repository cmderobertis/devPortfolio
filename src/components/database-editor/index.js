/**
 * Database Editor - Main Export Module
 * Exports all utilities, hooks, and types for the LocalStorage Database Editor
 */

// Core utilities
export { 
  LocalStorageDB, 
  localStorageDB, 
  DataTypes as CoreDataTypes,
  inferDataType,
  isDateString,
  dbUtils 
} from './utils/localStorageDB.js';

export { 
  QueryBuilder, 
  QueryOperators, 
  SortDirection, 
  JoinType,
  executeQuery,
  query,
  quickQuery 
} from './utils/queryEngine.js';

export { 
  SchemaManager, 
  schemaManager, 
  ConstraintTypes, 
  RelationshipTypes 
} from './utils/schemaManager.js';

export { 
  ExportImportManager, 
  exportImportManager, 
  ExportFormats 
} from './utils/exportImport.js';

export { 
  RelationshipMapper, 
  relationshipMapper, 
  ConfidenceLevels, 
  DetectionPatterns 
} from './utils/relationshipMapper.js';

// React hooks
export { useLocalStorageDB } from './hooks/useLocalStorageDB.js';
export { useTableOperations } from './hooks/useTableOperations.js';
export { useQueryBuilder } from './hooks/useQueryBuilder.js';

// Type definitions
export { 
  default as DatabaseTypes,
  DataTypes,
  QueryOperators as TypedQueryOperators,
  SortDirection as TypedSortDirection,
  JoinType as TypedJoinType,
  ExportFormats as TypedExportFormats,
  RelationshipTypes as TypedRelationshipTypes,
  ConstraintTypes as TypedConstraintTypes,
  TypeValidators,
  TypeUtils,
  TypeSafety,
  DefaultSchemas
} from './types/database.types.js';

/**
 * Database Editor Factory
 * Creates a configured instance of the database editor with optional settings
 */
export function createDatabaseEditor(options = {}) {
  const {
    prefix = 'lsdb_',
    enableSchemaAnalysis = true,
    enableRelationshipMapping = true,
    autoRefresh = true,
    refreshInterval = 5000
  } = options;

  // Initialize core components with custom prefix if provided
  const db = new LocalStorageDB({ prefix });
  const schema = new SchemaManager();
  const relationships = new RelationshipMapper();
  const exportImport = new ExportImportManager();

  return {
    // Core instances
    db,
    schema,
    relationships,
    exportImport,

    // Convenience methods
    async initialize() {
      // Perform any initialization tasks
      try {
        if (enableSchemaAnalysis) {
          const tables = db.discoverTables();
          tables.forEach(tableName => {
            try {
              const generatedSchema = schema.generateSchema(tableName);
              if (generatedSchema) {
                schema.defineSchema(tableName, generatedSchema);
              }
            } catch (error) {
              console.warn(`Failed to generate schema for ${tableName}:`, error);
            }
          });
        }

        if (enableRelationshipMapping) {
          relationships.analyzeAllTables();
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async getFullAnalysis() {
      const tables = db.discoverTables();
      const metadata = db.getMetadata();
      const storageStats = db.getStorageStats();
      const schemas = schema.getAllSchemas();
      const relationshipAnalysis = relationships.analyzeAllTables();
      const erdData = relationships.generateERD();

      return {
        tables,
        metadata,
        storageStats,
        schemas,
        relationships: relationshipAnalysis.relationships,
        erdData,
        statistics: {
          ...storageStats,
          ...relationshipAnalysis.statistics
        }
      };
    },

    // Export entire database
    async exportDatabase(format = ExportFormats.JSON, options = {}) {
      const tables = db.discoverTables();
      const exports = {};

      for (const tableName of tables) {
        try {
          const result = exportImport.exportTable(tableName, format, options);
          if (result.success) {
            exports[tableName] = result;
          }
        } catch (error) {
          console.warn(`Failed to export table ${tableName}:`, error);
        }
      }

      return {
        success: Object.keys(exports).length > 0,
        exports,
        metadata: await this.getFullAnalysis()
      };
    },

    // Quick access to commonly used operations
    quickOps: {
      // Get table with schema
      getTableWithSchema: (tableName) => {
        const data = db.getTable(tableName);
        const tableSchema = schema.getSchema(tableName);
        const generatedSchema = tableSchema || db.getTableSchema(tableName);
        
        return {
          data,
          schema: tableSchema,
          generatedSchema,
          relationships: relationships.getTableRelationships?.(tableName) || []
        };
      },

      // Quick search across all tables
      globalSearch: (searchTerm) => {
        const tables = db.discoverTables();
        const results = {};

        tables.forEach(tableName => {
          try {
            const matches = quickQuery.search(tableName, searchTerm);
            if (matches.length > 0) {
              results[tableName] = matches;
            }
          } catch (error) {
            console.warn(`Search failed for table ${tableName}:`, error);
          }
        });

        return results;
      },

      // Validate all data against schemas
      validateAllData: () => {
        const tables = db.discoverTables();
        const results = {};

        tables.forEach(tableName => {
          try {
            const data = db.getTable(tableName);
            const validation = schema.validateData(tableName, data);
            results[tableName] = validation;
          } catch (error) {
            results[tableName] = {
              valid: false,
              errors: [error.message],
              warnings: []
            };
          }
        });

        return results;
      }
    }
  };
}

/**
 * Default database editor instance
 * Pre-configured with standard settings
 */
export const defaultDatabaseEditor = createDatabaseEditor();

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Feature flags and capabilities
 */
export const FEATURES = {
  SCHEMA_ANALYSIS: true,
  RELATIONSHIP_MAPPING: true,
  QUERY_BUILDER: true,
  EXPORT_IMPORT: true,
  UNDO_REDO: true,
  BATCH_OPERATIONS: true,
  TYPE_VALIDATION: true,
  ERD_GENERATION: true
};

/**
 * Supported export formats with descriptions
 */
export const SUPPORTED_EXPORTS = {
  [ExportFormats.JSON]: {
    name: 'JSON',
    description: 'JavaScript Object Notation',
    mimeType: 'application/json',
    extension: 'json',
    supportsMetadata: true
  },
  [ExportFormats.CSV]: {
    name: 'CSV',
    description: 'Comma-Separated Values',
    mimeType: 'text/csv',
    extension: 'csv',
    supportsMetadata: false
  },
  [ExportFormats.SQL]: {
    name: 'SQL',
    description: 'Structured Query Language',
    mimeType: 'application/sql',
    extension: 'sql',
    supportsMetadata: false
  },
  [ExportFormats.XML]: {
    name: 'XML',
    description: 'Extensible Markup Language',
    mimeType: 'application/xml',
    extension: 'xml',
    supportsMetadata: true
  },
  [ExportFormats.YAML]: {
    name: 'YAML',
    description: 'YAML Ain\'t Markup Language',
    mimeType: 'application/x-yaml',
    extension: 'yaml',
    supportsMetadata: true
  }
};

/**
 * Query operator descriptions for UI
 */
export const OPERATOR_DESCRIPTIONS = {
  [QueryOperators.EQUALS]: 'Equals',
  [QueryOperators.NOT_EQUALS]: 'Does not equal',
  [QueryOperators.GREATER_THAN]: 'Greater than',
  [QueryOperators.GREATER_THAN_OR_EQUAL]: 'Greater than or equal',
  [QueryOperators.LESS_THAN]: 'Less than',
  [QueryOperators.LESS_THAN_OR_EQUAL]: 'Less than or equal',
  [QueryOperators.CONTAINS]: 'Contains text',
  [QueryOperators.STARTS_WITH]: 'Starts with',
  [QueryOperators.ENDS_WITH]: 'Ends with',
  [QueryOperators.REGEX]: 'Matches pattern',
  [QueryOperators.IN]: 'Is in list',
  [QueryOperators.NOT_IN]: 'Is not in list',
  [QueryOperators.IS_NULL]: 'Is empty/null',
  [QueryOperators.IS_NOT_NULL]: 'Is not empty',
  [QueryOperators.DATE_BEFORE]: 'Date before',
  [QueryOperators.DATE_AFTER]: 'Date after',
  [QueryOperators.DATE_BETWEEN]: 'Date between'
};

export default {
  createDatabaseEditor,
  defaultDatabaseEditor,
  VERSION,
  FEATURES,
  SUPPORTED_EXPORTS,
  OPERATOR_DESCRIPTIONS
};