/**
 * Performance Monitor Component
 * Optional overlay showing real-time performance metrics
 * Only shown when performance monitoring is enabled
 */

import React, { useState, useEffect } from 'react';
import usePerformanceMonitoring, { usePerformanceAlerts } from '../hooks/usePerformanceMonitoring';

const PerformanceMonitor = ({ isVisible = false, position = 'top-right', minimized = false }) => {
  const performance = usePerformanceMonitoring();
  const alerts = usePerformanceAlerts();
  const [isExpanded, setIsExpanded] = useState(!minimized);

  // Don't render if performance monitoring isn't supported or not visible
  if (!isVisible || !performance.isSupported) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getVitalColor = (grade) => {
    switch (grade) {
      case 'good': return '#4caf50';
      case 'needs-improvement': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms) => {
    if (ms === null) return 'N/A';
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' }
  };

  if (!isExpanded) {
    return (
      <div 
        className="performance-monitor minimized"
        style={{
          position: 'fixed',
          ...positionStyles[position],
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontFamily: 'monospace',
          cursor: 'pointer',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => setIsExpanded(true)}
      >
        <div style={{ color: getScoreColor(performance.overallScore) }}>
          ⚡ {Math.round(performance.overallScore)}
        </div>
        <div style={{ color: performance.fps.isSmooth ? '#4caf50' : '#ff9800' }}>
          {Math.round(performance.fps.fps)} fps
        </div>
        {alerts.hasAlerts && (
          <div style={{ color: '#f44336' }}>
            ⚠ {alerts.alerts.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="performance-monitor expanded"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        minWidth: '280px',
        maxWidth: '320px',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', color: '#fff' }}>
          Performance Monitor
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => performance.performCleanup()}
            style={{
              background: '#666',
              border: 'none',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Force cleanup"
          >
            🧹
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: getScoreColor(performance.overallScore) 
        }}>
          {Math.round(performance.overallScore)}/100
        </div>
        <div style={{ fontSize: '10px', color: '#ccc' }}>
          Overall Score
        </div>
      </div>

      {/* Alerts */}
      {alerts.hasAlerts && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f44336' }}>
            ⚠ Alerts ({alerts.alerts.length})
          </div>
          {alerts.alerts.slice(0, 3).map((alert, index) => (
            <div key={index} style={{ fontSize: '10px', color: '#ffcdd2', marginBottom: '2px' }}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Core Web Vitals */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Core Web Vitals</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FCP:</span>
            <span style={{ color: getVitalColor(performance.webVitals.grades.FCP) }}>
              {formatMs(performance.webVitals.vitals.FCP)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>LCP:</span>
            <span style={{ color: getVitalColor(performance.webVitals.grades.LCP) }}>
              {formatMs(performance.webVitals.vitals.LCP)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FID:</span>
            <span style={{ color: getVitalColor(performance.webVitals.grades.FID) }}>
              {formatMs(performance.webVitals.vitals.FID)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>CLS:</span>
            <span style={{ color: getVitalColor(performance.webVitals.grades.CLS) }}>
              {performance.webVitals.vitals.CLS?.toFixed(3) || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Performance</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>FPS:</span>
          <span style={{ color: performance.fps.isSmooth ? '#4caf50' : '#ff9800' }}>
            {Math.round(performance.fps.fps)} ({performance.fps.grade})
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Frame Time:</span>
          <span>{Math.round(performance.fps.frameTime)}ms</span>
        </div>
      </div>

      {/* Memory Usage */}
      {performance.memory.memoryInfo.isSupported && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Memory Usage</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Used:</span>
            <span>{formatBytes(performance.memory.memoryInfo.usedJSHeapSize)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Total:</span>
            <span>{formatBytes(performance.memory.memoryInfo.totalJSHeapSize)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Usage:</span>
            <span style={{ 
              color: performance.memory.memoryInfo.usagePercentage > 80 ? '#f44336' : '#4caf50' 
            }}>
              {performance.memory.memoryInfo.usagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Object Pools */}
      {performance.objectPools && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Object Pools</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Active:</span>
            <span>{performance.objectPools.totalInUse}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Pooled:</span>
            <span>{performance.objectPools.totalPooled}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Hit Ratio:</span>
            <span style={{ color: performance.objectPools.totalHitRatio > 0.7 ? '#4caf50' : '#ff9800' }}>
              {(performance.objectPools.totalHitRatio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
        Press Esc to toggle
      </div>
    </div>
  );
};

// Hook to manage keyboard shortcut for showing/hiding monitor
export const usePerformanceMonitorToggle = (defaultVisible = false) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Toggle with Ctrl/Cmd + Shift + P
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
      // Hide with Escape
      else if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  // Show automatically in development if performance monitoring is enabled
  useEffect(() => {
    if (typeof __PERFORMANCE_MONITORING__ !== 'undefined' && __PERFORMANCE_MONITORING__ && __DEV__) {
      setIsVisible(true);
    }
  }, []);

  return { isVisible, setIsVisible };
};

export default PerformanceMonitor;