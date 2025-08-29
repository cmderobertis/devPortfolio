/**
 * SchemaEditor Component
 * Visual editor for database table schemas
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardHeader, CardContent, Typography, TextField, Checkbox } from '../../../design-system';
import { LocalStorageDB } from '../utils/localStorageDB.js';

export function SchemaEditor({ tableName, onSave, onClose }) {
  const [db] = useState(() => new LocalStorageDB());
  const [schema, setSchema] = useState({ fields: {} });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [newFieldConstraints, setNewFieldConstraints] = useState({
    required: false,
    nullable: true,
    unique: false,
    defaultValue: '',
    minLength: '',
    maxLength: '',
    pattern: ''
  });
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Data types
  const dataTypes = [
    { value: 'string', label: 'String', color: '#10b981' },
    { value: 'number', label: 'Number', color: '#f59e0b' },
    { value: 'boolean', label: 'Boolean', color: '#8b5cf6' },
    { value: 'date', label: 'Date', color: '#06b6d4' },
    { value: 'json', label: 'JSON', color: '#f97316' },
    { value: 'array', label: 'Array', color: '#ec4899' }
  ];




  // Load schema
  useEffect(() => {
    try {
      const tableSchema = db.getSchema(tableName);
      if (tableSchema.fields) {
        setSchema(tableSchema);
      } else {
        // Infer schema from existing data
        const data = db.select(tableName);
        if (data.length > 0) {
          const inferredSchema = db.inferSchema(data);
          setSchema(inferredSchema);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [db, tableName]);

  // Handlers
  const handleAddField = useCallback(() => {
    if (!newFieldName.trim()) {
      setError('Field name is required');
      return;
    }

    if (schema.fields[newFieldName]) {
      setError('Field already exists');
      return;
    }

    // Validate field name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newFieldName)) {
      setError('Field name must start with letter or underscore and contain only letters, numbers, and underscores');
      return;
    }

    setSchema(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [newFieldName]: {
          type: newFieldType,
          required: newFieldConstraints.required,
          nullable: newFieldConstraints.nullable,
          unique: newFieldConstraints.unique,
          ...(newFieldConstraints.defaultValue && { defaultValue: newFieldConstraints.defaultValue }),
          ...(newFieldConstraints.minLength && { minLength: parseInt(newFieldConstraints.minLength) }),
          ...(newFieldConstraints.maxLength && { maxLength: parseInt(newFieldConstraints.maxLength) }),
          ...(newFieldConstraints.pattern && { pattern: newFieldConstraints.pattern })
        }
      }
    }));

    setNewFieldName('');
    setNewFieldType('string');
    setNewFieldConstraints({
      required: false,
      nullable: true,
      unique: false,
      defaultValue: '',
      minLength: '',
      maxLength: '',
      pattern: ''
    });
    setError(null);
  }, [newFieldName, newFieldType, schema.fields]);

  const handleRemoveField = useCallback((fieldName) => {
    if (fieldName === 'id') {
      setError('Cannot remove ID field');
      return;
    }

    setSchema(prev => {
      const newFields = { ...prev.fields };
      delete newFields[fieldName];
      return {
        ...prev,
        fields: newFields
      };
    });
  }, []);

  const handleFieldTypeChange = useCallback((fieldName, newType) => {
    setSchema(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          type: newType
        }
      }
    }));
  }, []);

  const handleFieldPropertyChange = useCallback((fieldName, property, value) => {
    setSchema(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          [property]: value
        }
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      // Validate schema
      if (!schema.fields || Object.keys(schema.fields).length === 0) {
        setError('Schema must have at least one field');
        return;
      }

      // Ensure ID field exists
      if (!schema.fields.id) {
        schema.fields.id = {
          type: 'string',
          required: true,
          nullable: false,
          primaryKey: true
        };
      }

      // Save schema
      db.setSchema(tableName, schema);
      
      if (onSave) {
        onSave(schema);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [db, tableName, schema, onSave]);

  const getTypeColor = (type) => {
    const typeData = dataTypes.find(t => t.value === type);
    return typeData ? typeData.color : '#6b7280';
  };

  const renderFieldRow = (fieldName, field) => {
    const isIdField = fieldName === 'id';
    const dataTypeConfig = dataTypes.find(dt => dt.value === field.type) || dataTypes[0];
    
    return (
      <div 
        key={fieldName} 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--md-sys-spacing-3)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          gap: 'var(--md-sys-spacing-4)'
        }}
      >
        <div style={{ minWidth: '150px' }}>
          <Typography variant="body-medium" style={{ fontWeight: '500' }}>
            {fieldName}
          </Typography>
          {isIdField && (
            <Typography 
              variant="label-small" 
              color="primary"
              style={{ 
                display: 'inline-block',
                marginLeft: 'var(--md-sys-spacing-2)',
                padding: 'var(--md-sys-spacing-1) var(--md-sys-spacing-2)',
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
              }}
            >
              Primary Key
            </Typography>
          )}
        </div>
        
        <div style={{ minWidth: '120px' }}>
          <select
            value={field.type}
            onChange={(e) => handleFieldTypeChange(fieldName, e.target.value)}
            style={{
              padding: 'var(--md-sys-spacing-2)',
              border: '1px solid var(--md-sys-color-outline)',
              borderRadius: 'var(--md-sys-shape-corner-small)',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
            }}
            disabled={isIdField}
          >
            {dataTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--md-sys-spacing-3)', alignItems: 'center' }}>
          <Checkbox
            checked={field.required || false}
            onChange={(e) => handleFieldPropertyChange(fieldName, 'required', e.target.checked)}
            disabled={isIdField}
            label="Required"
          />
          
          <Checkbox
            checked={field.nullable !== false}
            onChange={(e) => handleFieldPropertyChange(fieldName, 'nullable', e.target.checked)}
            disabled={isIdField}
            label="Nullable"
          />
          
          <Checkbox
            checked={field.unique || false}
            onChange={(e) => handleFieldPropertyChange(fieldName, 'unique', e.target.checked)}
            disabled={isIdField}
            label="Unique"
          />
          
          {field.defaultValue !== undefined && (
            <Typography variant="label-small" color="on-surface-variant">
              Default: <code style={{ 
                marginLeft: 'var(--md-sys-spacing-1)', 
                padding: 'var(--md-sys-spacing-1) var(--md-sys-spacing-2)', 
                backgroundColor: 'var(--md-sys-color-surface-container)', 
                borderRadius: 'var(--md-sys-shape-corner-small)' 
              }}>
                {field.defaultValue || 'null'}
              </code>
            </Typography>
          )}
          
          {(field.minLength || field.maxLength) && (
            <Typography variant="label-small" color="on-surface-variant">
              Length: {field.minLength || 0} - {field.maxLength || '∞'}
            </Typography>
          )}
          
          {field.pattern && (
            <Typography variant="label-small" color="on-surface-variant">
              Pattern: <code style={{ 
                marginLeft: 'var(--md-sys-spacing-1)', 
                padding: 'var(--md-sys-spacing-1) var(--md-sys-spacing-2)', 
                backgroundColor: 'var(--md-sys-color-surface-container)', 
                borderRadius: 'var(--md-sys-shape-corner-small)' 
              }}>
                {field.pattern}
              </code>
            </Typography>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--md-sys-spacing-2)' }}>
          <Typography 
            variant="label-small" 
            style={{ 
              padding: 'var(--md-sys-spacing-1) var(--md-sys-spacing-2)',
              backgroundColor: dataTypeConfig.color + '20',
              color: dataTypeConfig.color,
              borderRadius: 'var(--md-sys-shape-corner-full)'
            }}
          >
            {field.type}
          </Typography>
          {!isIdField && (
            <Button
              variant="text"
              size="small"
              onClick={() => handleRemoveField(fieldName)}
              style={{ color: 'var(--md-sys-color-error)' }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card variant="elevated">
      <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="headline-medium">
          Schema Editor: {tableName}
        </Typography>
        <div style={{ display: 'flex', gap: 'var(--md-sys-spacing-2)' }}>
          <Button variant="filled" onClick={handleSave}>
            Save Schema
          </Button>
          {onClose && (
            <Button variant="text" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
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

        {/* Add Field Form */}
        <Card 
          variant="filled"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            padding: 'var(--md-sys-spacing-4)',
            marginBottom: 'var(--md-sys-spacing-6)',
            display: 'flex',
            gap: 'var(--md-sys-spacing-2)',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <TextField
            placeholder="Field name"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            style={{ minWidth: '150px' }}
          />
          
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
            style={{
              padding: 'var(--md-sys-spacing-3)',
              border: '1px solid var(--md-sys-color-outline)',
              borderRadius: 'var(--md-sys-shape-corner-small)',
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              color: 'var(--md-sys-color-on-surface)',
              fontSize: 'var(--md-sys-typescale-body-medium-size)',
              minWidth: '120px'
            }}
          >
            {dataTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <Button 
            variant="text"
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼ Less' : '▶ More'}
          </Button>
          
          <Button variant="filled" onClick={handleAddField}>
            Add Field
          </Button>
        </Card>
        
        {/* Advanced Constraints */}
        {showAdvanced && (
          <Card 
            variant="filled"
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              padding: 'var(--md-sys-spacing-4)',
              marginTop: 'var(--md-sys-spacing-2)',
              border: '1px solid var(--md-sys-color-primary)'
            }}
          >
            <Typography variant="title-small" color="on-primary-container" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
              Field Constraints
            </Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--md-sys-spacing-3)' }}>
              <div>
                <Checkbox
                  checked={newFieldConstraints.required}
                  onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, required: e.target.checked }))}
                  label="Required"
                />
                
                <Checkbox
                  checked={newFieldConstraints.nullable}
                  onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, nullable: e.target.checked }))}
                  label="Nullable"
                />
                
                <Checkbox
                  checked={newFieldConstraints.unique}
                  onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, unique: e.target.checked }))}
                  label="Unique"
                />
              </div>
              
              <div>
                <TextField
                  label="Default Value"
                  value={newFieldConstraints.defaultValue}
                  onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, defaultValue: e.target.value }))}
                  style={{ marginBottom: 'var(--md-sys-spacing-2)' }}
                />
                
                {(newFieldType === 'string' || newFieldType === 'array') && (
                  <>
                    <TextField
                      label="Min Length"
                      type="number"
                      placeholder="0"
                      value={newFieldConstraints.minLength}
                      onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, minLength: e.target.value }))}
                      style={{ marginBottom: 'var(--md-sys-spacing-2)' }}
                    />
                    
                    <TextField
                      label="Max Length"
                      type="number"
                      placeholder="100"
                      value={newFieldConstraints.maxLength}
                      onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, maxLength: e.target.value }))}
                      style={{ marginBottom: 'var(--md-sys-spacing-2)' }}
                    />
                  </>
                )}
                
                {newFieldType === 'string' && (
                  <TextField
                    label="Pattern (RegEx)"
                    placeholder="^[a-zA-Z]+$"
                    value={newFieldConstraints.pattern}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, pattern: e.target.value }))}
                  />
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Current Schema Fields */}
        <Typography variant="title-medium" style={{ margin: 'var(--md-sys-spacing-6) 0 var(--md-sys-spacing-4) 0' }}>
          Current Fields ({Object.keys(schema.fields || {}).length})
        </Typography>
        
        <Card variant="outlined">
          {Object.keys(schema.fields || {}).length === 0 ? (
            <CardContent style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-8)' }}>
              <Typography variant="body-medium" color="on-surface-variant">
                No fields defined. Add a field to get started.
              </Typography>
            </CardContent>
          ) : (
            <div>
              {Object.entries(schema.fields).map(([fieldName, field]) => 
                renderFieldRow(fieldName, field)
              )}
            </div>
          )}
        </Card>

        {/* Schema Summary */}
        <Card 
          variant="filled"
          style={{
            backgroundColor: 'var(--md-sys-color-primary-container)',
            padding: 'var(--md-sys-spacing-4)',
            marginTop: 'var(--md-sys-spacing-6)'
          }}
        >
          <Typography variant="body-medium" color="on-primary-container">
            <strong>Schema Summary:</strong>{' '}
            {Object.keys(schema.fields || {}).length} fields •{' '}
            {Object.values(schema.fields || {}).filter(f => f.required).length} required •{' '}
            {Object.values(schema.fields || {}).filter(f => f.unique).length} unique •{' '}
            {Object.values(schema.fields || {}).filter(f => f.defaultValue !== undefined).length} with defaults
          </Typography>
        </Card>
      </CardContent>
    </Card>
  );
}

export default SchemaEditor;