import React from 'react';
import { AlertTriangle, RefreshCw, Bug, Download, Copy, ChevronDown, ChevronUp } from 'lucide-react';

// Error types for categorization
const ErrorTypes = {
  RENDER_ERROR: 'render',
  SIMULATION_ERROR: 'simulation',
  PERFORMANCE_ERROR: 'performance',
  MEMORY_ERROR: 'memory',
  NETWORK_ERROR: 'network',
  UNKNOWN_ERROR: 'unknown'
};

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categorization function
const categorizeError = (error, errorInfo) => {
  const errorMessage = error.message.toLowerCase();
  const stackTrace = error.stack.toLowerCase();
  
  // Performance-related errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('frame') || 
      stackTrace.includes('requestanimationframe')) {
    return {
      type: ErrorTypes.PERFORMANCE_ERROR,
      severity: ErrorSeverity.HIGH,
      category: 'Performance'
    };
  }
  
  // Memory-related errors
  if (errorMessage.includes('memory') || 
      errorMessage.includes('allocation') ||
      errorMessage.includes('heap')) {
    return {
      type: ErrorTypes.MEMORY_ERROR,
      severity: ErrorSeverity.CRITICAL,
      category: 'Memory'
    };
  }
  
  // Simulation-specific errors
  if (errorMessage.includes('grid') || 
      errorMessage.includes('entity') || 
      errorMessage.includes('generation') ||
      stackTrace.includes('simulation')) {
    return {
      type: ErrorTypes.SIMULATION_ERROR,
      severity: ErrorSeverity.MEDIUM,
      category: 'Simulation Logic'
    };
  }
  
  // Render-related errors
  if (stackTrace.includes('render') || 
      stackTrace.includes('canvas') ||
      errorMessage.includes('context')) {
    return {
      type: ErrorTypes.RENDER_ERROR,
      severity: ErrorSeverity.HIGH,
      category: 'Rendering'
    };
  }
  
  // Network-related errors
  if (errorMessage.includes('fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('request')) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      severity: ErrorSeverity.MEDIUM,
      category: 'Network'
    };
  }
  
  return {
    type: ErrorTypes.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    category: 'Unknown'
  };
};

// Recovery suggestions based on error type
const getRecoverySuggestions = (errorCategory) => {
  const suggestions = {
    [ErrorTypes.PERFORMANCE_ERROR]: [
      'Try reducing the simulation speed',
      'Decrease the grid size or entity count',
      'Enable frame rate limiting',
      'Check browser performance settings'
    ],
    [ErrorTypes.MEMORY_ERROR]: [
      'Refresh the page to clear memory',
      'Reduce simulation complexity',
      'Close other browser tabs',
      'Try using a device with more RAM'
    ],
    [ErrorTypes.SIMULATION_ERROR]: [
      'Reset the simulation to default settings',
      'Check simulation parameters',
      'Try a different simulation pattern',
      'Reload the page and try again'
    ],
    [ErrorTypes.RENDER_ERROR]: [
      'Check if WebGL is supported',
      'Try a different browser',
      'Update your graphics drivers',
      'Disable hardware acceleration if issues persist'
    ],
    [ErrorTypes.NETWORK_ERROR]: [
      'Check your internet connection',
      'Reload the page',
      'Try again in a few minutes',
      'Clear browser cache'
    ],
    [ErrorTypes.UNKNOWN_ERROR]: [
      'Try refreshing the page',
      'Clear browser cache and cookies',
      'Try using a different browser',
      'Report this issue if it persists'
    ]
  };
  
  return suggestions[errorCategory.type] || suggestions[ErrorTypes.UNKNOWN_ERROR];
};

// Error logging service
class ErrorLogger {
  static logs = [];
  
  static log(error, errorInfo, componentStack, errorCategory) {
    const errorLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      componentStack,
      category: errorCategory,
      userAgent: navigator.userAgent,
      url: window.location.href,
      memory: this.getMemoryInfo(),
      performance: this.getPerformanceInfo()
    };
    
    this.logs.push(errorLog);
    
    // Keep only last 10 error logs
    if (this.logs.length > 10) {
      this.logs.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Simulation Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', componentStack);
      console.error('Category:', errorCategory);
      console.groupEnd();
    }
    
    return errorLog;
  }
  
  static getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  static getPerformanceInfo() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0
    };
  }
  
  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
  
  static clearLogs() {
    this.logs = [];
  }
}

// Enhanced Error Fallback Component
const SimulationErrorFallback = ({ 
  error, 
  errorInfo, 
  resetError, 
  errorCategory,
  componentName = 'Simulation'
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  
  const recoverySuggestions = getRecoverySuggestions(errorCategory);
  
  const severityColor = {
    [ErrorSeverity.LOW]: '#10B981',
    [ErrorSeverity.MEDIUM]: '#F59E0B', 
    [ErrorSeverity.HIGH]: '#EF4444',
    [ErrorSeverity.CRITICAL]: '#DC2626'
  }[errorCategory.severity];
  
  const handleCopyError = async () => {
    const errorText = `
Error: ${error.name}: ${error.message}
Component: ${componentName}
Category: ${errorCategory.category} (${errorCategory.severity})
Timestamp: ${new Date().toISOString()}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo.componentStack}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };
  
  const handleDownloadLogs = () => {
    const logs = ErrorLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-error-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div style={{
      padding: '32px',
      margin: '16px',
      backgroundColor: 'var(--md-sys-color-error-container)',
      color: 'var(--md-sys-color-on-error-container)',
      borderRadius: '12px',
      border: `2px solid ${severityColor}`,
      maxWidth: '800px',
      fontFamily: 'var(--md-sys-typescale-body-medium-font)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <AlertTriangle 
          size={32} 
          color={severityColor}
          style={{ flexShrink: 0 }}
        />
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '600' }}>
            {componentName} Error
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <span 
              style={{ 
                backgroundColor: severityColor, 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {errorCategory.severity.toUpperCase()}
            </span>
            <span>{errorCategory.category}</span>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      <div style={{ 
        backgroundColor: 'rgba(0,0,0,0.1)', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '16px',
        fontFamily: 'monospace',
        fontSize: '0.875rem'
      }}>
        <strong>{error.name}:</strong> {error.message}
      </div>
      
      {/* Recovery Suggestions */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '500' }}>
          Recovery Suggestions:
        </h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          {recoverySuggestions.map((suggestion, index) => (
            <li key={index} style={{ marginBottom: '4px', fontSize: '0.875rem' }}>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={resetError}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        
        <button
          onClick={handleCopyError}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'var(--md-sys-color-on-error-container)',
            border: '1px solid var(--md-sys-color-outline)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy Error'}
        </button>
        
        <button
          onClick={handleDownloadLogs}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'var(--md-sys-color-on-error-container)',
            border: '1px solid var(--md-sys-color-outline)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <Download size={16} />
          Download Logs
        </button>
      </div>
      
      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          backgroundColor: 'transparent',
          color: 'var(--md-sys-color-on-error-container)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Bug size={16} />
        {showDetails ? 'Hide' : 'Show'} Technical Details
        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {/* Error Details */}
      {showDetails && (
        <div style={{ 
          marginTop: '16px',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <details open style={{ padding: '12px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: '500', 
              marginBottom: '8px',
              fontSize: '0.875rem'
            }}>
              Stack Trace
            </summary>
            <pre style={{ 
              fontSize: '0.75rem', 
              lineHeight: '1.4',
              margin: '0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace'
            }}>
              {error.stack}
            </pre>
          </details>
          
          {errorInfo.componentStack && (
            <details style={{ padding: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '500', 
                marginBottom: '8px',
                fontSize: '0.875rem'
              }}>
                Component Stack
              </summary>
              <pre style={{ 
                fontSize: '0.75rem', 
                lineHeight: '1.4',
                margin: '0',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div style={{ 
        marginTop: '16px', 
        fontSize: '0.75rem', 
        opacity: 0.7,
        textAlign: 'center'
      }}>
        If this problem persists, please report it with the error details above.
      </div>
    </div>
  );
};

// Main Error Boundary Component
class SimulationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error, errorInfo) {
    const errorCategory = categorizeError(error, errorInfo);
    const errorLog = ErrorLogger.log(error, errorInfo, errorInfo.componentStack, errorCategory);
    
    this.setState({
      errorInfo,
      errorCategory,
      errorId: errorLog.id
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorCategory);
    }
  }
  
  handleReset = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }
  
  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
          retryCount: this.state.retryCount
        });
      }
      
      // Default fallback
      return (
        <SimulationErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCategory={this.state.errorCategory}
          resetError={this.handleReset}
          componentName={this.props.componentName || 'Simulation'}
        />
      );
    }
    
    return this.props.children;
  }
}

// Hook for error reporting
const useErrorReporting = () => {
  const reportError = React.useCallback((error, context = {}) => {
    const errorCategory = categorizeError(error, { componentStack: '' });
    ErrorLogger.log(error, context, '', errorCategory);
  }, []);
  
  return {
    reportError,
    errorLogs: ErrorLogger.logs,
    clearLogs: ErrorLogger.clearLogs,
    exportLogs: ErrorLogger.exportLogs
  };
};

export {
  SimulationErrorBoundary,
  SimulationErrorFallback,
  ErrorLogger,
  useErrorReporting,
  ErrorTypes,
  ErrorSeverity
};

export default SimulationErrorBoundary;