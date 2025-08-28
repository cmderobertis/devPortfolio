/**
 * QueryBuilder Component
 * Visual query builder for localStorage database
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardHeader, CardContent, Typography, TextField, Checkbox } from '../../design-system';
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
    <Card variant="elevated">
      <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="headline-medium">
          Query Builder
        </Typography>
        <div style={{ display: 'flex', gap: 'var(--md-sys-spacing-2)' }}>
          <Button variant="filled" onClick={executeQuery} disabled={loading}>
            {loading ? 'Running...' : 'Run Query'}
          </Button>
          {onClose && (
            <Button variant="text" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {error && (
          <Card 
            variant="filled"
            style={{
              padding: 'var(--md-sys-spacing-3)',
              backgroundColor: 'var(--md-sys-color-error-container)',
              color: 'var(--md-sys-color-on-error-container)',
              marginBottom: 'var(--md-sys-spacing-4)'
            }}
          >
            <Typography variant="body-small">
              Error: {error}
            </Typography>
          </Card>
        )}

        {/* Table Selection */}
        <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
          <CardContent>
            <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
              1. Select Table
            </Typography>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                padding: 'var(--md-sys-spacing-3)',
                border: '1px solid var(--md-sys-color-outline)',
                borderRadius: 'var(--md-sys-shape-corner-small)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
                fontSize: 'var(--md-sys-typescale-body-medium-size)',
                width: '200px'
              }}
            >
              <option value="">Choose table...</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Field Selection */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                2. Select Fields
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--md-sys-spacing-3)' }}>
                <Checkbox
                  checked={selectedFields.includes('*')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFields(['*']);
                    } else {
                      setSelectedFields([]);
                    }
                  }}
                  label="All Fields (*)"
                />
                
                {fields.map(field => (
                  <Checkbox
                    key={field}
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
                    label={field}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conditions */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                3. Add Conditions (WHERE)
              </Typography>
              {conditions.map((condition, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--md-sys-spacing-2)',
                    marginBottom: 'var(--md-sys-spacing-2)',
                    padding: 'var(--md-sys-spacing-2)',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: 'var(--md-sys-shape-corner-small)'
                  }}
                >
                  {index > 0 && (
                    <select
                      value={condition.logicalOperator}
                      onChange={(e) => handleConditionChange(index, 'logicalOperator', e.target.value)}
                      style={{
                        padding: 'var(--md-sys-spacing-2)',
                        border: '1px solid var(--md-sys-color-outline)',
                        borderRadius: 'var(--md-sys-shape-corner-small)',
                        backgroundColor: 'var(--md-sys-color-surface-container-low)',
                        color: 'var(--md-sys-color-on-surface)',
                        fontSize: 'var(--md-sys-typescale-body-small-size)',
                        width: '80px'
                      }}
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  
                  <select
                    value={condition.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    style={{
                      padding: 'var(--md-sys-spacing-2)',
                      border: '1px solid var(--md-sys-color-outline)',
                      borderRadius: 'var(--md-sys-shape-corner-small)',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                      width: '120px'
                    }}
                  >
                    {fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    style={{
                      padding: 'var(--md-sys-spacing-2)',
                      border: '1px solid var(--md-sys-color-outline)',
                      borderRadius: 'var(--md-sys-shape-corner-small)',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                      width: '120px'
                    }}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                
                <TextField
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  style={{ width: '150px' }}
                />
                
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleRemoveCondition(index)}
                  style={{ color: 'var(--md-sys-color-error)' }}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button variant="outlined" onClick={handleAddCondition}>
              Add Condition
            </Button>
            </CardContent>
          </Card>
        )}

        {/* Sorting */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                4. Add Sorting (ORDER BY)
              </Typography>
            {sortBy.map((sort, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-spacing-2)',
                  marginBottom: 'var(--md-sys-spacing-2)',
                  padding: 'var(--md-sys-spacing-2)',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderRadius: 'var(--md-sys-shape-corner-small)'
                }}
              >
                <select
                  value={sort.field}
                  onChange={(e) => handleSortChange(index, 'field', e.target.value)}
                  style={{
                    padding: 'var(--md-sys-spacing-2)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    width: '120px'
                  }}
                >
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <select
                  value={sort.direction}
                  onChange={(e) => handleSortChange(index, 'direction', e.target.value)}
                  style={{
                    padding: 'var(--md-sys-spacing-2)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    width: '100px'
                  }}
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
                
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleRemoveSort(index)}
                  style={{ color: 'var(--md-sys-color-error)' }}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button variant="outlined" onClick={handleAddSort}>
              Add Sort
            </Button>
            </CardContent>
          </Card>
        )}

        {/* GROUP BY */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                5. Group By Fields
              </Typography>
            {groupBy.map((group, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-spacing-2)',
                  marginBottom: 'var(--md-sys-spacing-2)',
                  padding: 'var(--md-sys-spacing-2)',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderRadius: 'var(--md-sys-shape-corner-small)'
                }}
              >
                <select
                  value={group.field}
                  onChange={(e) => handleGroupByChange(index, 'field', e.target.value)}
                  style={{
                    padding: 'var(--md-sys-spacing-2)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    width: '120px'
                  }}
                >
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleRemoveGroupBy(index)}
                  style={{ color: 'var(--md-sys-color-error)' }}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button variant="outlined" onClick={handleAddGroupBy}>
              Add Group By
            </Button>
            </CardContent>
          </Card>
        )}

        {/* Aggregations */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                6. Add Aggregations
              </Typography>
            {aggregations.map((agg, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--md-sys-spacing-2)',
                  marginBottom: 'var(--md-sys-spacing-2)',
                  padding: 'var(--md-sys-spacing-2)',
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderRadius: 'var(--md-sys-shape-corner-small)'
                }}
              >
                <select
                  value={agg.func}
                  onChange={(e) => handleAggregationChange(index, 'func', e.target.value)}
                  style={{
                    padding: 'var(--md-sys-spacing-2)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    width: '120px'
                  }}
                >
                  {aggregationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <select
                  value={agg.field || ''}
                  onChange={(e) => handleAggregationChange(index, 'field', e.target.value)}
                  disabled={agg.func === AggregationFunctions.COUNT && !agg.field}
                  style={{
                    padding: 'var(--md-sys-spacing-2)',
                    border: '1px solid var(--md-sys-color-outline)',
                    borderRadius: 'var(--md-sys-shape-corner-small)',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: 'var(--md-sys-typescale-body-small-size)',
                    width: '120px'
                  }}
                >
                  <option value="">All (*)</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                <TextField
                  placeholder="Alias"
                  value={agg.alias || ''}
                  onChange={(e) => handleAggregationChange(index, 'alias', e.target.value)}
                  style={{ width: '100px' }}
                />
                
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleRemoveAggregation(index)}
                  style={{ color: 'var(--md-sys-color-error)' }}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button variant="outlined" onClick={handleAddAggregation}>
              Add Aggregation
            </Button>
            </CardContent>
          </Card>
        )}

        {/* HAVING */}
        {selectedTable && (groupBy.length > 0 || aggregations.length > 0) && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                7. Add Having Conditions
              </Typography>
              {having.map((condition, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--md-sys-spacing-2)',
                    marginBottom: 'var(--md-sys-spacing-2)',
                    padding: 'var(--md-sys-spacing-2)',
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderRadius: 'var(--md-sys-shape-corner-small)'
                  }}
                >
                  <TextField
                    placeholder="Aggregate field"
                    value={condition.field}
                    onChange={(e) => handleHavingChange(index, 'field', e.target.value)}
                    style={{ width: '120px' }}
                  />
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => handleHavingChange(index, 'operator', e.target.value)}
                    style={{
                      padding: 'var(--md-sys-spacing-2)',
                      border: '1px solid var(--md-sys-color-outline)',
                      borderRadius: 'var(--md-sys-shape-corner-small)',
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                      width: '120px'
                    }}
                  >
                    {operators.slice(0, 6).map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  
                  <TextField
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => handleHavingChange(index, 'value', e.target.value)}
                    style={{ width: '100px' }}
                  />
                  
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleRemoveHaving(index)}
                    style={{ color: 'var(--md-sys-color-error)' }}
                  >
                    Remove
                  </Button>
              </div>
            ))}
            
            <Button variant="outlined" onClick={handleAddHaving}>
              Add Having Condition
            </Button>
            </CardContent>
          </Card>
        )}

        {/* Limit */}
        {selectedTable && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                8. Limit Results
              </Typography>
              <TextField
                type="number"
                placeholder="Limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                style={{ width: '100px' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Generated Query */}
        {queryText && (
          <Card variant="outlined" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                Generated Query
              </Typography>
              <div style={{
                backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                color: 'var(--md-sys-color-on-surface)',
                padding: 'var(--md-sys-spacing-4)',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                fontFamily: 'monospace',
                fontSize: 'var(--md-sys-typescale-body-small-size)',
                overflowX: 'auto',
                border: '1px solid var(--md-sys-color-outline-variant)'
              }}>
                {queryText}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="title-medium" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                Results ({results.length} rows)
              </Typography>
              <div style={{
                maxHeight: '300px',
                overflow: 'auto',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-sys-shape-corner-medium)'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: 'var(--md-sys-typescale-body-small-size)' 
                }}>
                  <thead style={{ 
                    backgroundColor: 'var(--md-sys-color-surface-container)', 
                    position: 'sticky', 
                    top: 0 
                  }}>
                    <tr>
                      {results.length > 0 && Object.keys(results[0]).map(key => (
                        <th key={key} style={{
                          padding: 'var(--md-sys-spacing-3)',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: 'var(--md-sys-color-on-surface)',
                          borderBottom: '1px solid var(--md-sys-color-outline-variant)'
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
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default QueryBuilder;