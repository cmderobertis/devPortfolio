/**
 * QueryBuilder Component
 * Visual query builder for localStorage database
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LocalStorageDB } from '../utils/localStorageDB.js';
import { QueryBuilder as QueryEngine } from '../utils/queryEngine.js';

export function QueryBuilder({ onResults, onClose }) {
  const [db] = useState(() => new LocalStorageDB());
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(['*']);
  const [conditions, setConditions] = useState([]);
  const [sortBy, setSortBy] = useState([]);
  const [limit, setLimit] = useState('');
  const [results, setResults] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Operators for conditions
  const operators = [
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater Than or Equal' },
    { value: '<=', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'in', label: 'In List' },
    { value: 'between', label: 'Between' }
  ];

  // Styles
  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const headerStyle = {
    backgroundColor: '#f9fafb',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: { backgroundColor: '#3b82f6', color: 'white' },
      secondary: { backgroundColor: '#f3f4f6', color: '#374151' },
      danger: { backgroundColor: '#ef4444', color: 'white' },
      success: { backgroundColor: '#10b981', color: 'white' }
    };

    return {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      margin: '0 0.25rem',
      ...variants[variant]
    };
  };

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    margin: '0.25rem'
  };

  const sectionStyle = {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6'
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.75rem'
  };

  const conditionRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem'
  };

  // Load tables on mount
  useEffect(() => {
    try {
      const availableTables = db.discoverTables();
      setTables(availableTables);
      if (availableTables.length > 0 && !selectedTable) {
        setSelectedTable(availableTables[0]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [db, selectedTable]);

  // Load fields when table changes
  useEffect(() => {
    if (selectedTable) {
      try {
        const schema = db.getSchema(selectedTable);
        const tableFields = schema.fields ? Object.keys(schema.fields) : [];
        
        // If no schema, infer from data
        if (tableFields.length === 0) {
          const data = db.select(selectedTable, { limit: 1 });
          if (data.length > 0) {
            tableFields.push(...Object.keys(data[0]));
          }
        }
        
        setFields(tableFields);
        setSelectedFields(['*']);
        setConditions([]);
        setSortBy([]);
      } catch (err) {
        setError(err.message);
      }
    }
  }, [db, selectedTable]);

  // Generate query text
  useEffect(() => {
    if (!selectedTable) {
      setQueryText('');
      return;
    }

    const parts = [`SELECT ${selectedFields.join(', ')} FROM ${selectedTable}`];

    if (conditions.length > 0) {
      const whereClause = conditions
        .filter(c => c.field && c.operator && c.value !== '')
        .map(c => {
          if (c.operator === 'contains') {
            return `${c.field} LIKE '%${c.value}%'`;
          } else if (c.operator === 'startsWith') {
            return `${c.field} LIKE '${c.value}%'`;
          } else if (c.operator === 'endsWith') {
            return `${c.field} LIKE '%${c.value}'`;
          } else if (c.operator === 'in') {
            return `${c.field} IN (${c.value.split(',').map(v => `'${v.trim()}'`).join(', ')})`;
          } else if (c.operator === 'between') {
            const [min, max] = c.value.split(',').map(v => v.trim());
            return `${c.field} BETWEEN '${min}' AND '${max}'`;
          } else {
            return `${c.field} ${c.operator} '${c.value}'`;
          }
        })
        .join(' AND ');
      
      if (whereClause) {
        parts.push(`WHERE ${whereClause}`);
      }
    }

    if (sortBy.length > 0) {
      const orderClause = sortBy
        .filter(s => s.field)
        .map(s => `${s.field} ${s.direction || 'ASC'}`)
        .join(', ');
      
      if (orderClause) {
        parts.push(`ORDER BY ${orderClause}`);
      }
    }

    if (limit && parseInt(limit) > 0) {
      parts.push(`LIMIT ${limit}`);
    }

    setQueryText(parts.join(' '));
  }, [selectedTable, selectedFields, conditions, sortBy, limit]);

  // Handlers
  const handleAddCondition = useCallback(() => {
    setConditions(prev => [...prev, {
      field: fields[0] || '',
      operator: '=',
      value: '',
      logicalOperator: prev.length > 0 ? 'AND' : ''
    }]);
  }, [fields]);

  const handleRemoveCondition = useCallback((index) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleConditionChange = useCallback((index, field, value) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  }, []);

  const handleAddSort = useCallback(() => {
    setSortBy(prev => [...prev, {
      field: fields[0] || '',
      direction: 'ASC'
    }]);
  }, [fields]);

  const handleRemoveSort = useCallback((index) => {
    setSortBy(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSortChange = useCallback((index, field, value) => {
    setSortBy(prev => prev.map((sort, i) => 
      i === index ? { ...sort, [field]: value } : sort
    ));
  }, []);

  const executeQuery = useCallback(async () => {
    if (!selectedTable) {
      setError('Please select a table');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryBuilder = new QueryEngine(selectedTable);

      // Apply field selection
      if (!selectedFields.includes('*')) {
        queryBuilder.select(selectedFields);
      }

      // Apply conditions
      conditions.forEach(condition => {
        if (condition.field && condition.operator && condition.value !== '') {
          queryBuilder.where(condition.field, condition.operator, condition.value);
        }
      });

      // Apply sorting
      sortBy.forEach(sort => {
        if (sort.field) {
          queryBuilder.orderBy(sort.field, sort.direction);
        }
      });

      // Apply limit
      if (limit && parseInt(limit) > 0) {
        queryBuilder.limit(parseInt(limit));
      }

      const queryResults = queryBuilder.execute(db);
      setResults(queryResults);

      if (onResults) {
        onResults(queryResults, queryText);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [db, selectedTable, selectedFields, conditions, sortBy, limit, queryText, onResults]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Query Builder</h2>
        <div>
          <button style={buttonStyle('success')} onClick={executeQuery} disabled={loading}>
            {loading ? 'Running...' : 'Run Query'}
          </button>
          {onClose && (
            <button style={buttonStyle('secondary')} onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {error && (
          <div style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '0.875rem'
          }}>
            Error: {error}
          </div>
        )}

        {/* Table Selection */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>1. Select Table</h3>
          <select
            style={{ ...inputStyle, width: '200px' }}
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Choose table...</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>

        {/* Field Selection */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>2. Select Fields</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes('*')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFields(['*']);
                    } else {
                      setSelectedFields([]);
                    }
                  }}
                  style={{ marginRight: '0.25rem' }}
                />
                All Fields (*)
              </label>
              
              {fields.map(field => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field) || selectedFields.includes('*')}
                    onChange={(e) => {
                      if (selectedFields.includes('*')) {
                        setSelectedFields(e.target.checked ? [field] : []);
                      } else {
                        setSelectedFields(prev => 
                          e.target.checked 
                            ? [...prev, field]
                            : prev.filter(f => f !== field)
                        );
                      }
                    }}
                    disabled={selectedFields.includes('*')}
                    style={{ marginRight: '0.25rem' }}
                  />
                  {field}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>3. Add Conditions (WHERE)</h3>
            {conditions.map((condition, index) => (
              <div key={index} style={conditionRowStyle}>
                {index > 0 && (
                  <select
                    style={{ ...inputStyle, width: '80px' }}
                    value={condition.logicalOperator}
                    onChange={(e) => handleConditionChange(index, 'logicalOperator', e.target.value)}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
                
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={condition.field}
                  onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                >
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={condition.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                
                <input
                  style={{ ...inputStyle, width: '150px' }}
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                />
                
                <button
                  style={{ ...buttonStyle('danger'), padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveCondition(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button style={buttonStyle('secondary')} onClick={handleAddCondition}>
              Add Condition
            </button>
          </div>
        )}

        {/* Sorting */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>4. Add Sorting (ORDER BY)</h3>
            {sortBy.map((sort, index) => (
              <div key={index} style={conditionRowStyle}>
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={sort.field}
                  onChange={(e) => handleSortChange(index, 'field', e.target.value)}
                >
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <select
                  style={{ ...inputStyle, width: '100px' }}
                  value={sort.direction}
                  onChange={(e) => handleSortChange(index, 'direction', e.target.value)}
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
                
                <button
                  style={{ ...buttonStyle('danger'), padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveSort(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button style={buttonStyle('secondary')} onClick={handleAddSort}>
              Add Sort
            </button>
          </div>
        )}

        {/* Limit */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>5. Limit Results</h3>
            <input
              style={{ ...inputStyle, width: '100px' }}
              type="number"
              placeholder="Limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        )}

        {/* Generated Query */}
        {queryText && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Generated Query</h3>
            <div style={{
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.375rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflowX: 'auto'
            }}>
              {queryText}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Results ({results.length} rows)</h3>
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
                  <tr>
                    {results.length > 0 && Object.keys(results[0]).map(key => (
                      <th key={key} style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
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
                          padding: '0.75rem',
                          borderBottom: '1px solid #f3f4f6',
                          color: '#6b7280'
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
    </div>
  );
}

export default QueryBuilder;