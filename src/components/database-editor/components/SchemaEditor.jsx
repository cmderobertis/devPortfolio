/**
 * SchemaEditor Component
 * Visual editor for database table schemas
 */

import React, { useState, useEffect, useCallback } from 'react';
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

  const fieldRowStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    gap: '1rem'
  };

  const badgeStyle = (color) => ({
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: `${color}20`,
    color: color,
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500'
  });

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
    
    return (
      <div key={fieldName} style={fieldRowStyle}>
        <div style={{ minWidth: '150px' }}>
          <strong style={{ color: '#374151' }}>{fieldName}</strong>
          {isIdField && (
            <span style={{ ...badgeStyle('#3b82f6'), marginLeft: '0.5rem' }}>
              Primary Key
            </span>
          )}
        </div>
        
        <div style={{ minWidth: '120px' }}>
          <select
            style={inputStyle}
            value={field.type}
            onChange={(e) => handleFieldTypeChange(fieldName, e.target.value)}
            disabled={isIdField}
          >
            {dataTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151' }}>
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => handleFieldPropertyChange(fieldName, 'required', e.target.checked)}
              disabled={isIdField}
              style={{ marginRight: '0.25rem' }}
            />
            Required
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151' }}>
            <input
              type="checkbox"
              checked={field.nullable !== false}
              onChange={(e) => handleFieldPropertyChange(fieldName, 'nullable', e.target.checked)}
              disabled={isIdField}
              style={{ marginRight: '0.25rem' }}
            />
            Nullable
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151' }}>
            <input
              type="checkbox"
              checked={field.unique || false}
              onChange={(e) => handleFieldPropertyChange(fieldName, 'unique', e.target.checked)}
              disabled={isIdField}
              style={{ marginRight: '0.25rem' }}
            />
            Unique
          </label>
          
          {field.defaultValue !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
              Default: <code style={{ marginLeft: '0.25rem', padding: '0.125rem 0.25rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem' }}>{field.defaultValue || 'null'}</code>
            </div>
          )}
          
          {(field.minLength || field.maxLength) && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
              Length: {field.minLength || 0} - {field.maxLength || '∞'}
            </div>
          )}
          
          {field.pattern && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
              Pattern: <code style={{ marginLeft: '0.25rem', padding: '0.125rem 0.25rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem' }}>{field.pattern}</code>
            </div>
          )}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <span style={badgeStyle(getTypeColor(field.type))}>
            {field.type}
          </span>
          {!isIdField && (
            <button
              style={{ ...buttonStyle('danger'), marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
              onClick={() => handleRemoveField(fieldName)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Schema Editor: {tableName}</h2>
        <div>
          <button style={buttonStyle('success')} onClick={handleSave}>
            Save Schema
          </button>
          {onClose && (
            <button style={buttonStyle('secondary')} onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            Error: {error}
          </div>
        )}

        {/* Add Field Form */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <input
            style={inputStyle}
            placeholder="Field name"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          
          <select
            style={inputStyle}
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
          >
            {dataTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <button 
            style={{ ...buttonStyle('secondary'), fontSize: '0.75rem' }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼ Less' : '▶ More'}
          </button>
          
          <button style={buttonStyle('primary')} onClick={handleAddField}>
            Add Field
          </button>
        </div>
        
        {/* Advanced Constraints */}
        {showAdvanced && (
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginTop: '0.5rem',
            border: '1px solid #e0f2fe'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
              Field Constraints
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newFieldConstraints.required}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, required: e.target.checked }))}
                    style={{ marginRight: '0.25rem' }}
                  />
                  Required
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newFieldConstraints.nullable}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, nullable: e.target.checked }))}
                    style={{ marginRight: '0.25rem' }}
                  />
                  Nullable
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={newFieldConstraints.unique}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, unique: e.target.checked }))}
                    style={{ marginRight: '0.25rem' }}
                  />
                  Unique
                </label>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                  Default Value:
                </label>
                <input
                  style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem' }}
                  placeholder="Default value"
                  value={newFieldConstraints.defaultValue}
                  onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, defaultValue: e.target.value }))}
                />
                
                {newFieldType === 'string' && (
                  <>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                      Pattern (RegEx):
                    </label>
                    <input
                      style={{ ...inputStyle, width: '100%' }}
                      placeholder="^[a-zA-Z]+$"
                      value={newFieldConstraints.pattern}
                      onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, pattern: e.target.value }))}
                    />
                  </>
                )}
              </div>
              
              {(newFieldType === 'string' || newFieldType === 'array') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                    Min Length:
                  </label>
                  <input
                    style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem' }}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newFieldConstraints.minLength}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, minLength: e.target.value }))}
                  />
                  
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                    Max Length:
                  </label>
                  <input
                    style={{ ...inputStyle, width: '100%' }}
                    type="number"
                    min="1"
                    placeholder="No limit"
                    value={newFieldConstraints.maxLength}
                    onChange={(e) => setNewFieldConstraints(prev => ({ ...prev, maxLength: e.target.value }))}
                  />
                </div>
              )}
            </div>
        </div>
        )}

        {/* Schema Summary */}
        <div style={{
          backgroundColor: '#dbeafe',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <strong style={{ color: '#1e40af' }}>Schema Summary:</strong>{' '}
          {Object.keys(schema.fields || {}).length} fields •{' '}
          {Object.values(schema.fields || {}).filter(f => f.required).length} required •{' '}
          {Object.values(schema.fields || {}).filter(f => f.unique).length} unique •{' '}
          {Object.values(schema.fields || {}).filter(f => f.defaultValue !== undefined).length} with defaults
        </div>

        {/* Fields List */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            Table Fields
          </div>
          
          {Object.keys(schema.fields || {}).length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              No fields defined. Add fields using the form above.
            </div>
          ) : (
            Object.entries(schema.fields).map(([fieldName, field]) =>
              renderFieldRow(fieldName, field)
            )
          )}
        </div>

        {/* Type Legend */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Data Types:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {dataTypes.map(type => (
              <span key={type.value} style={badgeStyle(type.color)}>
                {type.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemaEditor;