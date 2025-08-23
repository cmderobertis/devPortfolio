/**
 * DataTable Component
 * Professional data table with sorting, filtering, pagination, and editing
 */

import { useState, useMemo, useCallback } from 'react';
import { TextField, Combobox, Checkbox } from '../../design-system';

console.log('DataTable module loaded!');

export function DataTable({ 
  data = [], 
  columns = [], 
  onEdit = null,
  onDelete = null,
  onAdd = null,
  pageSize = 10,
  searchable = true,
  sortable = true,
  editable = false,
  selectable = false
}) {
  console.log('DataTable rendering with filters!', { data, columns });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});

  // Styles
  const tableContainerStyle = {
    border: '1px solid var(--md-sys-color-outline-variant)',
    borderRadius: 'var(--md-sys-shape-corner-medium)',
    overflow: 'hidden',
    backgroundColor: 'var(--md-sys-color-surface)',
    boxShadow: 'var(--md-sys-elevation-level1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--md-sys-typescale-body-medium-size)'
  };

  const headerStyle = {
    backgroundColor: 'var(--md-sys-color-surface-container)',
    borderBottom: '1px solid var(--md-sys-color-outline-variant)'
  };

  const headerCellStyle = {
    padding: 'var(--md-sys-spacing-3)',
    textAlign: 'left',
    fontWeight: '600',
    color: 'var(--md-sys-color-on-surface)',
    cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none',
    verticalAlign: 'top'
  };

  const filterHeaderStyle = {
    padding: 'var(--md-sys-spacing-2)',
    backgroundColor: 'var(--md-sys-color-surface-container-low)',
    borderBottom: '1px solid var(--md-sys-color-outline-variant)'
  };

  const cellStyle = {
    padding: 'var(--md-sys-spacing-3)',
    borderBottom: '1px solid var(--md-sys-color-outline-variant)',
    color: 'var(--md-sys-color-on-surface-variant)'
  };

  const editingCellStyle = {
    ...cellStyle,
    padding: 'var(--md-sys-spacing-1)'
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--md-sys-spacing-2)',
    border: '1px solid var(--md-sys-color-outline)',
    borderRadius: 'var(--md-sys-shape-corner-small)',
    fontSize: 'var(--md-sys-typescale-body-medium-size)',
    backgroundColor: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)'
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: { 
        backgroundColor: 'var(--md-sys-color-primary)', 
        color: 'var(--md-sys-color-on-primary)' 
      },
      secondary: { 
        backgroundColor: 'var(--md-sys-color-surface-container)', 
        color: 'var(--md-sys-color-on-surface)' 
      },
      danger: { 
        backgroundColor: 'var(--md-sys-color-error)', 
        color: 'var(--md-sys-color-on-error)' 
      }
    };

    return {
      padding: 'var(--md-sys-spacing-2) var(--md-sys-spacing-3)',
      border: 'none',
      borderRadius: 'var(--md-sys-shape-corner-small)',
      fontSize: 'var(--md-sys-typescale-label-medium-size)',
      cursor: 'pointer',
      margin: '0 var(--md-sys-spacing-1)',
      ...variants[variant]
    };
  };

  // Determine column data types and unique values
  const columnInfo = useMemo(() => {
    const info = {};
    
    columns.forEach(column => {
      const field = column.field || column;
      const values = data.map(row => row[field]).filter(val => val != null);
      
      if (values.length === 0) {
        info[field] = { type: 'text', uniqueValues: [] };
        return;
      }

      // Determine data type
      let type = 'text';
      const firstValue = values[0];
      
      if (typeof firstValue === 'boolean') {
        type = 'boolean';
      } else if (typeof firstValue === 'number') {
        type = 'number';
      } else if (typeof firstValue === 'string') {
        // Check if it's a date
        const dateValue = new Date(firstValue);
        if (!isNaN(dateValue.getTime()) && firstValue.includes('-')) {
          type = 'date';
        } else {
          // Check if categorical (less than 20 unique values)
          const uniqueValues = [...new Set(values)];
          if (uniqueValues.length <= 20 && uniqueValues.length > 1) {
            type = 'categorical';
            info[field] = { type, uniqueValues };
            return;
          }
        }
      }
      
      info[field] = { type, uniqueValues: [] };
    });
    
    return info;
  }, [data, columns]);

  // Update column filter
  const updateColumnFilter = useCallback((field, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Process data with search, column filters, and sort
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply global search filter
    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([field, filterValue]) => {
      if (filterValue != null && filterValue !== '' && filterValue !== false) {
        filtered = filtered.filter(row => {
          const cellValue = row[field];
          const columnType = columnInfo[field]?.type;

          switch (columnType) {
            case 'boolean':
              return filterValue === true ? cellValue === true : cellValue === false;
            case 'categorical':
              return cellValue === filterValue;
            case 'text':
            case 'number':
            case 'date':
            default:
              return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
          }
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle different data types
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // String comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, columnFilters, sortField, sortDirection, columnInfo]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = processedData.slice(startIndex, endIndex);

  // Handlers
  const handleSort = useCallback((field) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortable]);

  const handleCellEdit = useCallback((rowIndex, field, value) => {
    if (!editable) return;
    
    const actualRowIndex = startIndex + rowIndex;
    if (onEdit) {
      onEdit(actualRowIndex, field, value);
    }
    setEditingCell(null);
  }, [editable, onEdit, startIndex]);

  const handleRowSelect = useCallback((index) => {
    if (!selectable) return;
    
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  }, [selectable, selectedRows]);

  const renderColumnFilter = (column) => {
    const field = column.field || column;
    const columnType = columnInfo[field]?.type || 'text';
    const filterValue = columnFilters[field] || '';

    switch (columnType) {
      case 'boolean':
        return (
          <div style={{ width: '120px' }}>
            <Combobox
              options={[
                { label: 'All', value: '' },
                { label: 'True', value: true },
                { label: 'False', value: false }
              ]}
              value={filterValue}
              placeholder="Filter..."
              onSelectionChange={(option) => updateColumnFilter(field, option?.value || '')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </div>
        );
      
      case 'categorical':
        const options = [
          { label: 'All', value: '' },
          ...columnInfo[field].uniqueValues.map(value => ({
            label: String(value),
            value: value
          }))
        ];
        return (
          <div style={{ width: '150px' }}>
            <Combobox
              options={options}
              value={filterValue}
              placeholder="Filter..."
              onSelectionChange={(option) => updateColumnFilter(field, option?.value || '')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </div>
        );
      
      case 'text':
      case 'number':
      case 'date':
      default:
        return (
          <div style={{ width: '150px' }}>
            <TextField
              value={filterValue}
              placeholder="Filter..."
              size="small"
              variant="outlined"
              clearable
              onChange={(e) => updateColumnFilter(field, e.target.value)}
            />
          </div>
        );
    }
  };

  const renderSortIcon = (field) => {
    if (!sortable || sortField !== field) return null;
    return (
      <span style={{ marginLeft: 'var(--md-sys-spacing-1)', fontSize: 'var(--md-sys-typescale-label-small-size)' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const renderCell = (row, field, rowIndex) => {
    const value = row[field];
    const isEditing = editingCell?.row === rowIndex && editingCell?.field === field;

    if (isEditing) {
      return (
        <td key={field} style={editingCellStyle}>
          <input
            style={inputStyle}
            defaultValue={value}
            autoFocus
            onBlur={(e) => handleCellEdit(rowIndex, field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellEdit(rowIndex, field, e.target.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
          />
        </td>
      );
    }

    return (
      <td 
        key={field} 
        style={cellStyle}
        onDoubleClick={() => editable && setEditingCell({ row: rowIndex, field })}
      >
        {String(value)}
      </td>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          style={{
            ...buttonStyle('secondary'),
            backgroundColor: i === currentPage ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)',
            color: i === currentPage ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'
          }}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 'var(--md-sys-spacing-2)',
        padding: 'var(--md-sys-spacing-4)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <button
          style={buttonStyle('secondary')}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pages}
        <button
          style={buttonStyle('secondary')}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (!data.length) {
    return (
      <div style={{ 
        padding: 'var(--md-sys-spacing-8)', 
        textAlign: 'center', 
        color: 'var(--md-sys-color-on-surface-variant)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        backgroundColor: 'var(--md-sys-color-surface-container-low)'
      }}>
        No data available
      </div>
    );
  }

  return (
    <div>
      {/* Global controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--md-sys-spacing-4)',
        flexWrap: 'wrap',
        gap: 'var(--md-sys-spacing-4)'
      }}>
        {searchable && (
          <TextField
            value={searchTerm}
            placeholder="Search all columns..."
            size="medium"
            variant="outlined"
            clearable
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '300px' }}
          />
        )}
        
        <div>
          {onAdd && (
            <button style={buttonStyle('primary')} onClick={onAdd}>
              Add Row
            </button>
          )}
          {selectedRows.size > 0 && onDelete && (
            <button 
              style={buttonStyle('danger')} 
              onClick={() => onDelete([...selectedRows])}
            >
              Delete Selected ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={headerStyle}>
            {/* Column headers */}
            <tr>
              {selectable && (
                <th style={headerCellStyle}>
                  <Checkbox
                    checked={selectedRows.size === currentData.length && currentData.length > 0}
                    indeterminate={selectedRows.size > 0 && selectedRows.size < currentData.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(currentData.map((_, i) => startIndex + i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </th>
              )}
              {columns.map(column => (
                <th 
                  key={column.field || column}
                  style={headerCellStyle}
                  onClick={() => handleSort(column.field || column)}
                >
                  {column.label || column}
                  {renderSortIcon(column.field || column)}
                </th>
              ))}
              {(editable || onDelete) && (
                <th style={headerCellStyle}>Actions</th>
              )}
            </tr>
            
            {/* Column filters */}
            <tr style={filterHeaderStyle}>
              {selectable && <th style={{ padding: 'var(--md-sys-spacing-2)' }}>
                <div style={{ fontSize: '10px', color: 'red' }}>FILTERS</div>
              </th>}
              {columns.map(column => (
                <th key={`filter-${column.field || column}`} style={{ padding: 'var(--md-sys-spacing-2)' }}>
                  {renderColumnFilter(column)}
                </th>
              ))}
              {(editable || onDelete) && <th style={{ padding: 'var(--md-sys-spacing-2)' }}></th>}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {selectable && (
                  <td style={cellStyle}>
                    <Checkbox
                      checked={selectedRows.has(startIndex + rowIndex)}
                      onChange={() => handleRowSelect(startIndex + rowIndex)}
                    />
                  </td>
                )}
                {columns.map(column => 
                  renderCell(row, column.field || column, rowIndex)
                )}
                {(editable || onDelete) && (
                  <td style={cellStyle}>
                    {onDelete && (
                      <button
                        style={buttonStyle('danger')}
                        onClick={() => onDelete([startIndex + rowIndex])}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {renderPagination()}
      </div>

      {/* Summary */}
      <div style={{ 
        marginTop: 'var(--md-sys-spacing-2)', 
        fontSize: 'var(--md-sys-typescale-body-small-size)', 
        color: 'var(--md-sys-color-on-surface-variant)',
        textAlign: 'center'
      }}>
        Showing {startIndex + 1}-{Math.min(endIndex, processedData.length)} of {processedData.length} rows
        {data.length !== processedData.length && ` (filtered from ${data.length})`}
      </div>
    </div>
  );
}

export default DataTable;