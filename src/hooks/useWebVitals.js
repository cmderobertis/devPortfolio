import { useEffect } from 'react';

// Hook for monitoring Core Web Vitals
export const useWebVitals = (options = {}) => {
  const { onReport, debug = false } = options;

  useEffect(() => {
    const reportWebVitals = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Dynamically import web-vitals to reduce bundle size
        const { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } = await import('web-vitals');

        const logMetric = (metric) => {
          // Log to console if debug mode is enabled
          if (debug) {
            console.log(`[Web Vitals] ${metric.name}:`, {
              value: metric.value,
              rating: metric.rating,
              delta: metric.delta,
              entries: metric.entries
            });
          }

          // Call custom reporter if provided
          if (onReport) {
            onReport(metric);
          }

          // Send to analytics (implement based on your analytics provider)
          if (window.gtag) {
            window.gtag('event', metric.name, {
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              metric_rating: metric.rating,
              metric_delta: metric.delta,
              non_interaction: true
            });
          }
        };

        // Core Web Vitals
        getCLS(logMetric);     // Cumulative Layout Shift
        getFID(logMetric);     // First Input Delay (deprecated, use INP)
        getFCP(logMetric);     // First Contentful Paint
        getLCP(logMetric);     // Largest Contentful Paint
        getTTFB(logMetric);    // Time to First Byte
        
        // New metric replacing FID
        if (getINP) {
          getINP(logMetric);   // Interaction to Next Paint
        }
      } catch (error) {
        console.error('Failed to load web-vitals:', error);
      }
    };

    reportWebVitals();
  }, [onReport, debug]);
};

// Utility to format metrics for display
export const formatMetric = (name, value) => {
  switch (name) {
    case 'CLS':
      return value.toFixed(3);
    case 'FCP':
    case 'LCP':
    case 'FID':
    case 'INP':
    case 'TTFB':
      return `${Math.round(value)}ms`;
    default:
      return value;
  }
};

// Thresholds for Core Web Vitals (Good/Needs Improvement/Poor)
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },    // Largest Contentful Paint
  FID: { good: 100, poor: 300 },      // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },     // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },    // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },    // Time to First Byte
  INP: { good: 200, poor: 500 }       // Interaction to Next Paint
};

// Get rating based on metric value
export const getMetricRating = (name, value) => {
  const threshold = WEB_VITALS_THRESHOLDS[name];
  if (!threshold) return 'unknown';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};