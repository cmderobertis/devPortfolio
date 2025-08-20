/**
 * Relationship Mapper for ERD Generation
 * Analyzes data patterns to detect and visualize relationships between tables
 */

import { localStorageDB, DataTypes, inferDataType } from './localStorageDB.js';
import { schemaManager, RelationshipTypes } from './schemaManager.js';

/**
 * Relationship confidence levels
 */
export const ConfidenceLevels = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
  VERY_LOW: 0.2
};

/**
 * Relationship detection patterns
 */
export const DetectionPatterns = {
  ID_SUFFIX: /^(.+)_?id$/i,
  FK_PATTERN: /^fk_(.+)$/i,
  REF_PATTERN: /^(.+)_ref$/i,
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  NUMERIC_ID: /^\d+$/
};

/**
 * Relationship Mapper Class
 */
export class RelationshipMapper {
  constructor() {
    this.relationships = new Map();
    this.tableAnalysis = new Map();
    this.confidenceThreshold = ConfidenceLevels.LOW;
  }

  /**
   * Analyze all tables and detect relationships
   * @returns {Object} Analysis results with relationships and table info
   */
  analyzeAllTables() {
    const tables = localStorageDB.discoverTables();
    const analysis = {
      tables: {},
      relationships: [],
      statistics: {
        totalTables: tables.length,
        tablesWithData: 0,
        relationshipsFound: 0,
        confidenceDistribution: {}
      }
    };

    // Analyze each table individually
    tables.forEach(tableName => {
      const tableInfo = this.analyzeTable(tableName);
      if (tableInfo) {
        analysis.tables[tableName] = tableInfo;
        if (tableInfo.recordCount > 0) {
          analysis.statistics.tablesWithData++;
        }
      }
    });

    // Detect relationships between tables
    const relationships = this.detectRelationships(analysis.tables);
    analysis.relationships = relationships;
    analysis.statistics.relationshipsFound = relationships.length;

    // Calculate confidence distribution
    const confidenceGroups = { high: 0, medium: 0, low: 0, veryLow: 0 };
    relationships.forEach(rel => {
      if (rel.confidence >= ConfidenceLevels.HIGH) confidenceGroups.high++;
      else if (rel.confidence >= ConfidenceLevels.MEDIUM) confidenceGroups.medium++;
      else if (rel.confidence >= ConfidenceLevels.LOW) confidenceGroups.low++;
      else confidenceGroups.veryLow++;
    });
    analysis.statistics.confidenceDistribution = confidenceGroups;

    return analysis;
  }

  /**
   * Analyze a single table structure and data patterns
   * @param {string} tableName - Name of the table to analyze
   * @returns {Object|null} Table analysis or null if table doesn't exist
   */
  analyzeTable(tableName) {
    const data = localStorageDB.getTable(tableName);
    if (!data) return null;

    const records = Array.isArray(data) ? data : [data];
    const analysis = {
      tableName,
      recordCount: records.length,
      dataType: Array.isArray(data) ? 'array' : inferDataType(data),
      columns: {},
      primaryKeyCandidate: null,
      foreignKeyCandidate: [],
      indexSuggestions: [],
      sampledRecords: Math.min(records.length, 10)
    };

    if (records.length === 0) {
      return analysis;
    }

    // Handle non-object records
    if (typeof records[0] !== 'object' || records[0] === null) {
      analysis.dataType = 'primitive';
      analysis.columns = {
        value: {
          type: inferDataType(records[0]),
          nullable: records.some(r => r === null || r === undefined),
          unique: new Set(records).size === records.length,
          examples: records.slice(0, 3)
        }
      };
      return analysis;
    }

    // Analyze object structure
    const allColumns = this.extractAllColumns(records);
    
    allColumns.forEach(columnName => {
      analysis.columns[columnName] = this.analyzeColumn(records, columnName);
    });

    // Detect primary key candidates
    analysis.primaryKeyCandidate = this.detectPrimaryKey(analysis.columns);

    // Detect foreign key candidates
    analysis.foreignKeyCandidate = this.detectForeignKeys(analysis.columns);

    // Generate index suggestions
    analysis.indexSuggestions = this.suggestIndexes(analysis.columns);

    this.tableAnalysis.set(tableName, analysis);
    return analysis;
  }

  /**
   * Extract all unique column names from records
   * @param {Array} records - Array of record objects
   * @returns {Array} Array of column names
   */
  extractAllColumns(records) {
    const columns = new Set();
    const sampleSize = Math.min(records.length, 50); // Sample for performance

    for (let i = 0; i < sampleSize; i++) {
      const record = records[i];
      if (typeof record === 'object' && record !== null) {
        Object.keys(record).forEach(key => columns.add(key));
      }
    }

    return Array.from(columns);
  }

  /**
   * Analyze individual column characteristics
   * @param {Array} records - Array of records
   * @param {string} columnName - Name of column to analyze
   * @returns {Object} Column analysis
   */
  analyzeColumn(records, columnName) {
    const values = records.map(record => record[columnName]).filter(val => val !== undefined);
    const nonNullValues = values.filter(val => val !== null);
    const uniqueValues = [...new Set(nonNullValues)];

    const analysis = {
      type: nonNullValues.length > 0 ? inferDataType(nonNullValues[0]) : DataTypes.NULL,
      nullable: values.length !== nonNullValues.length,
      unique: uniqueValues.length === nonNullValues.length && nonNullValues.length > 1,
      frequency: values.length / records.length,
      cardinality: uniqueValues.length,
      examples: uniqueValues.slice(0, 5),
      patterns: {},
      statistics: {}
    };

    if (nonNullValues.length === 0) return analysis;

    // Detect patterns
    analysis.patterns = this.detectColumnPatterns(nonNullValues, columnName);

    // Calculate statistics based on type
    switch (analysis.type) {
      case DataTypes.STRING:
        analysis.statistics = this.calculateStringStats(nonNullValues);
        break;
      case DataTypes.NUMBER:
        analysis.statistics = this.calculateNumberStats(nonNullValues);
        break;
      case DataTypes.DATE:
        analysis.statistics = this.calculateDateStats(nonNullValues);
        break;
    }

    return analysis;
  }

  /**
   * Detect patterns in column data
   * @param {Array} values - Column values
   * @param {string} columnName - Column name
   * @returns {Object} Detected patterns
   */
  detectColumnPatterns(values, columnName) {
    const patterns = {
      isId: false,
      isForeignKey: false,
      isUuid: false,
      isNumericId: false,
      isEmail: false,
      isUrl: false,
      isPhone: false,
      hasNamingPattern: false
    };

    // Check naming patterns
    patterns.hasNamingPattern = DetectionPatterns.ID_SUFFIX.test(columnName) ||
                               DetectionPatterns.FK_PATTERN.test(columnName) ||
                               DetectionPatterns.REF_PATTERN.test(columnName);

    // Check if this looks like an ID field
    patterns.isId = columnName.toLowerCase() === 'id' ||
                   columnName.toLowerCase().endsWith('_id') ||
                   columnName.toLowerCase().startsWith('id_');

    patterns.isForeignKey = DetectionPatterns.FK_PATTERN.test(columnName) ||
                           (columnName.toLowerCase().includes('id') && !patterns.isId);

    // Check value patterns
    if (values.length > 0) {
      const stringValues = values.map(v => String(v));
      
      patterns.isUuid = stringValues.every(v => DetectionPatterns.UUID_PATTERN.test(v));
      patterns.isNumericId = stringValues.every(v => DetectionPatterns.NUMERIC_ID.test(v));
      
      // Email pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      patterns.isEmail = stringValues.every(v => emailPattern.test(v));
      
      // URL pattern
      const urlPattern = /^https?:\/\/.+/;
      patterns.isUrl = stringValues.every(v => urlPattern.test(v));
      
      // Phone pattern (basic)
      const phonePattern = /^\+?[\d\s\-\(\)]{10,}$/;
      patterns.isPhone = stringValues.every(v => phonePattern.test(v));
    }

    return patterns;
  }

  /**
   * Calculate string column statistics
   * @param {Array} values - String values
   * @returns {Object} Statistics
   */
  calculateStringStats(values) {
    const lengths = values.map(v => String(v).length);
    return {
      minLength: Math.min(...lengths),
      maxLength: Math.max(...lengths),
      avgLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
      emptyCount: values.filter(v => String(v).trim() === '').length
    };
  }

  /**
   * Calculate number column statistics
   * @param {Array} values - Number values
   * @returns {Object} Statistics
   */
  calculateNumberStats(values) {
    const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
    if (numbers.length === 0) return {};

    numbers.sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);

    return {
      min: numbers[0],
      max: numbers[numbers.length - 1],
      avg: sum / numbers.length,
      median: numbers[Math.floor(numbers.length / 2)],
      isInteger: numbers.every(n => Number.isInteger(n))
    };
  }

  /**
   * Calculate date column statistics
   * @param {Array} values - Date values
   * @returns {Object} Statistics
   */
  calculateDateStats(values) {
    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return {};

    dates.sort((a, b) => a - b);

    return {
      earliest: dates[0].toISOString(),
      latest: dates[dates.length - 1].toISOString(),
      span: dates[dates.length - 1] - dates[0],
      formatVariation: this.detectDateFormats(values)
    };
  }

  /**
   * Detect date format variations
   * @param {Array} values - Date string values
   * @returns {Array} Detected formats
   */
  detectDateFormats(values) {
    const formats = new Set();
    const samples = values.slice(0, 10);

    samples.forEach(value => {
      const str = String(value);
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
        formats.add('ISO');
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        formats.add('YYYY-MM-DD');
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        formats.add('MM/DD/YYYY');
      } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
        formats.add('MM-DD-YYYY');
      }
    });

    return Array.from(formats);
  }

  /**
   * Detect primary key candidate
   * @param {Object} columns - Column analysis
   * @returns {string|null} Primary key candidate column name
   */
  detectPrimaryKey(columns) {
    const candidates = [];

    Object.entries(columns).forEach(([columnName, analysis]) => {
      let score = 0;

      // High score for unique, non-nullable columns
      if (analysis.unique && !analysis.nullable) score += 50;

      // Bonus for ID naming patterns
      if (analysis.patterns.isId) score += 30;

      // Bonus for numeric or UUID patterns
      if (analysis.patterns.isUuid || analysis.patterns.isNumericId) score += 20;

      // Penalty for low frequency (missing in many records)
      if (analysis.frequency < 0.9) score -= 20;

      // Bonus for certain column names
      if (columnName.toLowerCase() === 'id') score += 40;
      if (columnName.toLowerCase() === 'pk') score += 30;

      if (score > 0) {
        candidates.push({ columnName, score, analysis });
      }
    });

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].score >= 50 ? candidates[0].columnName : null;
  }

  /**
   * Detect foreign key candidates
   * @param {Object} columns - Column analysis
   * @returns {Array} Foreign key candidates
   */
  detectForeignKeys(columns) {
    const candidates = [];

    Object.entries(columns).forEach(([columnName, analysis]) => {
      let score = 0;
      let referencedTable = null;

      // Check naming patterns for foreign keys
      if (analysis.patterns.isForeignKey) {
        score += 30;
        
        // Try to guess referenced table
        const match = columnName.match(DetectionPatterns.ID_SUFFIX);
        if (match) {
          referencedTable = match[1];
          score += 20;
        }
      }

      // Bonus for ID-like patterns but not primary key
      if ((analysis.patterns.isUuid || analysis.patterns.isNumericId) && !analysis.patterns.isId) {
        score += 20;
      }

      // Check if values look like they could reference another table
      if (analysis.type === DataTypes.STRING || analysis.type === DataTypes.NUMBER) {
        // High cardinality but not unique might indicate FK
        if (analysis.cardinality > 1 && !analysis.unique && analysis.cardinality < analysis.frequency * 100) {
          score += 15;
        }
      }

      if (score >= 20) {
        candidates.push({
          columnName,
          score,
          referencedTable,
          confidence: Math.min(score / 70, 1)
        });
      }
    });

    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Suggest indexes for table
   * @param {Object} columns - Column analysis
   * @returns {Array} Index suggestions
   */
  suggestIndexes(columns) {
    const suggestions = [];

    Object.entries(columns).forEach(([columnName, analysis]) => {
      // Unique constraint index
      if (analysis.unique && !analysis.nullable) {
        suggestions.push({
          type: 'unique',
          columns: [columnName],
          reason: 'Unique constraint',
          priority: 'high'
        });
      }

      // Foreign key index
      if (analysis.patterns.isForeignKey) {
        suggestions.push({
          type: 'index',
          columns: [columnName],
          reason: 'Foreign key performance',
          priority: 'medium'
        });
      }

      // Search field index
      if (analysis.patterns.isEmail || columnName.toLowerCase().includes('name')) {
        suggestions.push({
          type: 'index',
          columns: [columnName],
          reason: 'Common search field',
          priority: 'low'
        });
      }
    });

    return suggestions;
  }

  /**
   * Detect relationships between tables
   * @param {Object} tableAnalyses - Table analysis results
   * @returns {Array} Detected relationships
   */
  detectRelationships(tableAnalyses) {
    const relationships = [];
    const tableNames = Object.keys(tableAnalyses);

    // Check each table's foreign key candidates against other tables
    tableNames.forEach(fromTable => {
      const fromAnalysis = tableAnalyses[fromTable];
      
      fromAnalysis.foreignKeyCandidate.forEach(fkCandidate => {
        tableNames.forEach(toTable => {
          if (fromTable === toTable) return;

          const relationship = this.evaluateRelationship(
            fromTable,
            fkCandidate,
            toTable,
            tableAnalyses[toTable]
          );

          if (relationship && relationship.confidence >= this.confidenceThreshold) {
            relationships.push(relationship);
          }
        });
      });
    });

    // Remove duplicate relationships (keep highest confidence)
    const uniqueRelationships = this.deduplicateRelationships(relationships);
    
    return uniqueRelationships.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Evaluate potential relationship between tables
   * @param {string} fromTable - Source table name
   * @param {Object} fkCandidate - Foreign key candidate info
   * @param {string} toTable - Target table name
   * @param {Object} toAnalysis - Target table analysis
   * @returns {Object|null} Relationship or null
   */
  evaluateRelationship(fromTable, fkCandidate, toTable, toAnalysis) {
    let confidence = fkCandidate.confidence || 0;
    let relationshipType = RelationshipTypes.MANY_TO_ONE;
    let matchedColumn = null;

    // Check if referenced table name matches
    if (fkCandidate.referencedTable) {
      const normalizedRef = fkCandidate.referencedTable.toLowerCase();
      const normalizedTo = toTable.toLowerCase();
      
      if (normalizedTo.includes(normalizedRef) || normalizedRef.includes(normalizedTo)) {
        confidence += 0.3;
      }
    }

    // Look for matching primary key in target table
    if (toAnalysis.primaryKeyCandidate) {
      matchedColumn = toAnalysis.primaryKeyCandidate;
      confidence += 0.2;
    } else {
      // Look for ID-like columns
      const idColumns = Object.entries(toAnalysis.columns)
        .filter(([name, analysis]) => analysis.patterns.isId || name.toLowerCase() === 'id')
        .map(([name]) => name);

      if (idColumns.length > 0) {
        matchedColumn = idColumns[0];
        confidence += 0.1;
      }
    }

    // Check value overlap if both tables have data
    if (matchedColumn && toAnalysis.recordCount > 0) {
      const overlap = this.calculateValueOverlap(fromTable, fkCandidate.columnName, toTable, matchedColumn);
      confidence += overlap * 0.3;
    }

    // Determine relationship type based on data patterns
    if (fkCandidate.score > 50 && confidence > 0.7) {
      relationshipType = RelationshipTypes.ONE_TO_MANY;
    }

    if (confidence < this.confidenceThreshold) {
      return null;
    }

    return {
      id: `${fromTable}.${fkCandidate.columnName}->${toTable}.${matchedColumn}`,
      fromTable,
      fromColumn: fkCandidate.columnName,
      toTable,
      toColumn: matchedColumn,
      type: relationshipType,
      confidence: Math.min(confidence, 1),
      detectedAt: new Date().toISOString(),
      metadata: {
        fkCandidateScore: fkCandidate.score,
        referencedTableGuess: fkCandidate.referencedTable
      }
    };
  }

  /**
   * Calculate value overlap between two columns
   * @param {string} table1 - First table name
   * @param {string} column1 - First column name
   * @param {string} table2 - Second table name
   * @param {string} column2 - Second column name
   * @returns {number} Overlap ratio (0-1)
   */
  calculateValueOverlap(table1, column1, table2, column2) {
    try {
      const data1 = localStorageDB.getTable(table1);
      const data2 = localStorageDB.getTable(table2);
      
      if (!data1 || !data2) return 0;

      const records1 = Array.isArray(data1) ? data1 : [data1];
      const records2 = Array.isArray(data2) ? data2 : [data2];

      const values1 = new Set(
        records1
          .map(r => r[column1])
          .filter(v => v !== null && v !== undefined)
          .map(v => String(v))
      );

      const values2 = new Set(
        records2
          .map(r => r[column2])
          .filter(v => v !== null && v !== undefined)
          .map(v => String(v))
      );

      if (values1.size === 0 || values2.size === 0) return 0;

      const intersection = new Set([...values1].filter(v => values2.has(v)));
      return intersection.size / Math.min(values1.size, values2.size);
    } catch (error) {
      console.error('Error calculating value overlap:', error);
      return 0;
    }
  }

  /**
   * Remove duplicate relationships
   * @param {Array} relationships - Array of relationships
   * @returns {Array} Deduplicated relationships
   */
  deduplicateRelationships(relationships) {
    const seen = new Map();

    relationships.forEach(rel => {
      const key = `${rel.fromTable}.${rel.fromColumn}-${rel.toTable}.${rel.toColumn}`;
      const existing = seen.get(key);

      if (!existing || rel.confidence > existing.confidence) {
        seen.set(key, rel);
      }
    });

    return Array.from(seen.values());
  }

  /**
   * Generate ERD data structure
   * @returns {Object} ERD data for visualization
   */
  generateERD() {
    const analysis = this.analyzeAllTables();
    
    const erdData = {
      nodes: [],
      edges: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        ...analysis.statistics
      }
    };

    // Create nodes for each table
    Object.entries(analysis.tables).forEach(([tableName, tableInfo]) => {
      erdData.nodes.push({
        id: tableName,
        label: tableName,
        type: 'table',
        data: {
          columns: Object.entries(tableInfo.columns).map(([name, info]) => ({
            name,
            type: info.type,
            isPrimaryKey: name === tableInfo.primaryKeyCandidate,
            isForeignKey: tableInfo.foreignKeyCandidate.some(fk => fk.columnName === name),
            nullable: info.nullable,
            unique: info.unique
          })),
          recordCount: tableInfo.recordCount,
          primaryKey: tableInfo.primaryKeyCandidate
        },
        position: { x: 0, y: 0 } // Will be set by layout algorithm
      });
    });

    // Create edges for relationships
    analysis.relationships.forEach(rel => {
      erdData.edges.push({
        id: rel.id,
        source: rel.fromTable,
        target: rel.toTable,
        type: 'relationship',
        data: {
          relationshipType: rel.type,
          fromColumn: rel.fromColumn,
          toColumn: rel.toColumn,
          confidence: rel.confidence,
          label: `${rel.fromColumn} → ${rel.toColumn}`
        }
      });
    });

    return erdData;
  }

  /**
   * Set confidence threshold for relationship detection
   * @param {number} threshold - Confidence threshold (0-1)
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Clear cached analysis
   */
  clearCache() {
    this.tableAnalysis.clear();
    this.relationships.clear();
  }
}

/**
 * Singleton instance
 */
export const relationshipMapper = new RelationshipMapper();

export default RelationshipMapper;