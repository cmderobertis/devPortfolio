/**
 * DatabaseManager Component
 * Main interface for localStorage database management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LocalStorageDB } from '../utils/localStorageDB.js';
import { exportImport } from '../utils/exportImport.js';
import TableViewer from './TableViewer.jsx';
import SchemaEditor from './SchemaEditor.jsx';
import QueryBuilder from './QueryBuilder.jsx';
import DataTable from './DataTable.jsx';

export function DatabaseManager() {
  const [db] = useState(() => new LocalStorageDB());
  const [tables, setTables] = useState([]);
  const [activeView, setActiveView] = useState('overview'); // overview, table, schema, query
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data for demonstration
  const sampleData = {
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, active: true, created: '2024-01-15' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, active: true, created: '2024-01-20' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, active: false, created: '2024-01-10' }
    ],
    products: [
      { id: '1', name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true, rating: 4.5 },
      { id: '2', name: 'Mouse', price: 29.99, category: 'Electronics', inStock: true, rating: 4.2 },
      { id: '3', name: 'Keyboard', price: 79.99, category: 'Electronics', inStock: false, rating: 4.7 }
    ],
    orders: [
      { id: '1', userId: '1', productId: '1', quantity: 1, total: 999.99, status: 'shipped', orderDate: '2024-02-01' },
      { id: '2', userId: '2', productId: '2', quantity: 2, total: 59.98, status: 'pending', orderDate: '2024-02-05' },
      { id: '3', userId: '1', productId: '3', quantity: 1, total: 79.99, status: 'delivered', orderDate: '2024-01-25' }
    ]
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f8fafc'
  };

  const sidebarStyle = {
    width: '300px',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  };

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    backgroundColor: 'white',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const contentStyle = {
    flex: 1,
    padding: '1.5rem',
    overflow: 'auto'
  };

  const buttonStyle = (variant = 'primary', active = false) => {
    const variants = {
      primary: { backgroundColor: active ? '#2563eb' : '#3b82f6', color: 'white' },
      secondary: { backgroundColor: active ? '#e5e7eb' : '#f3f4f6', color: '#374151' },
      danger: { backgroundColor: '#ef4444', color: 'white' },
      ghost: { backgroundColor: active ? '#f3f4f6' : 'transparent', color: active ? '#374151' : '#6b7280' }
    };

    return {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      margin: '0.125rem',
      width: variant === 'ghost' ? '100%' : 'auto',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      ...variants[variant]
    };
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1rem'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    padding: '1rem'
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Discover existing tables
      const existingTables = db.discoverTables();
      
      // Add sample data if no tables exist
      if (existingTables.length === 0) {
        Object.entries(sampleData).forEach(([tableName, data]) => {
          data.forEach(record => {
            db.insert(tableName, record);
          });
        });
      }

      const allTables = db.discoverTables();
      setTables(allTables);

      // Calculate stats
      const tableStats = {};
      let totalRecords = 0;

      allTables.forEach(table => {
        const data = db.select(table);
        tableStats[table] = {
          records: data.length,
          fields: data.length > 0 ? Object.keys(data[0]).length : 0
        };
        totalRecords += data.length;
      });

      setStats({
        tables: allTables.length,
        totalRecords,
        tableStats
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleCreateTable = useCallback(() => {
    const tableName = prompt('Enter table name:');
    if (tableName && tableName.trim()) {
      try {
        // Create table with basic schema
        db.setSchema(tableName.trim(), {
          fields: {
            id: { type: 'string', required: true, primaryKey: true }
          }
        });
        loadData();
        setSelectedTable(tableName.trim());
        setActiveView('schema');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [db, loadData]);

  const handleDeleteTable = useCallback((tableName) => {
    if (confirm(`Are you sure you want to delete table "${tableName}"? This cannot be undone.`)) {
      try {
        const data = db.select(tableName);
        data.forEach(record => {
          if (record.id) {
            db.delete(tableName, record.id);
          }
        });
        loadData();
        if (selectedTable === tableName) {
          setSelectedTable(null);
          setActiveView('overview');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  }, [db, loadData, selectedTable]);

  const handleExportData = useCallback(() => {
    try {
      const allData = {};
      tables.forEach(table => {
        allData[table] = db.select(table);
      });
      
      const jsonData = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'database_export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }, [db, tables]);

  const handleImportData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        Object.entries(data).forEach(([tableName, tableData]) => {
          if (Array.isArray(tableData)) {
            // Clear existing data
            const existing = db.select(tableName);
            existing.forEach(record => {
              if (record.id) {
                db.delete(tableName, record.id);
              }
            });
            
            // Insert new data
            tableData.forEach(record => {
              db.insert(tableName, record);
            });
          }
        });
        
        loadData();
      } catch (err) {
        setError('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [db, loadData]);

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        tables.forEach(table => {
          const data = db.select(table);
          data.forEach(record => {
            if (record.id) {
              db.delete(table, record.id);
            }
          });
        });
        loadData();
        setActiveView('overview');
        setSelectedTable(null);
      } catch (err) {
        setError(err.message);
      }
    }
  }, [db, tables, loadData]);

  const renderSidebar = () => (
    <div style={sidebarStyle}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
          Database Manager
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button 
            style={buttonStyle('ghost', activeView === 'overview')}
            onClick={() => setActiveView('overview')}
          >
            <span>📊</span> Overview
          </button>
          <button 
            style={buttonStyle('ghost', activeView === 'query')}
            onClick={() => setActiveView('query')}
          >
            <span>🔍</span> Query Builder
          </button>
          {selectedTable && (
            <>
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0.5rem 0' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', padding: '0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedTable}
              </div>
              <button 
                style={buttonStyle('ghost', activeView === 'table')}
                onClick={() => setActiveView('table')}
              >
                <span>📋</span> Table View
              </button>
              <button 
                style={buttonStyle('ghost', activeView === 'schema')}
                onClick={() => setActiveView('schema')}
              >
                <span>⚙️</span> Schema Editor
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#374151' }}>Tables</h3>
          <button style={buttonStyle('primary')} onClick={handleCreateTable}>
            +
          </button>
        </div>
        
        {tables.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
            No tables found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {tables.map(table => (
              <div key={table} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  style={{
                    ...buttonStyle('ghost', selectedTable === table),
                    flex: 1,
                    justifyContent: 'flex-start',
                    fontWeight: selectedTable === table ? '600' : '400'
                  }}
                  onClick={() => {
                    if (selectedTable === table) {
                      // If already selected, cycle between views
                      if (activeView === 'table') {
                        setActiveView('schema');
                      } else {
                        setActiveView('table');
                      }
                    } else {
                      setSelectedTable(table);
                      setActiveView('table');
                    }
                  }}
                >
                  <span>📋</span> {table}
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>
                    {stats.tableStats?.[table]?.records || 0}
                  </span>
                  {selectedTable === table && (
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginLeft: '0.25rem' }}>
                      {activeView === 'table' ? '📋' : activeView === 'schema' ? '⚙️' : ''}
                    </span>
                  )}
                </button>
                <button
                  style={{ ...buttonStyle('ghost'), padding: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}
                  onClick={() => handleDeleteTable(table)}
                  title="Delete Table"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button style={buttonStyle('secondary')} onClick={handleExportData}>
            Export All Data
          </button>
          <label style={buttonStyle('secondary')}>
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </label>
          <button style={buttonStyle('danger')} onClick={handleClearAll}>
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.tables || 0}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tables</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.totalRecords || 0}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Records</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {Object.keys(localStorage).filter(key => key.startsWith('lsdb_')).length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Storage Keys</div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Table Overview</h3>
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            <p>No tables found. Create a table or import data to get started.</p>
            <button style={buttonStyle('primary')} onClick={handleCreateTable}>
              Create Your First Table
            </button>
          </div>
        ) : (
          <DataTable
            data={tables.map(table => ({
              name: table,
              records: stats.tableStats?.[table]?.records || 0,
              fields: stats.tableStats?.[table]?.fields || 0,
              actions: table
            }))}
            columns={[
              { field: 'name', label: 'Table Name' },
              { field: 'records', label: 'Records' },
              { field: 'fields', label: 'Fields' }
            ]}
            pageSize={10}
            searchable={true}
            sortable={true}
          />
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Create & Manage
            </h4>
            <button style={{ ...buttonStyle('primary'), width: '100%', marginBottom: '0.5rem' }} onClick={handleCreateTable}>
              Create New Table
            </button>
            <button 
              style={{ ...buttonStyle('secondary'), width: '100%' }} 
              onClick={() => setActiveView('query')}
            >
              Open Query Builder
            </button>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Import & Export
            </h4>
            <button style={{ ...buttonStyle('secondary'), width: '100%', marginBottom: '0.5rem' }} onClick={handleExportData}>
              Export All Data
            </button>
            <label style={{ ...buttonStyle('secondary'), width: '100%', display: 'block', textAlign: 'center' }}>
              Import JSON File
              <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ color: '#6b7280' }}>Loading...</div>
        </div>
      );
    }

    switch (activeView) {
      case 'table':
        return selectedTable ? (
          <TableViewer 
            tableName={selectedTable} 
            onClose={() => setActiveView('overview')}
          />
        ) : null;
        
      case 'schema':
        return selectedTable ? (
          <SchemaEditor 
            tableName={selectedTable}
            onSave={() => {
              loadData();
              setActiveView('table');
            }}
            onClose={() => setActiveView('overview')}
          />
        ) : null;
        
      case 'query':
        return (
          <QueryBuilder 
            onResults={(results, query) => {
              setQueryResults(results);
            }}
            onClose={() => setActiveView('overview')}
          />
        );
        
      default:
        return renderOverview();
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'table':
        return `Table View: ${selectedTable}`;
      case 'schema':
        return `Schema Editor: ${selectedTable}`;
      case 'query':
        return 'Query Builder';
      default:
        return 'Database Overview';
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'table':
        return 'Browse, search, and manage table data';
      case 'schema':
        return 'Define table structure, fields, and constraints';
      case 'query':
        return 'Build complex queries with visual interface';
      default:
        return 'Manage your localStorage database';
    }
  };

  return (
    <div style={containerStyle}>
      {renderSidebar()}
      
      <div style={mainStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
              {getPageTitle()}
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              {getViewDescription()}
            </p>
          </div>
          
          {error && (
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </div>
        
        <div style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default DatabaseManager;