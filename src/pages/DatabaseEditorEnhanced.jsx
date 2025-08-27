import React, { useState, useEffect } from 'react';
import { Database, Plus, Download, Upload, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { 
  Page, 
  Stack, 
  LayoutGrid as Grid, 
  GridItem,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Checkbox,
  ThemeVariantProvider
} from '../components/design-system';

// Import database functionality
import { useLocalStorageDB } from '../components/database-editor/hooks/useLocalStorageDB.js';
import { useQueryBuilder } from '../components/database-editor/hooks/useQueryBuilder.js';
import { useTableOperations } from '../components/database-editor/hooks/useTableOperations.js';

const DatabaseEditorEnhanced = () => {
  const { 
    tables, 
    createTable, 
    deleteTable, 
    addRecord, 
    updateRecord, 
    deleteRecord,
    exportData,
    importData,
    clearAllData
  } = useLocalStorageDB();

  const {
    query,
    setQuery,
    queryResults,
    executeQuery,
    clearQuery
  } = useQueryBuilder(tables);

  const {
    selectedTable,
    setSelectedTable,
    selectedRecords,
    setSelectedRecords,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    filterValue,
    setFilterValue
  } = useTableOperations();

  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSchema, setNewTableSchema] = useState([]);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);

  // Data type options for schema creation
  const dataTypes = ['string', 'number', 'boolean', 'date', 'json'];

  const handleCreateTable = () => {
    if (newTableName && newTableSchema.length > 0) {
      const schema = newTableSchema.reduce((acc, field) => {
        acc[field.name] = field.type;
        return acc;
      }, {});
      
      createTable(newTableName, schema);
      setNewTableName('');
      setNewTableSchema([]);
      setIsCreatingTable(false);
    }
  };

  const handleAddField = () => {
    setNewTableSchema([...newTableSchema, { name: '', type: 'string' }]);
  };

  const handleUpdateField = (index, field, value) => {
    const updated = [...newTableSchema];
    updated[index][field] = value;
    setNewTableSchema(updated);
  };

  const handleRemoveField = (index) => {
    setNewTableSchema(newTableSchema.filter((_, i) => i !== index));
  };

  const handleAddRecord = () => {
    if (!selectedTable) return;
    
    const table = tables[selectedTable];
    if (!table) return;

    const newRecord = {};
    Object.keys(table.schema).forEach(field => {
      switch (table.schema[field]) {
        case 'string':
          newRecord[field] = '';
          break;
        case 'number':
          newRecord[field] = 0;
          break;
        case 'boolean':
          newRecord[field] = false;
          break;
        case 'date':
          newRecord[field] = new Date().toISOString().split('T')[0];
          break;
        case 'json':
          newRecord[field] = '{}';
          break;
        default:
          newRecord[field] = '';
      }
    });

    setEditingRecord({ ...newRecord, id: Date.now().toString() });
    setIsEditingRecord(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    setIsEditingRecord(true);
  };

  const handleSaveRecord = () => {
    if (!editingRecord || !selectedTable) return;

    if (tables[selectedTable].records.find(r => r.id === editingRecord.id)) {
      updateRecord(selectedTable, editingRecord.id, editingRecord);
    } else {
      addRecord(selectedTable, editingRecord);
    }

    setEditingRecord(null);
    setIsEditingRecord(false);
  };

  const handleDeleteSelected = () => {
    if (!selectedTable || selectedRecords.length === 0) return;

    selectedRecords.forEach(recordId => {
      deleteRecord(selectedTable, recordId);
    });

    setSelectedRecords([]);
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database_export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        importData(data);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const currentTable = selectedTable ? tables[selectedTable] : null;
  const filteredRecords = currentTable ? 
    currentTable.records.filter(record => {
      if (!filterValue) return true;
      return Object.values(record).some(value => 
        value.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    }).sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'desc' ? -1 : 1;
      return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0;
    }) : [];

  return (
    <ThemeVariantProvider variant="minimal">
      <Page maxWidth="full">
        <Stack spacing="lg">
          <Stack spacing="md" align="center">
            <Typography variant="display-large">
              <Database style={{ display: 'inline', marginRight: '1rem', verticalAlign: 'middle' }} />
              Database Manager
            </Typography>
            <Typography variant="body-large" align="center">
              Local storage database with schema management and query builder
            </Typography>
          </Stack>

          <Grid columns={12} spacing="md">
            {/* Sidebar - Tables and Operations */}
            <GridItem span={12} spanMd={3}>
              <Stack spacing="md">
                {/* Database Operations */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">Database Operations</Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      <Button
                        variant="filled"
                        icon={<Plus size={16} />}
                        onClick={() => setIsCreatingTable(true)}
                        fullWidth
                      >
                        New Table
                      </Button>
                      
                      <Button
                        variant="outlined"
                        icon={<Search size={16} />}
                        onClick={() => setShowQueryBuilder(!showQueryBuilder)}
                        fullWidth
                      >
                        Query Builder
                      </Button>
                      
                      <Button
                        variant="outlined"
                        icon={<Download size={16} />}
                        onClick={handleExportData}
                        fullWidth
                      >
                        Export Data
                      </Button>
                      
                      <div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          style={{ display: 'none' }}
                          id="import-file"
                        />
                        <Button
                          variant="outlined"
                          icon={<Upload size={16} />}
                          onClick={() => document.getElementById('import-file').click()}
                          fullWidth
                        >
                          Import Data
                        </Button>
                      </div>
                      
                      <Button
                        variant="text"
                        onClick={clearAllData}
                        fullWidth
                        style={{ color: 'var(--md-sys-color-error)' }}
                      >
                        Clear All Data
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Tables List */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">Tables ({Object.keys(tables).length})</Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      {Object.entries(tables).map(([tableName, table]) => (
                        <Button
                          key={tableName}
                          variant={selectedTable === tableName ? "filled" : "outlined"}
                          onClick={() => setSelectedTable(tableName)}
                          fullWidth
                          style={{ justifyContent: 'flex-start' }}
                        >
                          <Stack spacing="xs">
                            <Typography variant="label-large">
                              {tableName}
                            </Typography>
                            <Typography variant="body-small">
                              {table.records.length} records
                            </Typography>
                          </Stack>
                        </Button>
                      ))}
                      
                      {Object.keys(tables).length === 0 && (
                        <Typography variant="body-medium" align="center" style={{ 
                          color: 'var(--md-sys-color-on-surface-variant)',
                          padding: '2rem 0'
                        }}>
                          No tables created yet
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </GridItem>

            {/* Main Content Area */}
            <GridItem span={12} spanMd={9}>
              <Stack spacing="md">
                {/* Query Builder (if active) */}
                {showQueryBuilder && (
                  <Card>
                    <CardHeader>
                      <Typography variant="title-medium">
                        <Search style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Query Builder
                      </Typography>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing="md">
                        <TextField
                          label="SQL-like Query"
                          placeholder="SELECT * FROM table_name WHERE field = 'value'"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          multiline
                          rows={3}
                        />
                        
                        <Stack direction="horizontal" spacing="sm">
                          <Button
                            variant="filled"
                            onClick={executeQuery}
                            disabled={!query.trim()}
                          >
                            Execute Query
                          </Button>
                          
                          <Button
                            variant="outlined"
                            onClick={clearQuery}
                          >
                            Clear
                          </Button>
                        </Stack>

                        {queryResults.length > 0 && (
                          <div>
                            <Typography variant="body-medium">
                              Query Results ({queryResults.length} records):
                            </Typography>
                            <div style={{
                              maxHeight: '200px',
                              overflow: 'auto',
                              border: '1px solid var(--md-sys-color-outline-variant)',
                              borderRadius: 'var(--md-sys-shape-corner-small)',
                              padding: '1rem',
                              marginTop: '0.5rem'
                            }}>
                              <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                                {JSON.stringify(queryResults, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Table Creation Modal */}
                {isCreatingTable && (
                  <Card>
                    <CardHeader>
                      <Typography variant="title-medium">Create New Table</Typography>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing="md">
                        <TextField
                          label="Table Name"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="Enter table name"
                        />

                        <div>
                          <Typography variant="title-small">Schema Fields</Typography>
                          
                          {newTableSchema.map((field, index) => (
                            <Stack key={index} direction="horizontal" spacing="sm" align="end">
                              <TextField
                                label="Field Name"
                                value={field.name}
                                onChange={(e) => handleUpdateField(index, 'name', e.target.value)}
                                placeholder="field_name"
                              />
                              
                              <div>
                                <Typography variant="label-medium">Data Type</Typography>
                                <select
                                  value={field.type}
                                  onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                                  style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--md-sys-shape-corner-small)',
                                    border: '1px solid var(--md-sys-color-outline)',
                                    backgroundColor: 'var(--md-sys-color-surface)'
                                  }}
                                >
                                  {dataTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <Button
                                variant="text"
                                onClick={() => handleRemoveField(index)}
                                icon={<Trash2 size={16} />}
                                style={{ color: 'var(--md-sys-color-error)' }}
                              />
                            </Stack>
                          ))}
                          
                          <Button
                            variant="outlined"
                            onClick={handleAddField}
                            icon={<Plus size={16} />}
                            style={{ marginTop: '1rem' }}
                          >
                            Add Field
                          </Button>
                        </div>

                        <Stack direction="horizontal" spacing="sm">
                          <Button
                            variant="filled"
                            onClick={handleCreateTable}
                            disabled={!newTableName || newTableSchema.length === 0}
                          >
                            Create Table
                          </Button>
                          
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsCreatingTable(false);
                              setNewTableName('');
                              setNewTableSchema([]);
                            }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Record Editing Modal */}
                {isEditingRecord && editingRecord && currentTable && (
                  <Card>
                    <CardHeader>
                      <Typography variant="title-medium">
                        {tables[selectedTable].records.find(r => r.id === editingRecord.id) ? 'Edit' : 'Add'} Record
                      </Typography>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing="md">
                        <Grid columns={2} spacing="md">
                          {Object.keys(currentTable.schema).map((field) => (
                            <GridItem key={field}>
                              {currentTable.schema[field] === 'boolean' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Checkbox
                                    checked={editingRecord[field] || false}
                                    onChange={(e) => setEditingRecord({
                                      ...editingRecord,
                                      [field]: e.target.checked
                                    })}
                                  />
                                  <Typography variant="body-medium">{field}</Typography>
                                </div>
                              ) : (
                                <TextField
                                  label={field}
                                  type={currentTable.schema[field] === 'number' ? 'number' : 
                                        currentTable.schema[field] === 'date' ? 'date' : 'text'}
                                  value={editingRecord[field] || ''}
                                  onChange={(e) => setEditingRecord({
                                    ...editingRecord,
                                    [field]: currentTable.schema[field] === 'number' ? 
                                      parseFloat(e.target.value) || 0 : e.target.value
                                  })}
                                  multiline={currentTable.schema[field] === 'json'}
                                  rows={currentTable.schema[field] === 'json' ? 3 : 1}
                                />
                              )}
                            </GridItem>
                          ))}
                        </Grid>

                        <Stack direction="horizontal" spacing="sm">
                          <Button
                            variant="filled"
                            onClick={handleSaveRecord}
                          >
                            Save Record
                          </Button>
                          
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsEditingRecord(false);
                              setEditingRecord(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Table Data View */}
                {currentTable && !isCreatingTable && !isEditingRecord && (
                  <Card>
                    <CardHeader>
                      <Stack direction="horizontal" justify="between" align="center">
                        <Typography variant="title-medium">
                          {selectedTable} ({filteredRecords.length} records)
                        </Typography>
                        
                        <Stack direction="horizontal" spacing="sm">
                          <TextField
                            placeholder="Filter records..."
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            icon={<Filter size={16} />}
                            size="small"
                          />
                          
                          <Button
                            variant="filled"
                            onClick={handleAddRecord}
                            icon={<Plus size={16} />}
                          >
                            Add Record
                          </Button>
                          
                          {selectedRecords.length > 0 && (
                            <Button
                              variant="outlined"
                              onClick={handleDeleteSelected}
                              icon={<Trash2 size={16} />}
                              style={{ color: 'var(--md-sys-color-error)' }}
                            >
                              Delete Selected ({selectedRecords.length})
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardHeader>
                    <CardContent>
                      {filteredRecords.length === 0 ? (
                        <Typography variant="body-medium" align="center" style={{
                          color: 'var(--md-sys-color-on-surface-variant)',
                          padding: '3rem 0'
                        }}>
                          No records found
                        </Typography>
                      ) : (
                        <div style={{ overflow: 'auto' }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem'
                          }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid var(--md-sys-color-outline-variant)' }}>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>
                                  <Checkbox
                                    checked={selectedRecords.length === filteredRecords.length}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedRecords(filteredRecords.map(r => r.id));
                                      } else {
                                        setSelectedRecords([]);
                                      }
                                    }}
                                  />
                                </th>
                                {Object.keys(currentTable.schema).map((field) => (
                                  <th 
                                    key={field} 
                                    style={{ 
                                      padding: '0.5rem', 
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      userSelect: 'none'
                                    }}
                                    onClick={() => {
                                      if (sortField === field) {
                                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                      } else {
                                        setSortField(field);
                                        setSortDirection('asc');
                                      }
                                    }}
                                  >
                                    {field}
                                    {sortField === field && (
                                      <span style={{ marginLeft: '0.25rem' }}>
                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                      </span>
                                    )}
                                  </th>
                                ))}
                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRecords.map((record, index) => (
                                <tr 
                                  key={record.id}
                                  style={{ 
                                    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                                    backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--md-sys-color-surface-variant)'
                                  }}
                                >
                                  <td style={{ padding: '0.5rem' }}>
                                    <Checkbox
                                      checked={selectedRecords.includes(record.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedRecords([...selectedRecords, record.id]);
                                        } else {
                                          setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                                        }
                                      }}
                                    />
                                  </td>
                                  {Object.keys(currentTable.schema).map((field) => (
                                    <td key={field} style={{ padding: '0.5rem' }}>
                                      {currentTable.schema[field] === 'boolean' ? 
                                        (record[field] ? '✓' : '✗') :
                                        currentTable.schema[field] === 'json' ?
                                          JSON.stringify(record[field]) :
                                          String(record[field] || '')
                                      }
                                    </td>
                                  ))}
                                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                    <Stack direction="horizontal" spacing="xs" justify="center">
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => handleEditRecord(record)}
                                        icon={<Edit size={14} />}
                                      />
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => deleteRecord(selectedTable, record.id)}
                                        icon={<Trash2 size={14} />}
                                        style={{ color: 'var(--md-sys-color-error)' }}
                                      />
                                    </Stack>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Welcome message when no table is selected */}
                {!selectedTable && !isCreatingTable && (
                  <Card>
                    <CardContent>
                      <Stack spacing="md" align="center" style={{ padding: '3rem 0' }}>
                        <Database size={48} style={{ color: 'var(--md-sys-color-primary)' }} />
                        <Typography variant="title-large">Welcome to Database Manager</Typography>
                        <Typography variant="body-medium" align="center">
                          Create your first table or select an existing one to start managing your data.
                        </Typography>
                        <Button
                          variant="filled"
                          onClick={() => setIsCreatingTable(true)}
                          icon={<Plus size={16} />}
                        >
                          Create Your First Table
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
      </Page>
    </ThemeVariantProvider>
  );
};

export default DatabaseEditorEnhanced;