import DatabaseManager from '../components/DatabaseManager.jsx';
import { Button, Typography } from '../components/design-system';

const DatabaseEditor = () => {

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

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={contentWrapperStyle}>
          <Typography
            variant="display-large"
            style={{
              color: "var(--md-sys-color-primary)",
              textAlign: "center",
              marginBottom: "var(--md-sys-spacing-4)",
            }}
          >
            LocalStorage Database Editor
          </Typography>
          <Typography
            variant="body-large"
            style={{
              color: "var(--md-sys-color-on-surface-variant)",
              maxWidth: "800px",
              margin: "0 auto var(--md-sys-spacing-8)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            An interface that transforms localStorage into a powerful, queryable
            database with visual tools for schema design, data manipulation, and
            relationship mapping.
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
      <DatabaseManager />
    </div>
  );
};

export default DatabaseEditor;