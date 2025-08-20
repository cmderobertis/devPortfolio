/**
 * DataTable Component
 * Professional data table with sorting, filtering, pagination, and editing
 */

import React, { useState, useMemo, useCallback } from 'react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);

  // Styles
  const tableContainerStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem'
  };

  const headerStyle = {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  };

  const headerCellStyle = {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none'
  };

  const cellStyle = {
    padding: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    color: '#6b7280'
  };

  const editingCellStyle = {
    ...cellStyle,
    padding: '0.25rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.375rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.875rem'
  };

  const searchInputStyle = {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    width: '300px'
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: { backgroundColor: '#3b82f6', color: 'white' },
      secondary: { backgroundColor: '#f3f4f6', color: '#374151' },
      danger: { backgroundColor: '#ef4444', color: 'white' }
    };

    return {
      padding: '0.375rem 0.75rem',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      margin: '0 0.125rem',
      ...variants[variant]
    };
  };

  // Process data with search and sort
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

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
  }, [data, searchTerm, sortField, sortDirection]);

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

  const renderSortIcon = (field) => {
    if (!sortable || sortField !== field) return null;
    return (
      <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>
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
            backgroundColor: i === currentPage ? '#3b82f6' : '#f3f4f6',
            color: i === currentPage ? 'white' : '#374151'
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
        gap: '0.5rem',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb'
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
        padding: '2rem', 
        textAlign: 'center', 
        color: '#6b7280',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb'
      }}>
        No data available
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {searchable && (
          <input
            style={searchInputStyle}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <tr>
              {selectable && (
                <th style={headerCellStyle}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === currentData.length && currentData.length > 0}
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
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {selectable && (
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
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
        marginTop: '0.5rem', 
        fontSize: '0.875rem', 
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Showing {startIndex + 1}-{Math.min(endIndex, processedData.length)} of {processedData.length} rows
        {data.length !== processedData.length && ` (filtered from ${data.length})`}
      </div>
    </div>
  );
}

export default DataTable;