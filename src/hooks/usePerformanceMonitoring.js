/**
 * Performance Monitoring Hooks
 * Tracks Core Web Vitals, memory usage, and simulation performance
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { globalPoolManager } from '../utils/ObjectPool';

// Core Web Vitals tracking
export function useWebVitals() {
  const [vitals, setVitals] = useState({
    FCP: null, // First Contentful Paint
    LCP: null, // Largest Contentful Paint
    FID: null, // First Input Delay
    CLS: null, // Cumulative Layout Shift
    TTFB: null // Time to First Byte
  });

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if performance APIs are supported
    const supported = !!(
      window.performance &&
      window.PerformanceObserver
    );
    
    setIsSupported(supported);
    
    if (!supported) {
      console.warn('Performance monitoring APIs not supported');
      return;
    }

    // Observe paint metrics (FCP, LCP)
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        switch (entry.name) {
          case 'first-contentful-paint':
            setVitals(prev => ({ ...prev, FCP: entry.startTime }));
            break;
          case 'largest-contentful-paint':
            setVitals(prev => ({ ...prev, LCP: entry.startTime }));
            break;
        }
      });
    });

    // Observe layout shift
    const layoutShiftObserver = new PerformanceObserver((list) => {
      let cls = 0;
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      setVitals(prev => ({ ...prev, CLS: cls }));
    });

    // Observe first input delay
    const firstInputObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        setVitals(prev => ({ ...prev, FID: entry.processingStart - entry.startTime }));
      });
    });

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      firstInputObserver.observe({ entryTypes: ['first-input'] });
      
      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Get navigation timing for TTFB
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        setVitals(prev => ({ ...prev, TTFB: navEntry.responseStart - navEntry.requestStart }));
      }

    } catch (error) {
      console.error('Error setting up performance observers:', error);
    }

    return () => {
      try {
        paintObserver.disconnect();
        layoutShiftObserver.disconnect();
        firstInputObserver.disconnect();
      } catch (error) {
        console.error('Error disconnecting performance observers:', error);
      }
    };
  }, []);

  const getVitalsGrade = useCallback(() => {
    const grades = {};
    
    if (vitals.FCP !== null) {
      grades.FCP = vitals.FCP <= 1800 ? 'good' : vitals.FCP <= 3000 ? 'needs-improvement' : 'poor';
    }
    
    if (vitals.LCP !== null) {
      grades.LCP = vitals.LCP <= 2500 ? 'good' : vitals.LCP <= 4000 ? 'needs-improvement' : 'poor';
    }
    
    if (vitals.FID !== null) {
      grades.FID = vitals.FID <= 100 ? 'good' : vitals.FID <= 300 ? 'needs-improvement' : 'poor';
    }
    
    if (vitals.CLS !== null) {
      grades.CLS = vitals.CLS <= 0.1 ? 'good' : vitals.CLS <= 0.25 ? 'needs-improvement' : 'poor';
    }

    return grades;
  }, [vitals]);

  return {
    vitals,
    grades: getVitalsGrade(),
    isSupported
  };
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    isSupported: false
  });

  const [memoryHistory, setMemoryHistory] = useState([]);
  const maxHistorySize = 100;

  useEffect(() => {
    const isSupported = !!(performance.memory);
    setMemoryInfo(prev => ({ ...prev, isSupported }));

    if (!isSupported) {
      console.warn('Memory API not supported');
      return;
    }

    const updateMemoryInfo = () => {
      const memory = performance.memory;
      const timestamp = Date.now();
      
      const newInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        isSupported: true,
        timestamp,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      setMemoryInfo(newInfo);
      
      setMemoryHistory(prev => {
        const newHistory = [...prev, newInfo];
        return newHistory.slice(-maxHistorySize);
      });
    };

    // Update immediately and then every 5 seconds
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMemoryStats = useCallback(() => {
    if (memoryHistory.length === 0) return null;

    const values = memoryHistory.map(h => h.usedJSHeapSize);
    const peak = Math.max(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];

    return {
      current,
      peak,
      average,
      trend: values.length > 1 ? current - values[values.length - 2] : 0
    };
  }, [memoryHistory]);

  return {
    memoryInfo,
    memoryHistory,
    memoryStats: getMemoryStats()
  };
}

// FPS monitoring for animations and simulations
export function useFPSMonitoring() {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsUpdateIntervalRef = useRef(null);

  const requestRef = useRef();

  const measureFrame = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    
    setFrameTime(delta);
    frameCountRef.current++;
    lastFrameTimeRef.current = now;

    requestRef.current = requestAnimationFrame(measureFrame);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(measureFrame);

    // Calculate FPS every second
    fpsUpdateIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (fpsUpdateIntervalRef.current) {
        clearInterval(fpsUpdateIntervalRef.current);
      }
    };
  }, [measureFrame]);

  const getFPSGrade = useCallback(() => {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'fair';
    return 'poor';
  }, [fps]);

  return {
    fps,
    frameTime,
    grade: getFPSGrade(),
    isSmooth: fps >= 55
  };
}

// Comprehensive performance monitoring hook
export function usePerformanceMonitoring() {
  const webVitals = useWebVitals();
  const memoryMonitoring = useMemoryMonitoring();
  const fpsMonitoring = useFPSMonitoring();
  
  const [objectPoolStats, setObjectPoolStats] = useState(null);

  // Update object pool stats periodically
  useEffect(() => {
    const updatePoolStats = () => {
      setObjectPoolStats(globalPoolManager.getGlobalStats());
    };

    updatePoolStats();
    const interval = setInterval(updatePoolStats, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getOverallPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points based on Core Web Vitals
    Object.values(webVitals.grades).forEach(grade => {
      if (grade === 'needs-improvement') score -= 10;
      if (grade === 'poor') score -= 20;
    });
    
    // Deduct points for low FPS
    if (fpsMonitoring.fps < 30) score -= 15;
    else if (fpsMonitoring.fps < 45) score -= 10;
    else if (fpsMonitoring.fps < 55) score -= 5;
    
    // Deduct points for high memory usage
    if (memoryMonitoring.memoryInfo.usagePercentage > 80) score -= 15;
    else if (memoryMonitoring.memoryInfo.usagePercentage > 60) score -= 10;
    else if (memoryMonitoring.memoryInfo.usagePercentage > 40) score -= 5;

    return Math.max(0, Math.min(100, score));
  }, [webVitals.grades, fpsMonitoring.fps, memoryMonitoring.memoryInfo.usagePercentage]);

  const performCleanup = useCallback(() => {
    globalPoolManager.performCleanup();
    
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc) {
      window.gc();
    }
  }, []);

  return {
    webVitals,
    memory: memoryMonitoring,
    fps: fpsMonitoring,
    objectPools: objectPoolStats,
    overallScore: getOverallPerformanceScore(),
    performCleanup,
    isSupported: webVitals.isSupported && memoryMonitoring.memoryInfo.isSupported
  };
}

// Hook for real-time performance alerts
export function usePerformanceAlerts(thresholds = {}) {
  const performance = usePerformanceMonitoring();
  const [alerts, setAlerts] = useState([]);
  
  const defaultThresholds = {
    maxFPS: 30,
    maxMemoryUsage: 80, // percentage
    maxLCP: 4000, // ms
    maxCLS: 0.25,
    maxFID: 300, // ms
    ...thresholds
  };

  useEffect(() => {
    const newAlerts = [];

    // FPS alerts
    if (performance.fps.fps < defaultThresholds.maxFPS) {
      newAlerts.push({
        type: 'fps',
        severity: 'warning',
        message: `Low FPS detected: ${performance.fps.fps} fps`,
        value: performance.fps.fps,
        threshold: defaultThresholds.maxFPS
      });
    }

    // Memory alerts
    if (performance.memory.memoryInfo.usagePercentage > defaultThresholds.maxMemoryUsage) {
      newAlerts.push({
        type: 'memory',
        severity: 'critical',
        message: `High memory usage: ${performance.memory.memoryInfo.usagePercentage.toFixed(1)}%`,
        value: performance.memory.memoryInfo.usagePercentage,
        threshold: defaultThresholds.maxMemoryUsage
      });
    }

    // Core Web Vitals alerts
    if (performance.webVitals.vitals.LCP && performance.webVitals.vitals.LCP > defaultThresholds.maxLCP) {
      newAlerts.push({
        type: 'lcp',
        severity: 'warning',
        message: `Slow page load: LCP ${performance.webVitals.vitals.LCP.toFixed(0)}ms`,
        value: performance.webVitals.vitals.LCP,
        threshold: defaultThresholds.maxLCP
      });
    }

    setAlerts(newAlerts);
  }, [performance, defaultThresholds]);

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    warningAlerts: alerts.filter(a => a.severity === 'warning')
  };
}

export default usePerformanceMonitoring;