import { useState } from 'react';
import DatabaseManager from '../components/DatabaseManager.jsx';
import { Card, CardContent, Button, Typography, Container } from '../components/design-system';

const DatabaseEditor = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const containerStyle = {
    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
    minHeight: '100vh',
    padding: 'var(--md-sys-spacing-8) 0'
  };

  const headerStyle = {
    backgroundColor: 'var(--md-sys-color-surface)',
    boxShadow: 'var(--md-sys-elevation-level1)',
    padding: 'var(--md-sys-spacing-12) 0',
    marginBottom: 'var(--md-sys-spacing-8)'
  };

  const contentWrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 var(--md-sys-spacing-4)'
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
              <Card variant="elevated">
                <CardContent style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-primary)' }}>🗄️</div>
                  <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-on-surface)' }}>
                    LocalStorage Database
                  </Typography>
                  <Typography variant="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                    Transform browser localStorage into a powerful database with CRUD operations, 
                    schema validation, and relationship mapping.
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-secondary)' }}>🔍</div>
                  <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-on-surface)' }}>
                    Visual Query Builder
                  </Typography>
                  <Typography variant="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                    Build complex queries with a drag-and-drop interface. No SQL knowledge required 
                    for filtering, sorting, and joining data.
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-tertiary)' }}>⚙️</div>
                  <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-on-surface)' }}>
                    Schema Editor
                  </Typography>
                  <Typography variant="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                    Design database schemas visually with type validation, constraints, 
                    and relationship definitions.
                  </Typography>
                </CardContent>
              </Card>
            </div>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-on-surface)' }}>
                  Key Features
                </Typography>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--md-sys-spacing-4)' }}>
                  <div>
                    <Typography variant="title-medium" style={{ color: 'var(--md-sys-color-primary)', marginBottom: 'var(--md-sys-spacing-2)' }}>Database Operations</Typography>
                    <ul style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, paddingLeft: 'var(--md-sys-spacing-6)' }}>
                      <li>Create, Read, Update, Delete (CRUD)</li>
                      <li>Schema inference and validation</li>
                      <li>Type-safe operations</li>
                      <li>Relationship mapping</li>
                    </ul>
                  </div>
                  <div>
                    <Typography variant="title-medium" style={{ color: 'var(--md-sys-color-secondary)', marginBottom: 'var(--md-sys-spacing-2)' }}>Data Management</Typography>
                    <ul style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, paddingLeft: 'var(--md-sys-spacing-6)' }}>
                      <li>Visual data tables with editing</li>
                      <li>Advanced filtering and sorting</li>
                      <li>Bulk operations</li>
                      <li>Export/Import (JSON, CSV)</li>
                    </ul>
                  </div>
                  <div>
                    <Typography variant="title-medium" style={{ color: 'var(--md-sys-color-tertiary)', marginBottom: 'var(--md-sys-spacing-2)' }}>Developer Experience</Typography>
                    <ul style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, paddingLeft: 'var(--md-sys-spacing-6)' }}>
                      <li>TypeScript-like validation</li>
                      <li>Error handling & recovery</li>
                      <li>Performance optimized</li>
                      <li>Accessibility compliant</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'demo':
        return (
          <div>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="headline-small" style={{ marginBottom: 'var(--md-sys-spacing-4)', color: 'var(--md-sys-color-on-surface)' }}>
                  Live Database Manager
                </Typography>
                <Typography variant="body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--md-sys-spacing-4)' }}>
                  Full-featured localStorage database management interface with real CRUD operations.
                </Typography>
              </CardContent>
            </Card>
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
          <Typography variant="display-large" style={{ color: 'var(--md-sys-color-primary)', textAlign: 'center', marginBottom: 'var(--md-sys-spacing-4)' }}>
            LocalStorage Database Editor
          </Typography>
          <Typography variant="headline-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', marginBottom: 'var(--md-sys-spacing-4)' }}>
            Professional database management for browser storage
          </Typography>
          <Typography variant="body-large" style={{ color: 'var(--md-sys-color-on-surface-variant)', maxWidth: '800px', margin: '0 auto var(--md-sys-spacing-8)', textAlign: 'center', lineHeight: 1.6 }}>
            A comprehensive database management interface that transforms localStorage into a powerful, 
            queryable database with visual tools for schema design, data manipulation, and relationship mapping.
          </Typography>
          
          <div style={buttonContainerStyle}>
            <Button 
              variant="filled"
              onClick={() => window.history.back()}
              icon={<span>←</span>}
            >
              Back to Showcase
            </Button>
          </div>
        </div>
      </div>

      <div style={contentWrapperStyle}>
        <div style={tabStyle}>
          <Button 
            variant={activeTab === 'overview' ? 'filled' : 'text'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'demo' ? 'filled' : 'text'}
            onClick={() => setActiveTab('demo')}
          >
            Demo
          </Button>
          <Button 
            variant={activeTab === 'technical' ? 'filled' : 'text'}
            onClick={() => setActiveTab('technical')}
          >
            Technical Details
          </Button>
        </div>

        {renderTabContent()}

      </div>
    </div>
  );
};

export default DatabaseEditor;