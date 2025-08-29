import DatabaseManager from '../components/database-editor/components/DatabaseManager.jsx';
import { Button, Typography } from '../design-system';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

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
    <InteractivePageWrapper>
      <DatabaseManager />
    </InteractivePageWrapper>
  );
};

export default DatabaseEditor;