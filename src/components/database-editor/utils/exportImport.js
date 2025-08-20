/**
 * Export/Import Utilities for LocalStorage Database
 * Handles data export to various formats and import from external sources
 */

import { localStorageDB, DataTypes } from './localStorageDB.js';
import { format } from 'date-fns';

/**
 * Export formats
 */
export const ExportFormats = {
  JSON: 'json',
  CSV: 'csv',
  SQL: 'sql',
  XML: 'xml',
  YAML: 'yaml'
};

/**
 * Export/Import Manager Class
 */
export class ExportImportManager {
  constructor() {
    this.csvDelimiter = ',';
    this.csvQuoteChar = '"';
    this.csvEscapeChar = '"';
  }

  /**
   * Export table data to specified format
   * @param {string} tableName - Name of the table
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Object} Export result with data and metadata
   */
  exportTable(tableName, format = ExportFormats.JSON, options = {}) {
    const data = localStorageDB.getTable(tableName);
    if (!data) {
      return {
        success: false,
        error: `Table '${tableName}' not found`
      };
    }

    const exportOptions = {
      includeMetadata: options.includeMetadata !== false,
      prettify: options.prettify !== false,
      dateFormat: options.dateFormat || 'iso',
      ...options
    };

    try {
      let exportedData;
      let mimeType;
      let fileExtension;

      switch (format.toLowerCase()) {
        case ExportFormats.JSON:
          ({ data: exportedData, mimeType, fileExtension } = this.exportAsJSON(tableName, data, exportOptions));
          break;
        
        case ExportFormats.CSV:
          ({ data: exportedData, mimeType, fileExtension } = this.exportAsCSV(tableName, data, exportOptions));
          break;
        
        case ExportFormats.SQL:
          ({ data: exportedData, mimeType, fileExtension } = this.exportAsSQL(tableName, data, exportOptions));
          break;
        
        case ExportFormats.XML:
          ({ data: exportedData, mimeType, fileExtension } = this.exportAsXML(tableName, data, exportOptions));
          break;
        
        case ExportFormats.YAML:
          ({ data: exportedData, mimeType, fileExtension } = this.exportAsYAML(tableName, data, exportOptions));
          break;
        
        default:
          return {
            success: false,
            error: `Unsupported export format: ${format}`
          };
      }

      return {
        success: true,
        data: exportedData,
        metadata: {
          tableName,
          format,
          exportedAt: new Date().toISOString(),
          recordCount: Array.isArray(data) ? data.length : 1,
          mimeType,
          fileExtension,
          suggestedFilename: `${tableName}_${format}_${this.getTimestamp()}.${fileExtension}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error.message}`
      };
    }
  }

  /**
   * Export as JSON
   * @param {string} tableName - Table name
   * @param {any} data - Table data
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportAsJSON(tableName, data, options) {
    const exportObject = {
      table: tableName,
      exportedAt: new Date().toISOString(),
      data: data
    };

    if (options.includeMetadata) {
      const metadata = localStorageDB.getMetadata();
      exportObject.metadata = metadata.tables[tableName] || {};
    }

    const jsonString = options.prettify 
      ? JSON.stringify(exportObject, null, 2)
      : JSON.stringify(exportObject);

    return {
      data: jsonString,
      mimeType: 'application/json',
      fileExtension: 'json'
    };
  }

  /**
   * Export as CSV
   * @param {string} tableName - Table name
   * @param {any} data - Table data
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportAsCSV(tableName, data, options) {
    // Convert single objects to arrays
    const records = Array.isArray(data) ? data : [data];
    
    if (records.length === 0) {
      return {
        data: '',
        mimeType: 'text/csv',
        fileExtension: 'csv'
      };
    }

    // Handle primitive values
    if (typeof records[0] !== 'object' || records[0] === null) {
      const csvContent = [
        'value',
        ...records.map(record => this.escapeCSVValue(record))
      ].join('\n');

      return {
        data: csvContent,
        mimeType: 'text/csv',
        fileExtension: 'csv'
      };
    }

    // Extract all unique columns
    const allColumns = new Set();
    records.forEach(record => {
      if (typeof record === 'object' && record !== null) {
        Object.keys(record).forEach(key => allColumns.add(key));
      }
    });

    const columns = Array.from(allColumns);
    
    // Create CSV header
    const header = columns.map(col => this.escapeCSVValue(col)).join(this.csvDelimiter);
    
    // Create CSV rows
    const rows = records.map(record => {
      return columns.map(col => {
        const value = record[col];
        return this.escapeCSVValue(this.formatValueForExport(value, options.dateFormat));
      }).join(this.csvDelimiter);
    });

    const csvContent = [header, ...rows].join('\n');

    return {
      data: csvContent,
      mimeType: 'text/csv',
      fileExtension: 'csv'
    };
  }

  /**
   * Export as SQL
   * @param {string} tableName - Table name
   * @param {any} data - Table data
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportAsSQL(tableName, data, options) {
    const records = Array.isArray(data) ? data : [data];
    const sqlStatements = [];

    // Add header comment
    sqlStatements.push(`-- Export of table '${tableName}'`);
    sqlStatements.push(`-- Generated on ${new Date().toISOString()}`);
    sqlStatements.push('');

    if (records.length === 0) {
      sqlStatements.push(`-- No data found in table '${tableName}'`);
    } else if (typeof records[0] !== 'object' || records[0] === null) {
      // Handle primitive values
      sqlStatements.push(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (`);
      sqlStatements.push('  `value` TEXT');
      sqlStatements.push(');');
      sqlStatements.push('');

      records.forEach(record => {
        const value = this.escapeSQLValue(record);
        sqlStatements.push(`INSERT INTO \`${tableName}\` (\`value\`) VALUES (${value});`);
      });
    } else {
      // Handle object records
      const columns = this.extractUniqueColumns(records);
      
      // Create table statement
      sqlStatements.push(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (`);
      const columnDefs = columns.map(col => `  \`${col}\` TEXT`);
      sqlStatements.push(columnDefs.join(',\n'));
      sqlStatements.push(');');
      sqlStatements.push('');

      // Insert statements
      records.forEach(record => {
        const columnNames = columns.map(col => `\`${col}\``).join(', ');
        const values = columns.map(col => {
          const value = record[col];
          return this.escapeSQLValue(this.formatValueForExport(value, options.dateFormat));
        }).join(', ');

        sqlStatements.push(`INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${values});`);
      });
    }

    return {
      data: sqlStatements.join('\n'),
      mimeType: 'application/sql',
      fileExtension: 'sql'
    };
  }

  /**
   * Export as XML
   * @param {string} tableName - Table name
   * @param {any} data - Table data
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportAsXML(tableName, data, options) {
    const records = Array.isArray(data) ? data : [data];
    const xmlLines = [];

    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push(`<table name="${this.escapeXMLAttribute(tableName)}" exported="${new Date().toISOString()}">`);

    if (typeof records[0] !== 'object' || records[0] === null) {
      // Handle primitive values
      records.forEach(record => {
        xmlLines.push(`  <record>`);
        xmlLines.push(`    <value>${this.escapeXMLContent(String(record))}</value>`);
        xmlLines.push(`  </record>`);
      });
    } else {
      // Handle object records
      records.forEach(record => {
        xmlLines.push(`  <record>`);
        Object.entries(record).forEach(([key, value]) => {
          const formattedValue = this.formatValueForExport(value, options.dateFormat);
          xmlLines.push(`    <${this.sanitizeXMLTagName(key)}>${this.escapeXMLContent(String(formattedValue))}</${this.sanitizeXMLTagName(key)}>`);
        });
        xmlLines.push(`  </record>`);
      });
    }

    xmlLines.push('</table>');

    return {
      data: xmlLines.join('\n'),
      mimeType: 'application/xml',
      fileExtension: 'xml'
    };
  }

  /**
   * Export as YAML
   * @param {string} tableName - Table name
   * @param {any} data - Table data
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportAsYAML(tableName, data, options) {
    const exportObject = {
      table: tableName,
      exportedAt: new Date().toISOString(),
      data: data
    };

    // Simple YAML serialization (for basic cases)
    const yamlContent = this.convertToYAML(exportObject, 0);

    return {
      data: yamlContent,
      mimeType: 'application/x-yaml',
      fileExtension: 'yaml'
    };
  }

  /**
   * Import data from various formats
   * @param {string} content - Data content to import
   * @param {string} format - Data format
   * @param {Object} options - Import options
   * @returns {Object} Import result
   */
  importData(content, format = ExportFormats.JSON, options = {}) {
    const importOptions = {
      tableName: options.tableName,
      overwrite: options.overwrite === true,
      validateData: options.validateData !== false,
      ...options
    };

    try {
      let parsedData;
      let suggestedTableName;

      switch (format.toLowerCase()) {
        case ExportFormats.JSON:
          ({ data: parsedData, tableName: suggestedTableName } = this.importFromJSON(content, importOptions));
          break;
        
        case ExportFormats.CSV:
          ({ data: parsedData, tableName: suggestedTableName } = this.importFromCSV(content, importOptions));
          break;
        
        default:
          return {
            success: false,
            error: `Import format '${format}' not yet supported`
          };
      }

      const tableName = importOptions.tableName || suggestedTableName || `imported_${this.getTimestamp()}`;

      // Check if table exists and handle overwrite
      const existingData = localStorageDB.getTable(tableName);
      if (existingData && !importOptions.overwrite) {
        return {
          success: false,
          error: `Table '${tableName}' already exists. Use overwrite option to replace.`
        };
      }

      // Store the data
      const success = localStorageDB.setTable(tableName, parsedData);
      
      if (success) {
        return {
          success: true,
          tableName,
          recordCount: Array.isArray(parsedData) ? parsedData.length : 1,
          message: `Successfully imported data to table '${tableName}'`
        };
      } else {
        return {
          success: false,
          error: 'Failed to store imported data'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error.message}`
      };
    }
  }

  /**
   * Import from JSON
   * @param {string} content - JSON content
   * @param {Object} options - Import options
   * @returns {Object} Parsed data
   */
  importFromJSON(content, options) {
    const parsed = JSON.parse(content);
    
    // Check if it's our export format
    if (parsed.table && parsed.data !== undefined) {
      return {
        data: parsed.data,
        tableName: parsed.table
      };
    }

    // Raw JSON data
    return {
      data: parsed,
      tableName: null
    };
  }

  /**
   * Import from CSV
   * @param {string} content - CSV content
   * @param {Object} options - Import options
   * @returns {Object} Parsed data
   */
  importFromCSV(content, options) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { data: [], tableName: null };
    }

    const delimiter = options.delimiter || this.csvDelimiter;
    const headers = this.parseCSVLine(lines[0], delimiter);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter);
      const record = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        record[header] = this.parseCSVValue(value);
      });

      records.push(record);
    }

    return {
      data: records,
      tableName: null
    };
  }

  /**
   * Download exported data as file
   * @param {string} content - File content
   * @param {string} filename - Suggested filename
   * @param {string} mimeType - MIME type
   */
  downloadAsFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Utility methods

  /**
   * Get timestamp string for filenames
   * @returns {string} Timestamp
   */
  getTimestamp() {
    return format(new Date(), 'yyyyMMdd_HHmmss');
  }

  /**
   * Format value for export
   * @param {any} value - Value to format
   * @param {string} dateFormat - Date format preference
   * @returns {string} Formatted value
   */
  formatValueForExport(value, dateFormat = 'iso') {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      const date = new Date(value);
      switch (dateFormat) {
        case 'iso':
          return date.toISOString();
        case 'local':
          return date.toLocaleString();
        case 'date-only':
          return date.toISOString().split('T')[0];
        default:
          return date.toISOString();
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Escape CSV value
   * @param {any} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSVValue(value) {
    const stringValue = String(value);
    
    if (stringValue.includes(this.csvDelimiter) || 
        stringValue.includes(this.csvQuoteChar) || 
        stringValue.includes('\n') || 
        stringValue.includes('\r')) {
      return this.csvQuoteChar + 
             stringValue.replace(new RegExp(this.csvQuoteChar, 'g'), this.csvEscapeChar + this.csvQuoteChar) + 
             this.csvQuoteChar;
    }
    
    return stringValue;
  }

  /**
   * Parse CSV line
   * @param {string} line - CSV line
   * @param {string} delimiter - Field delimiter
   * @returns {Array} Parsed values
   */
  parseCSVLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === this.csvQuoteChar && !inQuotes) {
        inQuotes = true;
      } else if (char === this.csvQuoteChar && inQuotes) {
        if (line[i + 1] === this.csvQuoteChar) {
          current += this.csvQuoteChar;
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    values.push(current);
    return values;
  }

  /**
   * Parse CSV value with type inference
   * @param {string} value - String value
   * @returns {any} Parsed value
   */
  parseCSVValue(value) {
    if (value === '') return null;
    
    // Try number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    
    // Try boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try date
    if (!isNaN(Date.parse(value))) {
      return new Date(value).toISOString();
    }
    
    return value;
  }

  /**
   * Escape SQL value
   * @param {any} value - Value to escape
   * @returns {string} Escaped SQL value
   */
  escapeSQLValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    return "'" + String(value).replace(/'/g, "''") + "'";
  }

  /**
   * Escape XML content
   * @param {string} content - Content to escape
   * @returns {string} Escaped content
   */
  escapeXMLContent(content) {
    return String(content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Escape XML attribute
   * @param {string} value - Attribute value
   * @returns {string} Escaped value
   */
  escapeXMLAttribute(value) {
    return this.escapeXMLContent(value);
  }

  /**
   * Sanitize XML tag name
   * @param {string} name - Tag name
   * @returns {string} Sanitized name
   */
  sanitizeXMLTagName(name) {
    return String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Extract unique columns from records
   * @param {Array} records - Array of records
   * @returns {Array} Unique column names
   */
  extractUniqueColumns(records) {
    const columns = new Set();
    records.forEach(record => {
      if (typeof record === 'object' && record !== null) {
        Object.keys(record).forEach(key => columns.add(key));
      }
    });
    return Array.from(columns);
  }

  /**
   * Simple YAML conversion
   * @param {any} obj - Object to convert
   * @param {number} indent - Current indentation level
   * @returns {string} YAML string
   */
  convertToYAML(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    
    if (obj === null || obj === undefined) {
      return 'null';
    }
    
    if (typeof obj === 'string') {
      return obj.includes('\n') ? `|\n${spaces}  ${obj.split('\n').join(`\n${spaces}  `)}` : obj;
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => `${spaces}- ${this.convertToYAML(item, indent + 1)}`).join('\n');
    }
    
    if (typeof obj === 'object') {
      return Object.entries(obj)
        .map(([key, value]) => `${spaces}${key}: ${this.convertToYAML(value, indent + 1)}`)
        .join('\n');
    }
    
    return String(obj);
  }
}

/**
 * Singleton instance
 */
export const exportImportManager = new ExportImportManager();

export default ExportImportManager;