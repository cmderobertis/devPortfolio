/**
 * TableViewer Component
 * Displays and manages localStorage tables with full CRUD operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardHeader, CardContent, Typography } from '../../../design-system';
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

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'var(--md-sys-color-surface)',
    padding: 'var(--md-sys-spacing-6)',
    borderRadius: 'var(--md-sys-shape-corner-large)',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80%',
    overflow: 'auto'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 'var(--md-sys-spacing-2)',
    color: 'var(--md-sys-color-on-surface)',
    fontSize: 'var(--md-sys-typescale-body-medium-size)',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--md-sys-spacing-3)',
    marginBottom: 'var(--md-sys-spacing-4)',
    border: '1px solid var(--md-sys-color-outline)',
    borderRadius: 'var(--md-sys-shape-corner-small)',
    fontSize: 'var(--md-sys-typescale-body-medium-size)',
    backgroundColor: 'var(--md-sys-color-surface-container-low)',
    color: 'var(--md-sys-color-on-surface)'
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div style={modalStyle} onClick={() => setShowAddModal(false)}>
        <Card variant="elevated" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
            Add New Record
          </Typography>
          
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

          <div style={{ display: 'flex', gap: 'var(--md-sys-spacing-2)', marginTop: 'var(--md-sys-spacing-6)', justifyContent: 'flex-end' }}>
            <Button variant="text" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" onClick={handleSaveNew}>
              Save
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--md-sys-spacing-8)', textAlign: 'center' }}>
        <Typography variant="body-medium" color="on-surface-variant">
          Loading table...
        </Typography>
      </div>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="headline-medium">
          Table: {tableName}
        </Typography>
        <div style={{ display: 'flex', gap: 'var(--md-sys-spacing-2)' }}>
          <Button variant="outlined" onClick={handleExport}>
            Export JSON
          </Button>
          <Button variant="filled" onClick={handleAdd}>
            Add Record
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

        {schema.fields && (
          <Card 
            variant="filled"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              padding: 'var(--md-sys-spacing-4)',
              marginBottom: 'var(--md-sys-spacing-4)'
            }}
          >
            <Typography variant="body-medium">
              <strong>Schema:</strong> {Object.entries(schema.fields).map(([field, fieldSchema]) => 
                `${field} (${fieldSchema.type})`
              ).join(', ')}
            </Typography>
          </Card>
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
      </CardContent>

      {renderAddModal()}
    </Card>
  );
}

export default TableViewer;