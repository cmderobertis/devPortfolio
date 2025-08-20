import { useState } from 'react';
import DatabaseManager from '../components/DatabaseManager.jsx';

const DatabaseEditor = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const containerStyle = {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '2rem 0'
  };

  const headerStyle = {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '3rem 0',
    marginBottom: '2rem'
  };

  const contentWrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const titleStyle = {
    fontSize: '3rem',
    color: '#2563eb',
    marginBottom: '1rem',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  const subtitleStyle = {
    fontSize: '1.5rem',
    color: '#6b7280',
    marginBottom: '1rem',
    fontWeight: 'normal',
    textAlign: 'center'
  };

  const descriptionStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto 2rem',
    lineHeight: '1.6',
    textAlign: 'center'
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: { background: '#3b82f6', color: 'white' },
      secondary: { background: 'transparent', color: '#3b82f6', border: '2px solid #3b82f6' }
    };

    return {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      textDecoration: 'none',
      border: variant === 'primary' ? 'none' : '2px solid #3b82f6',
      ...variants[variant]
    };
  };

  const tabStyle = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '2rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem 0.5rem 0 0'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: isActive ? '#3b82f6' : '#6b7280',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
    fontSize: '1rem',
    fontWeight: isActive ? '600' : '400'
  });

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  };

  const featureGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  };

  const featureCardStyle = {
    ...cardStyle,
    textAlign: 'center'
  };

  const iconStyle = {
    fontSize: '3rem',
    marginBottom: '1rem'
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={featureGridStyle}>
              <div style={featureCardStyle}>
                <div style={{ ...iconStyle, color: '#3b82f6' }}>🗄️</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                  LocalStorage Database
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Transform browser localStorage into a powerful database with CRUD operations, 
                  schema validation, and relationship mapping.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ ...iconStyle, color: '#10b981' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                  Visual Query Builder
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Build complex queries with a drag-and-drop interface. No SQL knowledge required 
                  for filtering, sorting, and joining data.
                </p>
              </div>

              <div style={featureCardStyle}>
                <div style={{ ...iconStyle, color: '#f59e0b' }}>⚙️</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                  Schema Editor
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Design database schemas visually with type validation, constraints, 
                  and relationship definitions.
                </p>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                Key Features
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Database Operations</h4>
                  <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                    <li>Create, Read, Update, Delete (CRUD)</li>
                    <li>Schema inference and validation</li>
                    <li>Type-safe operations</li>
                    <li>Relationship mapping</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Data Management</h4>
                  <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                    <li>Visual data tables with editing</li>
                    <li>Advanced filtering and sorting</li>
                    <li>Bulk operations</li>
                    <li>Export/Import (JSON, CSV)</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Developer Experience</h4>
                  <ul style={{ color: '#6b7280', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                    <li>TypeScript-like validation</li>
                    <li>Error handling & recovery</li>
                    <li>Performance optimized</li>
                    <li>Accessibility compliant</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'demo':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                Live Database Manager
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Full-featured localStorage database management interface with real CRUD operations.
              </p>
            </div>
            <DatabaseManager />
          </div>
        );

      case 'technical':
        return (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                Technical Architecture
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Component Architecture</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Modular design with reusable primitive components building up to complex interfaces.
                  </p>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <strong>Primitives:</strong> Button, Input, Card, Badge, Tooltip<br/>
                    <strong>Composed:</strong> DataTable, QueryBuilder, SchemaEditor<br/>
                    <strong>Views:</strong> DatabaseManager, TableViewer, ERDViewer
                  </div>
                </div>
                <div>
                  <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Data Flow</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Clean separation between storage, business logic, and presentation layers.
                  </p>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <strong>Storage:</strong> LocalStorage abstraction with CRUD<br/>
                    <strong>Schema:</strong> Type inference and validation<br/>
                    <strong>Query:</strong> SQL-like operations and joins<br/>
                    <strong>UI:</strong> React hooks and context state
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
                Technology Stack
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Frontend</h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                    <li>React 18 with Hooks</li>
                    <li>CSS Custom Properties</li>
                    <li>Responsive Grid Layout</li>
                    <li>Accessibility (WCAG 2.1)</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Data Layer</h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                    <li>LocalStorage Database</li>
                    <li>Schema Validation</li>
                    <li>Query Engine</li>
                    <li>Relationship Mapping</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Development</h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                    <li>Vite Build System</li>
                    <li>Hot Module Replacement</li>
                    <li>Component Documentation</li>
                    <li>Error Boundaries</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={contentWrapperStyle}>
          <h1 style={titleStyle}>
            LocalStorage Database Editor
          </h1>
          <h2 style={subtitleStyle}>
            Professional database management for browser storage
          </h2>
          <p style={descriptionStyle}>
            A comprehensive database management interface that transforms localStorage into a powerful, 
            queryable database with visual tools for schema design, data manipulation, and relationship mapping.
          </p>
          
          <div style={buttonContainerStyle}>
            <button 
              style={buttonStyle('primary')}
              onClick={() => window.history.back()}
            >
              <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i>
              Back to Showcase
            </button>
          </div>
        </div>
      </div>

      <div style={contentWrapperStyle}>
        <div style={tabStyle}>
          <button 
            style={tabButtonStyle(activeTab === 'overview')}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            style={tabButtonStyle(activeTab === 'demo')}
            onClick={() => setActiveTab('demo')}
          >
            Demo
          </button>
          <button 
            style={tabButtonStyle(activeTab === 'technical')}
            onClick={() => setActiveTab('technical')}
          >
            Technical Details
          </button>
        </div>

        {renderTabContent()}

      </div>
    </div>
  );
};

export default DatabaseEditor;