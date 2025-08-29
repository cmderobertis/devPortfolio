/**
 * Self-Contained Database Manager
 * Complete localStorage database management interface
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardActions, Button, Typography, Combobox, TextField, Checkbox } from ../design-system';

// Simple LocalStorage Database Implementation
class SimpleDB {
  constructor(prefix = 'sdb_') {
    this.prefix = prefix;
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all tables
  getTables() {
    const tables = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        const tableName = key.replace(this.prefix, '');
        if (!tables[tableName]) {
          tables[tableName] = [];
        }
      }
    }
    
    // Load data for each table
    Object.keys(tables).forEach(tableName => {
      tables[tableName] = this.getTable(tableName);
    });
    
    return tables;
  }

  // Get specific table
  getTable(tableName) {
    try {
      const data = localStorage.getItem(this.prefix + tableName);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading table:', e);
      return [];
    }
  }

  // Save table
  saveTable(tableName, data) {
    try {
      localStorage.setItem(this.prefix + tableName, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving table:', e);
      return false;
    }
  }

  // Add record
  addRecord(tableName, record) {
    const table = this.getTable(tableName);
    const newRecord = { ...record, id: record.id || this.generateId() };
    table.push(newRecord);
    return this.saveTable(tableName, table);
  }

  // Update record
  updateRecord(tableName, id, updates) {
    const table = this.getTable(tableName);
    const index = table.findIndex(record => record.id === id);
    if (index !== -1) {
      table[index] = { ...table[index], ...updates };
      return this.saveTable(tableName, table);
    }
    return false;
  }

  // Delete record
  deleteRecord(tableName, id) {
    const table = this.getTable(tableName);
    const filtered = table.filter(record => record.id !== id);
    return this.saveTable(tableName, filtered);
  }

  // Delete table
  deleteTable(tableName) {
    localStorage.removeItem(this.prefix + tableName);
    return true;
  }

  // Clear all data
  clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  }

  // Infer schema from data
  inferSchema(data) {
    if (!data.length) return {};
    
    const schema = {};
    const sample = data[0];
    
    Object.keys(sample).forEach(key => {
      const value = sample[key];
      if (typeof value === 'string') {
        schema[key] = 'string';
      } else if (typeof value === 'number') {
        schema[key] = 'number';
      } else if (typeof value === 'boolean') {
        schema[key] = 'boolean';
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        schema[key] = 'date';
      } else {
        schema[key] = 'object';
      }
    });
    
    return schema;
  }
}

// DataTable Component
function DataTable({ data, columns, onEdit, onDelete, onAdd }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});

  const styles = {
    container: {
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: 'var(--md-sys-shape-corner-medium)',
      overflow: 'hidden',
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
    },
    controls: {
      padding: 'var(--md-sys-spacing-4)',
      backgroundColor: 'var(--md-sys-color-surface-container)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 'var(--md-sys-spacing-4)'
    },
    searchInput: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      minWidth: '200px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: 'var(--md-sys-spacing-3)',
      backgroundColor: 'var(--md-sys-color-surface-container-high)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      textAlign: 'left',
      fontWeight: 'var(--md-sys-typescale-title-medium-font-weight)',
      color: 'var(--md-sys-color-on-surface)',
      cursor: 'pointer',
      userSelect: 'none'
    },
    td: {
      padding: 'var(--md-sys-spacing-3)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      color: 'var(--md-sys-color-on-surface)',
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
    },
    editInput: {
      width: '100%',
      padding: 'var(--md-sys-spacing-2)',
      border: '1px solid var(--md-sys-color-outline)',
      borderRadius: 'var(--md-sys-shape-corner-extra-small)',
      backgroundColor: 'var(--md-sys-color-surface-container-highest)',
      color: 'var(--md-sys-color-on-surface)'
    },
    button: {
      padding: '0.375rem 0.75rem',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      margin: '0 0.125rem'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    }
  };

  // Determine column data types and unique values
  const columnInfo = useMemo(() => {
    const info = {};
    
    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(val => val != null);
      
      if (values.length === 0) {
        info[column] = { type: 'text', uniqueValues: [] };
        return;
      }

      // Determine data type
      let type = 'text';
      const firstValue = values[0];
      
      if (typeof firstValue === 'boolean') {
        type = 'boolean';
      } else if (typeof firstValue === 'number') {
        type = 'number';
      } else if (typeof firstValue === 'string') {
        // Check if it's a date
        const dateValue = new Date(firstValue);
        if (!isNaN(dateValue.getTime()) && firstValue.includes('-')) {
          type = 'date';
        } else {
          // Check if categorical (less than 20 unique values)
          const uniqueValues = [...new Set(values)];
          if (uniqueValues.length <= 20 && uniqueValues.length > 1) {
            type = 'categorical';
            info[column] = { type, uniqueValues };
            return;
          }
        }
      }
      
      info[column] = { type, uniqueValues: [] };
    });
    
    return info;
  }, [data, columns]);

  // Update column filter
  const updateColumnFilter = useCallback((field, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;
    
    // Apply global search filter
    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([field, filterValue]) => {
      if (filterValue != null && filterValue !== '' && filterValue !== false) {
        filtered = filtered.filter(row => {
          const cellValue = row[field];
          const columnType = columnInfo[field]?.type;

          switch (columnType) {
            case 'boolean':
              return filterValue === true ? cellValue === true : cellValue === false;
            case 'categorical':
              return cellValue === filterValue;
            case 'text':
            case 'number':
            case 'date':
            default:
              return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
          }
        });
      }
    });
    
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }
    
    return filtered;
  }, [data, searchTerm, columnFilters, sortField, sortDirection, columnInfo]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCellEdit = (rowIndex, field, value) => {
    const record = processedData[rowIndex];
    if (onEdit && record.id) {
      onEdit(record.id, { [field]: value });
    }
    setEditingCell(null);
  };

  const renderColumnFilter = (column) => {
    const columnType = columnInfo[column]?.type || 'text';
    const filterValue = columnFilters[column] || '';

    switch (columnType) {
      case 'boolean':
        return (
          <div style={{ width: '120px' }}>
            <Combobox
              options={[
                { label: 'All', value: '' },
                { label: 'True', value: true },
                { label: 'False', value: false }
              ]}
              value={filterValue}
              placeholder="Filter..."
              onSelectionChange={(option) => updateColumnFilter(column, option?.value || '')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </div>
        );
      
      case 'categorical':
        const options = [
          { label: 'All', value: '' },
          ...columnInfo[column].uniqueValues.map(value => ({
            label: String(value),
            value: value
          }))
        ];
        return (
          <div style={{ width: '150px' }}>
            <Combobox
              options={options}
              value={filterValue}
              placeholder="Filter..."
              onSelectionChange={(option) => updateColumnFilter(column, option?.value || '')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </div>
        );
      
      case 'text':
      case 'number':
      case 'date':
      default:
        return (
          <div style={{ width: '150px' }}>
            <TextField
              value={filterValue}
              placeholder="Filter..."
              size="small"
              variant="outlined"
              clearable
              onChange={(e) => updateColumnFilter(column, e.target.value)}
            />
          </div>
        );
    }
  };

  if (!data.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        No data available. Add some records to get started.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <Combobox
          options={[]}
          value={searchTerm}
          placeholder="Search records..."
          onInputChange={(value) => setSearchTerm(value)}
          onSelectionChange={() => {}}
          clearable
          style={{ minWidth: '200px' }}
        />
        {onAdd && (
          <Button
            variant="filled"
            onClick={onAdd}
          >
            Add Record
          </Button>
        )}
      </div>
      
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column}
                style={styles.th}
                onClick={() => handleSort(column)}
              >
                {column}
                {sortField === column && (
                  <span style={{ marginLeft: '0.25rem' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
            <th style={styles.th}>Actions</th>
          </tr>
          {/* Column filters */}
          <tr style={{ 
            backgroundColor: 'var(--md-sys-color-surface-container-low)', 
            borderBottom: '1px solid var(--md-sys-color-outline-variant)' 
          }}>
            {columns.map(column => (
              <th key={`filter-${column}`} style={{ 
                padding: 'var(--md-sys-spacing-2)', 
                backgroundColor: 'var(--md-sys-color-surface-container-low)' 
              }}>
                {renderColumnFilter(column)}
              </th>
            ))}
            <th style={{ 
              padding: 'var(--md-sys-spacing-2)', 
              backgroundColor: 'var(--md-sys-color-surface-container-low)' 
            }}></th>
          </tr>
        </thead>
        <tbody>
          {processedData.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map(column => {
                const isEditing = editingCell?.row === rowIndex && editingCell?.field === column;
                return (
                  <td
                    key={column}
                    style={styles.td}
                    onDoubleClick={() => setEditingCell({ row: rowIndex, field: column })}
                  >
                    {isEditing ? (
                      <input
                        style={styles.editInput}
                        defaultValue={row[column]}
                        autoFocus
                        onBlur={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(rowIndex, column, e.target.value);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                      />
                    ) : (
                      String(row[column])
                    )}
                  </td>
                );
              })}
              <td style={styles.td}>
                {onDelete && (
                  <Button
                    variant="outlined"
                    onClick={() => onDelete(row.id)}
                    style={{ color: 'var(--md-sys-color-error)', borderColor: 'var(--md-sys-color-error)' }}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Query Builder Component
function QueryBuilder({ tables, onQueryResult }) {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [results, setResults] = useState([]);

  const styles = {
    container: {
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: 'var(--md-sys-shape-corner-medium)',
      padding: 'var(--md-sys-spacing-4)'
    },
    section: {
      marginBottom: 'var(--md-sys-spacing-4)',
      paddingBottom: 'var(--md-sys-spacing-4)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      backgroundColor: 'var(--md-sys-color-surface-container)',
      borderRadius: 'var(--md-sys-shape-corner-small)',
      padding: 'var(--md-sys-spacing-4)'
    },
    select: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      marginRight: '0.5rem',
      backgroundColor: 'white',
      color: '#374151',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontWeight: '400',
      lineHeight: '1.5',
      minWidth: '120px',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")',
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem'
    },
    option: {
      color: '#374151',
      backgroundColor: 'white',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '0.875rem',
      padding: '0.5rem'
    },
    button: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    queryText: {
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      borderRadius: '0.375rem',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    }
  };

  const executeQuery = () => {
    if (!selectedTable) return;

    const tableData = tables[selectedTable] || [];
    let filteredData = [...tableData];

    // Apply conditions
    conditions.forEach(condition => {
      if (condition.field && condition.operator && condition.value) {
        filteredData = filteredData.filter(row => {
          const fieldValue = row[condition.field];
          const conditionValue = condition.value;

          switch (condition.operator) {
            case '=':
              return String(fieldValue) === String(conditionValue);
            case '!=':
              return String(fieldValue) !== String(conditionValue);
            case '>':
              return Number(fieldValue) > Number(conditionValue);
            case '<':
              return Number(fieldValue) < Number(conditionValue);
            case 'contains':
              return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            default:
              return true;
          }
        });
      }
    });

    // Apply field selection
    if (selectedFields.length > 0) {
      filteredData = filteredData.map(row => {
        const newRow = { id: row.id };
        selectedFields.forEach(field => {
          newRow[field] = row[field];
        });
        return newRow;
      });
    }

    setResults(filteredData);
    if (onQueryResult) {
      onQueryResult(filteredData);
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '=', value: '' }]);
  };

  const updateCondition = (index, key, value) => {
    const newConditions = [...conditions];
    newConditions[index][key] = value;
    setConditions(newConditions);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const tableFields = useMemo(() => {
    if (!selectedTable || !tables[selectedTable] || !tables[selectedTable].length) {
      return [];
    }
    const fields = Object.keys(tables[selectedTable][0]).filter(key => key !== 'id');
    return fields;
  }, [selectedTable, tables]);

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
        Query Builder
      </h3>

      {/* Table Selection */}
      <div style={styles.section}>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          1. Select Table
        </h4>
        <Combobox
          options={Object.keys(tables).map(tableName => ({ value: tableName, label: tableName }))}
          value={selectedTable}
          placeholder="Choose table..."
          onSelectionChange={(option) => {
            const tableName = option?.value || '';
            setSelectedTable(tableName);
            setSelectedFields([]);
            setConditions([]);
          }}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          style={{ minWidth: '200px' }}
        />
      </div>

      {/* Field Selection */}
      {selectedTable && (
        <div style={styles.section}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
            2. Select Fields (leave empty for all)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tableFields.map(field => (
              <label key={field} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginRight: '1rem',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: selectedFields.includes(field) ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFields([...selectedFields, field]);
                    } else {
                      setSelectedFields(selectedFields.filter(f => f !== field));
                    }
                  }}
                  style={{ 
                    marginRight: '0.5rem',
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
                <span style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: selectedFields.includes(field) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)'
                }}>
                  {field}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {selectedTable && (
        <div style={styles.section}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
            3. Add Conditions
          </h4>
          {conditions.map((condition, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <Combobox
                options={tableFields.map(field => ({ value: field, label: field }))}
                value={condition.field}
                placeholder="Select field..."
                onSelectionChange={(option) => updateCondition(index, 'field', option?.value || '')}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                style={{ minWidth: '150px' }}
              />
              
              <Combobox
                options={[
                  { value: '=', label: '=' },
                  { value: '!=', label: '!=' },
                  { value: '>', label: '>' },
                  { value: '<', label: '<' },
                  { value: 'contains', label: 'contains' }
                ]}
                value={condition.operator}
                onSelectionChange={(option) => updateCondition(index, 'operator', option?.value || '=')}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                style={{ minWidth: '120px' }}
              />
              
              <input
                style={{ 
                  padding: 'var(--md-sys-spacing-2)',
                  border: '1px solid var(--md-sys-color-outline)',
                  borderRadius: 'var(--md-sys-shape-corner-extra-small)',
                  backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                  color: 'var(--md-sys-color-on-surface)',
                  flex: 1,
                  fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                }}
                placeholder="Value"
                value={condition.value}
                onChange={(e) => updateCondition(index, 'value', e.target.value)}
              />
              
              <Button
                variant="outlined"
                onClick={() => removeCondition(index)}
                style={{ color: 'var(--md-sys-color-error)', borderColor: 'var(--md-sys-color-error)' }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button variant="tonal" onClick={addCondition}>
            Add Condition
          </Button>
        </div>
      )}

      {/* Execute Query */}
      {selectedTable && (
        <div style={styles.section}>
          <Button variant="filled" onClick={executeQuery}>
            Run Query
          </Button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
            Results ({results.length} records)
          </h4>
          <div style={{ 
            maxHeight: '300px', 
            overflow: 'auto', 
            border: '1px solid var(--md-sys-color-outline-variant)', 
            borderRadius: 'var(--md-sys-shape-corner-small)',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
              fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
            }}>
              <thead style={{ 
                backgroundColor: 'var(--md-sys-color-surface-container-high)', 
                position: 'sticky', 
                top: 0 
              }}>
                <tr>
                  {results.length > 0 && Object.keys(results[0]).map(key => (
                    <th key={key} style={{ 
                      padding: 'var(--md-sys-spacing-3)', 
                      textAlign: 'left', 
                      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontWeight: 'var(--md-sys-typescale-title-medium-font-weight)'
                    }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={{ 
                        padding: 'var(--md-sys-spacing-3)', 
                        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                      }}>
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Database Manager Component
export function DatabaseManager() {
  const [db] = useState(() => new SimpleDB());
  const [tables, setTables] = useState({});
  const [activeTable, setActiveTable] = useState(null);
  const [activeView, setActiveView] = useState('table'); // 'table' or 'query'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [newTableName, setNewTableName] = useState('');
  const [showCreateTable, setShowCreateTable] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      height: '600px',
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: 'var(--md-sys-shape-corner-medium)',
      overflow: 'hidden',
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
    },
    sidebar: {
      width: '250px',
      backgroundColor: 'var(--md-sys-color-surface-container-low)',
      borderRight: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      flexDirection: 'column'
    },
    sidebarHeader: {
      padding: 'var(--md-sys-spacing-4)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      backgroundColor: 'var(--md-sys-color-surface-container)'
    },
    sidebarContent: {
      flex: 1,
      padding: 'var(--md-sys-spacing-4)',
      overflow: 'auto'
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    mainHeader: {
      padding: 'var(--md-sys-spacing-4)',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      backgroundColor: 'var(--md-sys-color-surface-container)'
    },
    mainContent: {
      flex: 1,
      padding: 'var(--md-sys-spacing-4)',
      overflow: 'auto',
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
    },
    button: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      margin: '0.25rem'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    tableButton: {
      width: '100%',
      textAlign: 'left',
      backgroundColor: 'transparent',
      border: 'none',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      marginBottom: '0.25rem'
    },
    activeTableButton: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'var(--md-sys-color-surface-container)',
      borderRadius: 'var(--md-sys-shape-corner-large)',
      padding: 'var(--md-sys-spacing-6)',
      maxWidth: '500px',
      width: '90%',
      boxShadow: 'var(--md-sys-elevation-level3)'
    },
    input: {
      width: '100%',
      padding: 'var(--md-sys-spacing-3)',
      border: '1px solid var(--md-sys-color-outline)',
      borderRadius: 'var(--md-sys-shape-corner-small)',
      fontSize: 'var(--md-sys-typescale-body-large-font-size)',
      marginBottom: 'var(--md-sys-spacing-4)',
      backgroundColor: 'var(--md-sys-color-surface-container-highest)',
      color: 'var(--md-sys-color-on-surface)',
      fontFamily: 'var(--md-sys-typescale-body-large-font-family)'
    },
    label: {
      display: 'block',
      fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
      fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
      color: 'var(--md-sys-color-on-surface)',
      marginBottom: 'var(--md-sys-spacing-1)',
      fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
    }
  };

  // Sample data initialization
  useEffect(() => {
    const sampleData = {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, active: true },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, active: true },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, active: false }
      ],
      products: [
        { id: '1', name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true },
        { id: '2', name: 'Mouse', price: 29.99, category: 'Electronics', inStock: true },
        { id: '3', name: 'Keyboard', price: 79.99, category: 'Electronics', inStock: false }
      ]
    };

    const existingTables = db.getTables();
    
    // Add sample data if no tables exist
    if (Object.keys(existingTables).length === 0) {
      Object.entries(sampleData).forEach(([tableName, data]) => {
        db.saveTable(tableName, data);
      });
    }

    loadTables();
  }, [db]);

  const loadTables = useCallback(() => {
    const loadedTables = db.getTables();
    setTables(loadedTables);
    
    // Set first table as active if none selected
    if (!activeTable && Object.keys(loadedTables).length > 0) {
      setActiveTable(Object.keys(loadedTables)[0]);
    }
  }, [db, activeTable]);

  const handleCreateTable = () => {
    if (newTableName.trim()) {
      db.saveTable(newTableName.trim(), []);
      setNewTableName('');
      setShowCreateTable(false);
      loadTables();
      setActiveTable(newTableName.trim());
    }
  };

  const handleAddRecord = () => {
    if (!activeTable) return;
    
    const currentData = tables[activeTable] || [];
    const schema = currentData.length > 0 ? db.inferSchema(currentData) : {};
    
    // Initialize new record based on schema
    const initialRecord = {};
    Object.keys(schema).forEach(field => {
      if (field !== 'id') {
        switch (schema[field]) {
          case 'string':
            initialRecord[field] = '';
            break;
          case 'number':
            initialRecord[field] = 0;
            break;
          case 'boolean':
            initialRecord[field] = false;
            break;
          default:
            initialRecord[field] = '';
        }
      }
    });

    setNewRecord(initialRecord);
    setShowAddModal(true);
  };

  const handleSaveRecord = () => {
    if (!activeTable) return;
    
    db.addRecord(activeTable, newRecord);
    setNewRecord({});
    setShowAddModal(false);
    loadTables();
  };

  const handleEditRecord = (id, updates) => {
    if (!activeTable) return;
    
    db.updateRecord(activeTable, id, updates);
    loadTables();
  };

  const handleDeleteRecord = (id) => {
    if (!activeTable) return;
    
    if (confirm('Are you sure you want to delete this record?')) {
      db.deleteRecord(activeTable, id);
      loadTables();
    }
  };

  const handleDeleteTable = (tableName) => {
    if (confirm(`Are you sure you want to delete table "${tableName}"?`)) {
      db.deleteTable(tableName);
      if (activeTable === tableName) {
        setActiveTable(null);
      }
      loadTables();
    }
  };

  const handleExportData = () => {
    const exportData = {};
    Object.keys(tables).forEach(tableName => {
      exportData[tableName] = tables[tableName];
    });
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      db.clearAll();
      setTables({});
      setActiveTable(null);
    }
  };

  const currentTableData = activeTable ? tables[activeTable] || [] : [];
  const currentColumns = currentTableData.length > 0 
    ? Object.keys(currentTableData[0]).filter(key => key !== 'id')
    : [];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            Database Manager
          </h3>
        </div>
        
        <div style={styles.sidebarContent}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                Tables ({Object.keys(tables).length})
              </h4>
              <button
                style={{ ...styles.button, ...styles.primaryButton, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setShowCreateTable(true)}
              >
                + New
              </button>
            </div>
            
            {Object.keys(tables).length === 0 ? (
              <div style={{ 
                color: 'var(--md-sys-color-on-surface-variant)', 
                fontSize: 'var(--md-sys-typescale-body-medium-font-size)', 
                textAlign: 'center', 
                padding: 'var(--md-sys-spacing-4) 0',
                fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
              }}>
                No tables found
              </div>
            ) : (
              Object.keys(tables).map(tableName => (
                <div key={tableName} style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant={activeTable === tableName ? 'filled' : 'text'}
                    onClick={() => setActiveTable(tableName)}
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 'var(--md-sys-spacing-1)' }}
                  >
                    📋 {tableName} ({tables[tableName].length})
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleDeleteTable(tableName)}
                    title="Delete table"
                    style={{ color: 'var(--md-sys-color-error)', minWidth: 'auto' }}
                  >
                    🗑️
                  </Button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton, width: '100%', marginBottom: '0.5rem' }}
              onClick={handleExportData}
            >
              Export Data
            </button>
            <button
              style={{ ...styles.button, backgroundColor: '#fee2e2', color: '#991b1b', width: '100%' }}
              onClick={handleClearAll}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.mainHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              {activeView === 'query' ? 'Query Builder' : (activeTable ? `Table: ${activeTable}` : 'Select a table')}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant={activeView === 'table' ? 'filled' : 'outlined'}
                onClick={() => setActiveView('table')}
                icon={<span>📋</span>}
              >
                Table View
              </Button>
              <Button
                variant={activeView === 'query' ? 'filled' : 'outlined'}
                onClick={() => setActiveView('query')}
                icon={<span>🔍</span>}
              >
                Query Builder
              </Button>
            </div>
          </div>
        </div>
        
        <div style={styles.mainContent}>
          {activeView === 'query' ? (
            <QueryBuilder 
              tables={tables}
              onQueryResult={(results) => {
                console.log('Query results:', results);
              }}
            />
          ) : activeTable ? (
            <DataTable
              data={currentTableData}
              columns={currentColumns}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              onAdd={handleAddRecord}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--md-sys-color-on-surface-variant)', 
              padding: 'var(--md-sys-spacing-12)',
              fontSize: 'var(--md-sys-typescale-body-large-font-size)',
              fontFamily: 'var(--md-sys-typescale-body-large-font-family)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</div>
              <h3 style={{ marginBottom: '1rem' }}>Welcome to Database Manager</h3>
              <p style={{ marginBottom: '2rem' }}>
                Select a table from the sidebar to view and manage your data, or create a new table to get started.
              </p>
              <Button
                variant="filled"
                onClick={() => setShowCreateTable(true)}
              >
                Create Your First Table
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Table Modal */}
      {showCreateTable && (
        <div style={styles.modal} onClick={() => setShowCreateTable(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Create New Table</h3>
            <label style={styles.label}>Table Name</label>
            <input
              style={styles.input}
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Enter table name"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="filled"
                onClick={handleCreateTable}
              >
                Create Table
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowCreateTable(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Record</h3>
            {Object.keys(newRecord).map(field => (
              <div key={field}>
                <label style={styles.label}>{field}</label>
                <input
                  style={styles.input}
                  value={newRecord[field] || ''}
                  onChange={(e) => setNewRecord(prev => ({
                    ...prev,
                    [field]: e.target.value
                  }))}
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="filled"
                onClick={handleSaveRecord}
              >
                Save Record
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseManager;