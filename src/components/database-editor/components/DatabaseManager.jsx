/**
 * DatabaseManager Component
 * Main interface for localStorage database management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LocalStorageDB } from '../utils/localStorageDB.js';
import { exportImportManager } from '../utils/exportImport.js';
import { Button, Card, CardHeader, CardContent, Typography, Container } from '../../design-system';
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
    <Card 
      variant="outlined" 
      className="database-manager-sidebar"
      style={{ 
        width: '300px', 
        height: '100vh', 
        borderRadius: 0, 
        display: 'flex', 
        flexDirection: 'column',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none'
      }}
    >
      <CardHeader style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <Typography variant="title-large">
          Database Manager
        </Typography>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-1)', marginTop: 'var(--md-sys-spacing-4)' }}>
          <Button 
            variant={activeView === 'overview' ? 'tonal' : 'text'}
            onClick={() => setActiveView('overview')}
            icon={<span>📊</span>}
            style={{ justifyContent: 'flex-start' }}
          >
            Overview
          </Button>
          <Button 
            variant={activeView === 'query' ? 'tonal' : 'text'}
            onClick={() => setActiveView('query')}
            icon={<span>🔍</span>}
            style={{ justifyContent: 'flex-start' }}
          >
            Query Builder
          </Button>
          {selectedTable && (
            <>
              <div style={{ height: '1px', backgroundColor: 'var(--md-sys-color-outline-variant)', margin: 'var(--md-sys-spacing-2) 0' }} />
              <Typography variant="label-medium" color="on-surface-variant" style={{ padding: '0 var(--md-sys-spacing-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {selectedTable}
              </Typography>
              <Button 
                variant={activeView === 'table' ? 'tonal' : 'text'}
                onClick={() => setActiveView('table')}
                icon={<span>📋</span>}
                style={{ justifyContent: 'flex-start' }}
              >
                Table View
              </Button>
              <Button 
                variant={activeView === 'schema' ? 'tonal' : 'text'}
                onClick={() => setActiveView('schema')}
                icon={<span>⚙️</span>}
                style={{ justifyContent: 'flex-start' }}
              >
                Schema Editor
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--md-sys-spacing-2)' }}>
          <Typography variant="title-medium">Tables</Typography>
          <Button variant="filled" onClick={handleCreateTable} size="small">
            +
          </Button>
        </div>
        
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-6)' }}>
            <Typography variant="body-medium" color="on-surface-variant">
              No tables found
            </Typography>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-1)' }}>
            {tables.map(table => (
              <div key={table} style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-sys-spacing-1)' }}>
                <Button
                  variant={selectedTable === table ? 'tonal' : 'text'}
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
                  style={{ flex: 1, justifyContent: 'space-between' }}
                  icon={<span>📋</span>}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>{table}</span>
                  <Typography variant="label-small" color="on-surface-variant">
                    {stats.tableStats?.[table]?.records || 0}
                  </Typography>
                  {selectedTable === table && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-primary)', marginLeft: 'var(--md-sys-spacing-1)' }}>
                      {activeView === 'table' ? '📋' : activeView === 'schema' ? '⚙️' : ''}
                    </span>
                  )}
                </Button>
                <Button
                  variant="text"
                  onClick={() => handleDeleteTable(table)}
                  title="Delete Table"
                  size="small"
                  style={{ color: 'var(--md-sys-color-error)', minWidth: 'auto', padding: 'var(--md-sys-spacing-1)' }}
                >
                  🗑️
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div style={{ padding: 'var(--md-sys-spacing-4)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-2)' }}>
          <Button variant="outlined" onClick={handleExportData}>
            Export All Data
          </Button>
          <Button variant="outlined" onClick={() => document.getElementById('import-input').click()}>
            Import Data
            <input
              id="import-input"
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </Button>
          <Button variant="outlined" onClick={handleClearAll} style={{ color: 'var(--md-sys-color-error)' }}>
            Clear All Data
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderOverview = () => (
    <Container>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--md-sys-spacing-4)', marginBottom: 'var(--md-sys-spacing-8)' }}>
        <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-4)' }}>
          <Typography variant="display-small" color="primary" style={{ margin: 0 }}>
            {stats.tables || 0}
          </Typography>
          <Typography variant="body-medium" color="on-surface-variant">
            Tables
          </Typography>
        </Card>
        <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-4)' }}>
          <Typography variant="display-small" color="secondary" style={{ margin: 0 }}>
            {stats.totalRecords || 0}
          </Typography>
          <Typography variant="body-medium" color="on-surface-variant">
            Total Records
          </Typography>
        </Card>
        <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-4)' }}>
          <Typography variant="display-small" color="tertiary" style={{ margin: 0 }}>
            {Object.keys(localStorage).filter(key => key.startsWith('lsdb_')).length}
          </Typography>
          <Typography variant="body-medium" color="on-surface-variant">
            Storage Keys
          </Typography>
        </Card>
      </div>

      <Card variant="elevated" style={{ marginBottom: 'var(--md-sys-spacing-6)' }}>
        <CardHeader>
          <Typography variant="title-large">Table Overview</Typography>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--md-sys-spacing-8)' }}>
              <Typography variant="body-large" color="on-surface-variant" style={{ marginBottom: 'var(--md-sys-spacing-4)' }}>
                No tables found. Create a table or import data to get started.
              </Typography>
              <Button variant="filled" onClick={handleCreateTable}>
                Create Your First Table
              </Button>
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
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <Typography variant="title-large">Quick Actions</Typography>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--md-sys-spacing-6)' }}>
            <div>
              <Typography variant="title-small" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                Create & Manage
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-2)' }}>
                <Button variant="filled" onClick={handleCreateTable}>
                  Create New Table
                </Button>
                <Button variant="outlined" onClick={() => setActiveView('query')}>
                  Open Query Builder
                </Button>
              </div>
            </div>
            <div>
              <Typography variant="title-small" style={{ marginBottom: 'var(--md-sys-spacing-3)' }}>
                Import & Export
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-2)' }}>
                <Button variant="outlined" onClick={handleExportData}>
                  Export All Data
                </Button>
                <Button variant="outlined" onClick={() => document.getElementById('overview-import-input').click()}>
                  Import JSON File
                  <input 
                    id="overview-import-input"
                    type="file" 
                    accept=".json" 
                    onChange={handleImportData} 
                    style={{ display: 'none' }} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body-medium" color="on-surface-variant">
            Loading...
          </Typography>
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
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)' 
    }}>
      {renderSidebar()}
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <Card 
          variant="filled" 
          style={{
            borderRadius: 0,
            padding: 'var(--md-sys-spacing-6)',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <Typography variant="headline-medium" style={{ margin: '0 0 var(--md-sys-spacing-1) 0' }}>
              {getPageTitle()}
            </Typography>
            <Typography variant="body-medium" color="on-surface-variant" style={{ margin: 0 }}>
              {getViewDescription()}
            </Typography>
          </div>
          
          {error && (
            <Card 
              variant="filled"
              style={{
                padding: 'var(--md-sys-spacing-2) var(--md-sys-spacing-4)',
                backgroundColor: 'var(--md-sys-color-error-container)',
                color: 'var(--md-sys-color-on-error-container)'
              }}
            >
              <Typography variant="body-small">
                {error}
              </Typography>
            </Card>
          )}
        </Card>
        
        <div style={{ 
          flex: 1, 
          padding: 'var(--md-sys-spacing-6)', 
          overflow: 'auto',
          backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default DatabaseManager;