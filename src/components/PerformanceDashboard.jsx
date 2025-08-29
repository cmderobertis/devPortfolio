import { useState, useEffect, memo } from 'react';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring.js';
import useAccessibilityMonitoring from '../hooks/useAccessibilityMonitoring.js';

// Performance metrics display component
const MetricCard = memo(({ title, value, unit, status, recommendation }) => (
  <div className={`metric-card ${status}`} style={{
    padding: '1rem',
    margin: '0.5rem',
    borderRadius: '8px',
    backgroundColor: status === 'good' ? '#d4edda' : status === 'warning' ? '#fff3cd' : '#f8d7da',
    border: `1px solid ${status === 'good' ? '#c3e6cb' : status === 'warning' ? '#ffeaa7' : '#f5c6cb'}`,
    minWidth: '200px'
  }}>
    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#495057' }}>{title}</h4>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
      {value !== null ? `${value}${unit}` : 'Measuring...'}
    </div>
    {recommendation && (
      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
        {recommendation}
      </div>
    )}
  </div>
));

// Bundle analysis component
const BundleAnalysis = memo(({ chunkLoadTimes, bundleLoadTime }) => (
  <div style={{ 
    backgroundColor: '#f8f9fa', 
    padding: '1rem', 
    borderRadius: '8px', 
    marginTop: '1rem' 
  }}>
    <h3 style={{ marginTop: 0 }}>Bundle Performance</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
      <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px' }}>
        <strong>Total Load Time:</strong> {bundleLoadTime}ms
      </div>
      {Object.entries(chunkLoadTimes).map(([chunk, time]) => (
        <div key={chunk} style={{ 
          padding: '0.5rem', 
          backgroundColor: 'white', 
          borderRadius: '4px',
          fontSize: '0.9rem' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{chunk}</div>
          <div style={{ color: time > 100 ? '#dc3545' : time > 50 ? '#ffc107' : '#28a745' }}>
            {time}ms
          </div>
        </div>
      ))}
    </div>
  </div>
));

// Recommendations component
const RecommendationsList = memo(({ recommendations }) => (
  <div style={{ marginTop: '1rem' }}>
    <h3>Performance Recommendations</h3>
    {recommendations.length === 0 ? (
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#d4edda', 
        borderRadius: '8px',
        color: '#155724' 
      }}>
        ✅ All performance metrics look good!
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map((rec, index) => (
          <div key={index} style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: rec.severity === 'high' ? '#f8d7da' : '#fff3cd',
            borderLeft: `4px solid ${rec.severity === 'high' ? '#dc3545' : '#ffc107'}`
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {rec.severity === 'high' ? '🔴 High Priority' : '🟡 Medium Priority'}
            </div>
            <div>{rec.message}</div>
          </div>
        ))}
      </div>
    )}
  </div>
));

// Main performance dashboard component
export const PerformanceDashboard = memo(({ isVisible = true }) => {
  const { 
    metrics, 
    performanceScore, 
    recommendations, 
    refresh 
  } = usePerformanceMonitoring({
    trackWebVitals: true,
    trackMemory: true,
    trackBundleSize: true,
    reportInterval: 3000
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(Date.now());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  };

  const getMetricStatus = (value, good, warning) => {
    if (value === null) return 'measuring';
    if (value <= good) return 'good';
    if (value <= warning) return 'warning';
    return 'poor';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: isExpanded ? '600px' : '300px',
      transition: 'max-width 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getScoreColor(performanceScore)
          }} />
          <span style={{ fontWeight: 'bold' }}>Performance Score: {performanceScore}/100</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
            title="Refresh metrics"
          >
            🔄
          </button>
          <span style={{ fontSize: '1.2rem' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Core Web Vitals */}
          <h3 style={{ marginTop: 0 }}>Core Web Vitals</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <MetricCard
              title="LCP (Largest Contentful Paint)"
              value={metrics.lcp ? Math.round(metrics.lcp) : null}
              unit="ms"
              status={getMetricStatus(metrics.lcp, 2500, 4000)}
              recommendation={metrics.lcp > 2500 ? "Optimize images and preload critical resources" : null}
            />
            <MetricCard
              title="FID (First Input Delay)"
              value={metrics.fid ? Math.round(metrics.fid) : null}
              unit="ms"
              status={getMetricStatus(metrics.fid, 100, 300)}
              recommendation={metrics.fid > 100 ? "Reduce JavaScript execution time" : null}
            />
            <MetricCard
              title="CLS (Cumulative Layout Shift)"
              value={metrics.cls ? metrics.cls.toFixed(3) : null}
              unit=""
              status={getMetricStatus(metrics.cls, 0.1, 0.25)}
              recommendation={metrics.cls > 0.1 ? "Add size attributes to images and elements" : null}
            />
          </div>

          {/* Memory usage */}
          {metrics.memory && (
            <div style={{ marginBottom: '1rem' }}>
              <h3>Memory Usage</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <MetricCard
                  title="Used Memory"
                  value={metrics.memory.used}
                  unit="MB"
                  status={getMetricStatus(metrics.memory.used / metrics.memory.total, 0.6, 0.8)}
                  recommendation={metrics.memory.used / metrics.memory.total > 0.8 ? "High memory usage detected" : null}
                />
                <MetricCard
                  title="Memory Efficiency"
                  value={Math.round((metrics.memory.used / metrics.memory.total) * 100)}
                  unit="%"
                  status={getMetricStatus(metrics.memory.used / metrics.memory.total, 0.6, 0.8)}
                />
              </div>
            </div>
          )}

          {/* Bundle analysis */}
          {(metrics.bundleLoadTime || Object.keys(metrics.chunkLoadTimes).length > 0) && (
            <BundleAnalysis 
              bundleLoadTime={metrics.bundleLoadTime}
              chunkLoadTimes={metrics.chunkLoadTimes}
            />
          )}

          {/* Recommendations */}
          <RecommendationsList recommendations={recommendations} />

          {/* Last updated */}
          <div style={{ 
            marginTop: '1rem', 
            fontSize: '0.8rem', 
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';