/**
 * Bundle Size Monitoring Hook
 * Phase 2: Real-time bundle monitoring with alerts
 */

import { useState, useEffect, useCallback } from 'react';
import { liveRegionManager } from '../utils/accessibility';

// Bundle size thresholds (in KB)
const BUNDLE_THRESHOLDS = {
  TARGET: 500,      // Phase 2 target
  WARNING: 600,     // Show warning
  CRITICAL: 750     // Show critical alert
};

// Estimated chunk sizes from Vite build output analysis
const INITIAL_CHUNK_ESTIMATES = {
  'vendor-react-dom': 127.44,
  'vendor-react-core': 11.42,
  'vendor-routing': 2.99,
  'design-system': 23.26,
  'components-core': 9.34,
  'components-misc': 83.28,
  'pages-static': 21.37,
  'index': 84.66,
  'css-total': 141.0  // Combined CSS files
};

// Performance observer for resource loading
const observeResourceLoading = () => {
  if (!('PerformanceObserver' in window)) {
    return { cleanup: () => {}, getResourceSizes: () => ({}) };
  }

  const resourceSizes = new Map();
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        const filename = entry.name.split('/').pop();
        resourceSizes.set(filename, {
          size: entry.transferSize || 0,
          loadTime: entry.duration,
          timestamp: entry.startTime
        });
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('Resource performance observation failed:', error);
  }

  return {
    cleanup: () => observer.disconnect(),
    getResourceSizes: () => Object.fromEntries(resourceSizes)
  };
};

// Analyze bundle composition and identify optimization opportunities
const analyzeBundleComposition = (chunkSizes) => {
  const analysis = {
    totalSize: 0,
    largestChunks: [],
    recommendations: [],
    categoryBreakdown: {
      vendor: 0,
      pages: 0,
      components: 0,
      css: 0
    }
  };

  // Calculate totals and categorize
  Object.entries(chunkSizes).forEach(([chunk, size]) => {
    analysis.totalSize += size;
    
    if (chunk.startsWith('vendor-')) {
      analysis.categoryBreakdown.vendor += size;
    } else if (chunk.startsWith('page-')) {
      analysis.categoryBreakdown.pages += size;
    } else if (chunk.startsWith('components-')) {
      analysis.categoryBreakdown.components += size;
    } else if (chunk.includes('css')) {
      analysis.categoryBreakdown.css += size;
    }
  });

  // Identify largest chunks
  analysis.largestChunks = Object.entries(chunkSizes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([chunk, size]) => ({ chunk, size, percentage: (size / analysis.totalSize) * 100 }));

  // Generate recommendations
  if (analysis.totalSize > BUNDLE_THRESHOLDS.TARGET) {
    const excessSize = analysis.totalSize - BUNDLE_THRESHOLDS.TARGET;
    analysis.recommendations.push({
      type: 'size-reduction',
      priority: 'high',
      message: `Bundle is ${excessSize.toFixed(1)}KB over target. Consider lazy loading or code splitting.`,
      impact: excessSize
    });

    // Specific recommendations based on composition
    if (analysis.categoryBreakdown.vendor > 200) {
      analysis.recommendations.push({
        type: 'vendor-optimization',
        priority: 'high',
        message: 'Large vendor bundle detected. Consider dynamic imports for heavy libraries.',
        impact: analysis.categoryBreakdown.vendor - 200
      });
    }

    if (analysis.categoryBreakdown.css > 150) {
      analysis.recommendations.push({
        type: 'css-optimization',
        priority: 'medium',
        message: 'Large CSS bundle. Consider code splitting CSS or removing unused styles.',
        impact: analysis.categoryBreakdown.css - 150
      });
    }

    if (analysis.categoryBreakdown.components > 100) {
      analysis.recommendations.push({
        type: 'component-optimization',
        priority: 'medium',
        message: 'Large component bundle. Consider lazy loading non-critical components.',
        impact: analysis.categoryBreakdown.components - 100
      });
    }
  }

  return analysis;
};

// Main bundle monitoring hook
export function useBundleMonitoring(options = {}) {
  const {
    alertThreshold = BUNDLE_THRESHOLDS.WARNING,
    enableAlerts = true,
    enableLiveUpdates = true,
    trackResourceTiming = true
  } = options;

  const [bundleMetrics, setBundleMetrics] = useState({
    totalSize: 0,
    chunkSizes: INITIAL_CHUNK_ESTIMATES,
    analysis: null,
    loadTimes: {},
    status: 'unknown', // 'excellent', 'good', 'warning', 'critical'
    lastUpdated: null,
    resourceTiming: {}
  });

  const [alerts, setAlerts] = useState([]);
  const [resourceObserver, setResourceObserver] = useState(null);

  // Initialize resource monitoring
  useEffect(() => {
    if (trackResourceTiming && typeof window !== 'undefined') {
      const observer = observeResourceLoading();
      setResourceObserver(observer);

      return () => {
        observer.cleanup();
      };
    }
  }, [trackResourceTiming]);

  // Update bundle metrics
  const updateBundleMetrics = useCallback(() => {
    const currentSizes = { ...bundleMetrics.chunkSizes };
    
    // Get real resource sizes if available
    if (resourceObserver) {
      const realSizes = resourceObserver.getResourceSizes();
      Object.entries(realSizes).forEach(([filename, data]) => {
        // Convert bytes to KB and update chunk sizes
        const sizeKB = data.size / 1024;
        currentSizes[filename.replace(/\.[^.]+$/, '')] = sizeKB;
      });
    }

    const analysis = analyzeBundleComposition(currentSizes);
    
    // Determine status based on total size
    let status = 'excellent';
    if (analysis.totalSize > BUNDLE_THRESHOLDS.CRITICAL) {
      status = 'critical';
    } else if (analysis.totalSize > BUNDLE_THRESHOLDS.WARNING) {
      status = 'warning';
    } else if (analysis.totalSize > BUNDLE_THRESHOLDS.TARGET) {
      status = 'good';
    }

    const newMetrics = {
      totalSize: analysis.totalSize,
      chunkSizes: currentSizes,
      analysis,
      status,
      lastUpdated: new Date().toISOString(),
      resourceTiming: resourceObserver ? resourceObserver.getResourceSizes() : {}
    };

    setBundleMetrics(newMetrics);

    // Generate alerts if enabled
    if (enableAlerts) {
      generateAlerts(newMetrics, analysis);
    }

    return newMetrics;
  }, [bundleMetrics.chunkSizes, resourceObserver, enableAlerts]);

  // Generate alerts based on bundle metrics
  const generateAlerts = useCallback((metrics, analysis) => {
    const newAlerts = [];

    if (metrics.totalSize > BUNDLE_THRESHOLDS.CRITICAL) {
      newAlerts.push({
        id: 'bundle-critical',
        type: 'critical',
        title: 'Critical Bundle Size',
        message: `Bundle size (${metrics.totalSize.toFixed(1)}KB) is critically large. Immediate optimization required.`,
        recommendation: 'Implement lazy loading and code splitting immediately.',
        timestamp: Date.now()
      });
    } else if (metrics.totalSize > alertThreshold) {
      newAlerts.push({
        id: 'bundle-warning',
        type: 'warning',
        title: 'Large Bundle Size',
        message: `Bundle size (${metrics.totalSize.toFixed(1)}KB) exceeds recommended threshold (${alertThreshold}KB).`,
        recommendation: 'Consider lazy loading heavy components or libraries.',
        timestamp: Date.now()
      });
    }

    if (analysis.largestChunks.length > 0 && analysis.largestChunks[0].size > 100) {
      newAlerts.push({
        id: 'large-chunk',
        type: 'info',
        title: 'Large Chunk Detected',
        message: `Chunk "${analysis.largestChunks[0].chunk}" is ${analysis.largestChunks[0].size.toFixed(1)}KB.`,
        recommendation: 'Consider splitting this chunk further.',
        timestamp: Date.now()
      });
    }

    setAlerts(newAlerts);

    // Announce critical alerts to screen readers
    if (newAlerts.some(alert => alert.type === 'critical')) {
      liveRegionManager.announceError('Critical bundle size detected. Performance may be affected.');
    }
  }, [alertThreshold]);

  // Periodic updates if enabled
  useEffect(() => {
    if (enableLiveUpdates) {
      const interval = setInterval(() => {
        updateBundleMetrics();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [updateBundleMetrics, enableLiveUpdates]);

  // Initial metrics calculation
  useEffect(() => {
    updateBundleMetrics();
  }, []);

  // Manual refresh function
  const refreshMetrics = useCallback(() => {
    return updateBundleMetrics();
  }, [updateBundleMetrics]);

  // Dismiss alert function
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Get optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    if (!bundleMetrics.analysis) return [];

    const suggestions = [...bundleMetrics.analysis.recommendations];

    // Add specific suggestions based on current bundle composition
    if (bundleMetrics.totalSize > BUNDLE_THRESHOLDS.TARGET) {
      suggestions.push({
        type: 'general-optimization',
        priority: 'medium',
        message: 'Consider using tree shaking to remove unused code.',
        impact: 'Variable'
      });

      suggestions.push({
        type: 'compression',
        priority: 'low',
        message: 'Ensure gzip/brotli compression is enabled on your server.',
        impact: '20-30% size reduction'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [bundleMetrics.analysis, bundleMetrics.totalSize]);

  return {
    metrics: bundleMetrics,
    alerts,
    refreshMetrics,
    dismissAlert,
    optimizationSuggestions: getOptimizationSuggestions(),
    isOverTarget: bundleMetrics.totalSize > BUNDLE_THRESHOLDS.TARGET,
    percentageOfTarget: (bundleMetrics.totalSize / BUNDLE_THRESHOLDS.TARGET) * 100,
    targetSize: BUNDLE_THRESHOLDS.TARGET
  };
}

export default useBundleMonitoring;