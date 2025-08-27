/**
 * QueryBuilder Component
 * Visual query builder for localStorage database
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LocalStorageDB } from '../utils/localStorageDB.js';
import { QueryBuilder as QueryEngine, AggregationFunctions } from '../utils/queryEngine.js';

export function QueryBuilder({ onResults, onClose }) {
  const [db] = useState(() => new LocalStorageDB());
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(['*']);
  const [conditions, setConditions] = useState([]);
  const [sortBy, setSortBy] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [aggregations, setAggregations] = useState([]);
  const [having, setHaving] = useState([]);
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

  // Aggregation functions
  const aggregationOptions = [
    { value: AggregationFunctions.COUNT, label: 'COUNT' },
    { value: AggregationFunctions.COUNT_DISTINCT, label: 'COUNT DISTINCT' },
    { value: AggregationFunctions.SUM, label: 'SUM' },
    { value: AggregationFunctions.AVG, label: 'AVERAGE' },
    { value: AggregationFunctions.MIN, label: 'MIN' },
    { value: AggregationFunctions.MAX, label: 'MAX' },
    { value: AggregationFunctions.FIRST, label: 'FIRST' },
    { value: AggregationFunctions.LAST, label: 'LAST' },
    { value: AggregationFunctions.STRING_AGG, label: 'STRING_AGG' }
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
        setGroupBy([]);
        setAggregations([]);
        setHaving([]);
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

    let selectClause = selectedFields.join(', ');
    
    // If we have grouping or aggregations, modify the SELECT clause
    if (groupBy.length > 0 || aggregations.length > 0) {
      const selectParts = [];
      
      // Add group by fields
      if (groupBy.length > 0) {
        selectParts.push(...groupBy.map(g => g.field));
      }
      
      // Add aggregations
      if (aggregations.length > 0) {
        selectParts.push(...aggregations.map(agg => {
          const funcCall = agg.field ? `${agg.func}(${agg.field})` : `${agg.func}(*)`;
          return agg.alias ? `${funcCall} AS ${agg.alias}` : funcCall;
        }));
      }
      
      selectClause = selectParts.length > 0 ? selectParts.join(', ') : '*';
    }
    
    const parts = [`SELECT ${selectClause} FROM ${selectedTable}`];

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

    if (groupBy.length > 0) {
      const groupClause = groupBy
        .filter(g => g.field)
        .map(g => g.field)
        .join(', ');
      
      if (groupClause) {
        parts.push(`GROUP BY ${groupClause}`);
      }
    }

    if (having.length > 0) {
      const havingClause = having
        .filter(h => h.field && h.operator && h.value !== '')
        .map(h => `${h.field} ${h.operator} '${h.value}'`)
        .join(' AND ');
      
      if (havingClause) {
        parts.push(`HAVING ${havingClause}`);
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
  }, [selectedTable, selectedFields, conditions, groupBy, aggregations, having, sortBy, limit]);

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

  // Group By handlers
  const handleAddGroupBy = useCallback(() => {
    setGroupBy(prev => [...prev, {
      field: fields[0] || ''
    }]);
  }, [fields]);

  const handleRemoveGroupBy = useCallback((index) => {
    setGroupBy(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleGroupByChange = useCallback((index, field, value) => {
    setGroupBy(prev => prev.map((group, i) => 
      i === index ? { ...group, [field]: value } : group
    ));
  }, []);

  // Aggregation handlers
  const handleAddAggregation = useCallback(() => {
    setAggregations(prev => [...prev, {
      func: AggregationFunctions.COUNT,
      field: '',
      alias: ''
    }]);
  }, []);

  const handleRemoveAggregation = useCallback((index) => {
    setAggregations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAggregationChange = useCallback((index, field, value) => {
    setAggregations(prev => prev.map((agg, i) => 
      i === index ? { ...agg, [field]: value } : agg
    ));
  }, []);

  // Having handlers
  const handleAddHaving = useCallback(() => {
    setHaving(prev => [...prev, {
      field: '',
      operator: '=',
      value: ''
    }]);
  }, []);

  const handleRemoveHaving = useCallback((index) => {
    setHaving(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleHavingChange = useCallback((index, field, value) => {
    setHaving(prev => prev.map((having, i) => 
      i === index ? { ...having, [field]: value } : having
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

      // Apply field selection (only if no grouping/aggregation)
      if (!selectedFields.includes('*') && groupBy.length === 0 && aggregations.length === 0) {
        queryBuilder.select(selectedFields);
      }

      // Apply conditions
      conditions.forEach(condition => {
        if (condition.field && condition.operator && condition.value !== '') {
          queryBuilder.where(condition.field, condition.operator, condition.value);
        }
      });

      // Apply grouping
      if (groupBy.length > 0) {
        const groupFields = groupBy.filter(g => g.field).map(g => g.field);
        if (groupFields.length > 0) {
          queryBuilder.groupBy(groupFields);
        }
      }

      // Apply aggregations
      aggregations.forEach(agg => {
        if (agg.func) {
          queryBuilder.aggregate(agg.func, agg.field || null, agg.alias || null);
        }
      });

      // Apply having conditions
      having.forEach(condition => {
        if (condition.field && condition.operator && condition.value !== '') {
          queryBuilder.having(condition.field, condition.operator, condition.value);
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
  }, [db, selectedTable, selectedFields, conditions, groupBy, aggregations, having, sortBy, limit, queryText, onResults]);

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

        {/* GROUP BY */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>5. Group By Fields</h3>
            {groupBy.map((group, index) => (
              <div key={index} style={conditionRowStyle}>
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={group.field}
                  onChange={(e) => handleGroupByChange(index, 'field', e.target.value)}
                >
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <button
                  style={{ ...buttonStyle('danger'), padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveGroupBy(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button style={buttonStyle('secondary')} onClick={handleAddGroupBy}>
              Add Group By
            </button>
          </div>
        )}

        {/* Aggregations */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>6. Add Aggregations</h3>
            {aggregations.map((agg, index) => (
              <div key={index} style={conditionRowStyle}>
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={agg.func}
                  onChange={(e) => handleAggregationChange(index, 'func', e.target.value)}
                >
                  {aggregationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={agg.field || ''}
                  onChange={(e) => handleAggregationChange(index, 'field', e.target.value)}
                  disabled={agg.func === AggregationFunctions.COUNT && !agg.field}
                >
                  <option value="">All (*)</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <input
                  style={{ ...inputStyle, width: '100px' }}
                  placeholder="Alias"
                  value={agg.alias || ''}
                  onChange={(e) => handleAggregationChange(index, 'alias', e.target.value)}
                />
                
                <button
                  style={{ ...buttonStyle('danger'), padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveAggregation(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button style={buttonStyle('secondary')} onClick={handleAddAggregation}>
              Add Aggregation
            </button>
          </div>
        )}

        {/* HAVING */}
        {selectedTable && (groupBy.length > 0 || aggregations.length > 0) && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>7. Add Having Conditions</h3>
            {having.map((condition, index) => (
              <div key={index} style={conditionRowStyle}>
                <input
                  style={{ ...inputStyle, width: '120px' }}
                  placeholder="Aggregate field"
                  value={condition.field}
                  onChange={(e) => handleHavingChange(index, 'field', e.target.value)}
                />
                
                <select
                  style={{ ...inputStyle, width: '120px' }}
                  value={condition.operator}
                  onChange={(e) => handleHavingChange(index, 'operator', e.target.value)}
                >
                  {operators.slice(0, 6).map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                
                <input
                  style={{ ...inputStyle, width: '100px' }}
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => handleHavingChange(index, 'value', e.target.value)}
                />
                
                <button
                  style={{ ...buttonStyle('danger'), padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveHaving(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button style={buttonStyle('secondary')} onClick={handleAddHaving}>
              Add Having Condition
            </button>
          </div>
        )}

        {/* Limit */}
        {selectedTable && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>8. Limit Results</h3>
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