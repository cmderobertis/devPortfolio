/**
 * Database Editor Demo Component
 * Full working localStorage database management interface
 */

import React, { useState } from 'react';
import DatabaseManager from './components/DatabaseManager.jsx';

export function DatabaseEditorDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    backgroundColor: '#ffffff',
    minHeight: '400px'
  };

  const headerStyle = {
    marginBottom: '2rem',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem'
  };

  const subtitleStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '2rem'
  };

  const tabStyle = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '2rem'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: isActive ? '#3b82f6' : '#6b7280',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
    fontSize: '1rem',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s ease'
  });

  const contentStyle = {
    minHeight: '300px'
  };

  const demoCardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    backgroundColor: '#f9fafb'
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '#3b82f6',
        border: '2px solid #3b82f6'
      },
      danger: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none'
      }
    };

    return {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      margin: '0.25rem',
      transition: 'all 0.2s ease',
      ...variants[variant]
    };
  };

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    margin: '0.25rem',
    width: '200px'
  };

  const badgeStyle = (variant = 'default') => {
    const variants = {
      default: { backgroundColor: '#f3f4f6', color: '#374151' },
      primary: { backgroundColor: '#dbeafe', color: '#1e40af' },
      success: { backgroundColor: '#d1fae5', color: '#065f46' },
      warning: { backgroundColor: '#fef3c7', color: '#92400e' },
      error: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };

    return {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      margin: '0.25rem',
      ...variants[variant]
    };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
              Database Editor Component Library
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280', lineHeight: '1.6' }}>
              A comprehensive set of primitive components designed for building database management interfaces. 
              This demo showcases the core components: buttons, inputs, cards, badges, and tooltips.
            </p>
            
            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Key Features</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>🎨 Design System with consistent styling</li>
                <li>🔧 Modular primitive components</li>
                <li>♿ Accessibility-first approach</li>
                <li>🌙 Light/dark theme support</li>
                <li>📱 Responsive design patterns</li>
                <li>⚡ Performance optimized</li>
              </ul>
            </div>
          </div>
        );

      case 'components':
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
              Component Showcase
            </h3>
            
            {/* Button Showcase */}
            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Button Components</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={buttonStyle('primary')}>Primary Button</button>
                <button style={buttonStyle('secondary')}>Secondary Button</button>
                <button style={buttonStyle('danger')}>Danger Button</button>
                <button style={{...buttonStyle('primary'), opacity: 0.5}} disabled>Disabled</button>
              </div>
            </div>

            {/* Input Showcase */}
            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Input Components</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <input style={inputStyle} placeholder="Basic input" />
                <input style={inputStyle} placeholder="Search..." />
                <input style={{...inputStyle, borderColor: '#ef4444'}} placeholder="Error state" />
                <input style={{...inputStyle, borderColor: '#10b981'}} placeholder="Success state" />
              </div>
            </div>

            {/* Badge Showcase */}
            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Badge Components</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={badgeStyle('default')}>Default</span>
                <span style={badgeStyle('primary')}>Primary</span>
                <span style={badgeStyle('success')}>Success</span>
                <span style={badgeStyle('warning')}>Warning</span>
                <span style={badgeStyle('error')}>Error</span>
              </div>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>
              System Architecture
            </h3>
            
            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Component Layers</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <h5 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Primitives Layer</h5>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Button, Input, Card, Badge, Tooltip - Core building blocks with consistent styling
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Composed Layer</h5>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    DataTable, QueryBuilder, SchemaEditor - Complex components built from primitives
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Views Layer</h5>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    DatabaseEditor, TableViewer, ERDViewer - Complete interface views
                  </p>
                </div>
              </div>
            </div>

            <div style={demoCardStyle}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Technology Stack</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong style={{ color: '#374151' }}>React 18</strong>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                    Hooks, Context, Portals
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#374151' }}>CSS Custom Properties</strong>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                    Design token system
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#374151' }}>TypeScript-like Validation</strong>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                    Runtime type checking
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div style={{ height: '80vh', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <DatabaseManager />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Database Editor - Full Implementation</h1>
        <p style={subtitleStyle}>
          Complete localStorage database management with visual tools
        </p>
      </div>

      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'components')}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'architecture')}
          onClick={() => setActiveTab('architecture')}
        >
          Architecture
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'database')}
          onClick={() => setActiveTab('database')}
        >
          Live Database
        </button>
      </div>

      <div style={contentStyle}>
        {renderTabContent()}
      </div>

      {activeTab !== 'database' && (
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            This is a fully functional localStorage database manager with real CRUD operations, 
            visual query builder, schema editor, and data export/import capabilities.
          </p>
          <button 
            style={buttonStyle('primary')}
            onClick={() => setActiveTab('database')}
          >
            Try the Live Database
          </button>
        </div>
      )}
    </div>
  );
}

export default DatabaseEditorDemo;