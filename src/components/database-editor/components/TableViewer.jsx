/**
 * TableViewer Component
 * Displays and manages localStorage tables with full CRUD operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from './DataTable.jsx';
import { LocalStorageDB } from '../utils/localStorageDB.js';

export function TableViewer({ tableName, onClose }) {
  console.log('TableViewer rendering!', { tableName });
  const [db] = useState(() => new LocalStorageDB());
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({});

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
      danger: { backgroundColor: '#ef4444', color: 'white' }
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

  const modalStyle = {
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
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  };

  // Load table data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tableData = db.select(tableName);
      const tableSchema = db.getSchema(tableName);

      setData(tableData);
      setSchema(tableSchema);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [db, tableName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleEdit = useCallback((rowIndex, field, value) => {
    try {
      const record = data[rowIndex];
      if (!record.id) {
        throw new Error('Record must have an ID to edit');
      }

      // Type conversion based on schema
      const fieldType = schema.fields?.[field]?.type;
      let convertedValue = value;

      if (fieldType === 'number') {
        convertedValue = Number(value);
        if (isNaN(convertedValue)) {
          throw new Error(`Invalid number: ${value}`);
        }
      } else if (fieldType === 'boolean') {
        convertedValue = value === 'true' || value === true;
      } else if (fieldType === 'date') {
        convertedValue = new Date(value).toISOString();
      }

      db.update(tableName, record.id, { [field]: convertedValue });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [db, tableName, data, schema, loadData]);

  const handleDelete = useCallback((rowIndices) => {
    try {
      const recordsToDelete = rowIndices.map(index => data[index]);
      
      for (const record of recordsToDelete) {
        if (!record.id) {
          throw new Error('Record must have an ID to delete');
        }
        db.delete(tableName, record.id);
      }
      
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [db, tableName, data, loadData]);

  const handleAdd = useCallback(() => {
    // Initialize new record with default values based on schema
    const initialRecord = {};
    
    if (schema.fields) {
      Object.entries(schema.fields).forEach(([field, fieldSchema]) => {
        if (field !== 'id') {
          switch (fieldSchema.type) {
            case 'string':
              initialRecord[field] = '';
              break;
            case 'number':
              initialRecord[field] = 0;
              break;
            case 'boolean':
              initialRecord[field] = false;
              break;
            case 'date':
              initialRecord[field] = new Date().toISOString().split('T')[0];
              break;
            default:
              initialRecord[field] = '';
          }
        }
      });
    }

    setNewRecord(initialRecord);
    setShowAddModal(true);
  }, [schema]);

  const handleSaveNew = useCallback(() => {
    try {
      // Validate and convert types
      const processedRecord = {};
      
      Object.entries(newRecord).forEach(([field, value]) => {
        const fieldType = schema.fields?.[field]?.type;
        
        if (fieldType === 'number') {
          processedRecord[field] = Number(value);
          if (isNaN(processedRecord[field])) {
            throw new Error(`Invalid number for ${field}: ${value}`);
          }
        } else if (fieldType === 'boolean') {
          processedRecord[field] = value === 'true' || value === true;
        } else if (fieldType === 'date') {
          processedRecord[field] = new Date(value).toISOString();
        } else {
          processedRecord[field] = value;
        }
      });

      db.insert(tableName, processedRecord);
      setShowAddModal(false);
      setNewRecord({});
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [db, tableName, newRecord, schema, loadData]);

  const handleExport = useCallback(() => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }, [data, tableName]);

  // Get columns from schema or data
  const columns = schema.fields 
    ? Object.keys(schema.fields).filter(field => field !== 'id')
    : data.length > 0 
      ? Object.keys(data[0]).filter(field => field !== 'id')
      : [];

  const getFieldType = (field) => {
    return schema.fields?.[field]?.type || 'text';
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div style={modalStyle} onClick={() => setShowAddModal(false)}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Add New Record</h3>
          
          {columns.map(field => (
            <div key={field}>
              <label style={labelStyle}>{field}</label>
              {getFieldType(field) === 'boolean' ? (
                <select
                  style={inputStyle}
                  value={newRecord[field] || false}
                  onChange={(e) => setNewRecord(prev => ({
                    ...prev,
                    [field]: e.target.value === 'true'
                  }))}
                >
                  <option value={false}>False</option>
                  <option value={true}>True</option>
                </select>
              ) : (
                <input
                  style={inputStyle}
                  type={getFieldType(field) === 'number' ? 'number' : 
                        getFieldType(field) === 'date' ? 'date' : 'text'}
                  value={newRecord[field] || ''}
                  onChange={(e) => setNewRecord(prev => ({
                    ...prev,
                    [field]: e.target.value
                  }))}
                  placeholder={`Enter ${field}`}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button style={buttonStyle('primary')} onClick={handleSaveNew}>
              Save
            </button>
            <button 
              style={buttonStyle('secondary')} 
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#6b7280' }}>Loading table...</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Table: {tableName}</h2>
        <div>
          <button style={buttonStyle('secondary')} onClick={handleExport}>
            Export JSON
          </button>
          <button style={buttonStyle('primary')} onClick={handleAdd}>
            Add Record
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

        {schema.fields && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong>Schema:</strong> {Object.entries(schema.fields).map(([field, fieldSchema]) => 
              `${field} (${fieldSchema.type})`
            ).join(', ')}
          </div>
        )}

        <DataTable
          data={data}
          columns={columns.map(field => ({
            field,
            label: field.charAt(0).toUpperCase() + field.slice(1)
          }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          searchable={true}
          sortable={true}
          editable={true}
          selectable={true}
          pageSize={10}
        />
      </div>

      {renderAddModal()}
    </div>
  );
}

export default TableViewer;