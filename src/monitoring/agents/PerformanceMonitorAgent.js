/**
 * Performance Monitor Agent
 * Monitors Core Web Vitals, bundle size, and runtime performance
 */

import { BaseAgent } from '../core/BaseAgent.js';

export class PerformanceMonitorAgent extends BaseAgent {
  constructor(config = {}) {
    const defaultConfig = {
      agentId: 'performance_monitor_001',
      name: 'Performance Monitor Agent',
      type: 'analyst',
      cognitivePattern: 'analytical_optimization',
      priorityLevel: 'critical',
      capabilities: [
        'lighthouse_analysis',
        'core_web_vitals_monitoring',
        'bundle_size_tracking',
        'runtime_performance_analysis',
        'optimization_recommendation',
        'threshold_alerting'
      ],
      responsibilities: [
        'Continuously monitor Core Web Vitals (LCP, FID, CLS)',
        'Track bundle size and loading performance metrics',
        'Analyze runtime performance of interactive simulations',
        'Generate performance optimization recommendations',
        'Alert on performance threshold breaches',
        'Maintain performance budgets and targets'
      ],
      monitoringTargets: {
        lighthouse_performance: { target: 95, alertThreshold: 85, measurementFrequency: 'daily' },
        first_contentful_paint: { target: 1.5, alertThreshold: 2.0, measurementFrequency: 'continuous' },
        largest_contentful_paint: { target: 2.5, alertThreshold: 3.0, measurementFrequency: 'continuous' },
        cumulative_layout_shift: { target: 0.1, alertThreshold: 0.15, measurementFrequency: 'continuous' },
        first_input_delay: { target: 100, alertThreshold: 200, measurementFrequency: 'continuous' },
        bundle_size: { target: 500, alertThreshold: 600, measurementFrequency: 'per_build' }
      },
      ...config
    };

    super(defaultConfig);

    // Performance-specific properties
    this.performanceObserver = null;
    this.webVitalsMetrics = new Map();
    this.resourceTimings = [];
    this.navigationTiming = null;
    this.paintTimings = new Map();
    this.layoutShifts = [];
    this.longTasks = [];
    
    // Thresholds from config
    this.thresholds = defaultConfig.monitoringTargets;
    
    // Performance budget tracking
    this.budgets = {
      maxBundleSize: 500 * 1024, // 500KB
      maxImageSize: 200 * 1024,  // 200KB per image
      maxFontSize: 100 * 1024,   // 100KB per font
      maxJSExecutionTime: 50,    // 50ms
      maxRenderTime: 16          // 16ms (60fps)
    };

    // Measurement intervals
    this.measurementInterval = null;
    this.vitalsCheckInterval = null;
  }

  /**
   * Set up performance monitoring
   */
  async setupMonitoring() {
    this.log('Setting up performance monitoring...');

    try {
      // Initialize PerformanceObserver for different entry types
      await this.initializePerformanceObserver();
      
      // Set up Web Vitals monitoring
      await this.initializeWebVitalsMonitoring();
      
      // Set up resource monitoring
      await this.initializeResourceMonitoring();
      
      // Start continuous measurements
      this.startContinuousMonitoring();
      
      this.log('Performance monitoring setup complete');
      
    } catch (error) {
      this.handleError('Performance monitoring setup failed', error);
    }
  }

  /**
   * Initialize PerformanceObserver for various performance entries
   */
  async initializePerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {
      this.log('PerformanceObserver not supported', 'warn');
      return;
    }

    try {
      // Navigation and resource timings
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = ['navigation', 'resource', 'paint', 'layout-shift', 'longtask', 'measure'];
      
      for (const type of entryTypes) {
        try {
          this.performanceObserver.observe({ type, buffered: true });
        } catch (e) {
          this.log(`Entry type '${type}' not supported`, 'warn');
        }
      }

    } catch (error) {
      this.log('Failed to initialize PerformanceObserver', 'error');
      throw error;
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  async initializeWebVitalsMonitoring() {
    // Monitor Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // Monitor First Input Delay (FID) 
    this.observeFID();
    
    // Monitor Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Monitor First Contentful Paint (FCP)
    this.observeFCP();

    this.log('Web Vitals monitoring initialized');
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const lcp = lastEntry.startTime;
        this.webVitalsMetrics.set('LCP', {
          value: lcp,
          timestamp: Date.now(),
          rating: this.getRating('LCP', lcp),
          entry: lastEntry
        });

        this.checkThreshold('largest_contentful_paint', lcp);
      });

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      this.log('LCP observation not supported', 'warn');
    }
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          
          this.webVitalsMetrics.set('FID', {
            value: fid,
            timestamp: Date.now(),
            rating: this.getRating('FID', fid),
            entry: entry
          });

          this.checkThreshold('first_input_delay', fid);
        }
      });

      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      this.log('FID observation not supported', 'warn');
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include the entry in the current session.
            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            // Update CLS if the current session value is larger
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              
              this.webVitalsMetrics.set('CLS', {
                value: clsValue,
                timestamp: Date.now(),
                rating: this.getRating('CLS', clsValue),
                entries: [...sessionEntries]
              });

              this.checkThreshold('cumulative_layout_shift', clsValue);
            }
          }
        }
      });

      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      this.log('CLS observation not supported', 'warn');
    }
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            
            this.webVitalsMetrics.set('FCP', {
              value: fcp,
              timestamp: Date.now(),
              rating: this.getRating('FCP', fcp),
              entry: entry
            });

            this.checkThreshold('first_contentful_paint', fcp);
          }
        }
      });

      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (error) {
      this.log('FCP observation not supported', 'warn');
    }
  }

  /**
   * Initialize resource monitoring
   */
  async initializeResourceMonitoring() {
    // Monitor resource loading performance
    if (typeof PerformanceObserver !== 'undefined') {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResourceTiming(entry);
        }
      });

      resourceObserver.observe({ type: 'resource', buffered: true });
    }

    // Monitor network information if available
    if ('connection' in navigator) {
      this.monitorNetworkInformation();
    }

    // Monitor memory usage if available
    if (performance.memory) {
      this.monitorMemoryUsage();
    }
  }

  /**
   * Start continuous monitoring
   */
  startContinuousMonitoring() {
    // Collect metrics every 30 seconds
    this.measurementInterval = setInterval(() => {
      this.collectCurrentMetrics();
    }, 30000);

    // Check Web Vitals every 5 seconds
    this.vitalsCheckInterval = setInterval(() => {
      this.checkWebVitalsStatus();
    }, 5000);

    this.log('Continuous monitoring started');
  }

  /**
   * Process performance entry
   */
  processPerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.navigationTiming = entry;
        this.analyzeNavigationTiming(entry);
        break;
      case 'resource':
        this.resourceTimings.push(entry);
        this.analyzeResourceTiming(entry);
        break;
      case 'paint':
        this.paintTimings.set(entry.name, entry);
        break;
      case 'layout-shift':
        this.layoutShifts.push(entry);
        break;
      case 'longtask':
        this.longTasks.push(entry);
        this.analyzeLongTask(entry);
        break;
      case 'measure':
        this.analyzeCustomMeasure(entry);
        break;
    }
  }

  /**
   * Analyze navigation timing
   */
  analyzeNavigationTiming(entry) {
    const metrics = {
      'DNS_Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP_Connect': entry.connectEnd - entry.connectStart,
      'TLS_Handshake': entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      'Request': entry.responseStart - entry.requestStart,
      'Response': entry.responseEnd - entry.responseStart,
      'DOM_Parse': entry.domContentLoadedEventStart - entry.responseEnd,
      'Resource_Load': entry.loadEventStart - entry.domContentLoadedEventEnd,
      'Total_Load_Time': entry.loadEventEnd - entry.navigationStart
    };

    for (const [key, value] of Object.entries(metrics)) {
      this.metrics.set(`navigation_${key}`, value);
    }

    // Check for performance issues
    if (metrics.Total_Load_Time > 3000) {
      this.generateAlert('slow_page_load', {
        message: `Page load time exceeded 3 seconds: ${metrics.Total_Load_Time}ms`,
        severity: 'warning',
        loadTime: metrics.Total_Load_Time,
        breakdown: metrics
      });
    }
  }

  /**
   * Analyze resource timing
   */
  analyzeResourceTiming(entry) {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || entry.decodedBodySize || 0;
    
    // Check against budgets
    if (entry.initiatorType === 'script' && size > this.budgets.maxBundleSize) {
      this.generateAlert('bundle_size_exceeded', {
        message: `Script bundle size exceeded budget: ${Math.round(size / 1024)}KB > ${Math.round(this.budgets.maxBundleSize / 1024)}KB`,
        severity: 'warning',
        resource: entry.name,
        size: size,
        budget: this.budgets.maxBundleSize
      });
    }

    if (entry.initiatorType === 'img' && size > this.budgets.maxImageSize) {
      this.generateAlert('image_size_exceeded', {
        message: `Image size exceeded budget: ${Math.round(size / 1024)}KB > ${Math.round(this.budgets.maxImageSize / 1024)}KB`,
        severity: 'info',
        resource: entry.name,
        size: size,
        budget: this.budgets.maxImageSize
      });
    }

    // Track slow resources
    if (duration > 2000) {
      this.generateAlert('slow_resource_load', {
        message: `Resource load time exceeded 2 seconds: ${entry.name}`,
        severity: 'info',
        resource: entry.name,
        duration: duration,
        size: size
      });
    }
  }

  /**
   * Analyze long task
   */
  analyzeLongTask(entry) {
    const duration = entry.duration;
    
    if (duration > this.budgets.maxJSExecutionTime) {
      this.generateAlert('long_task_detected', {
        message: `Long task detected: ${duration}ms > ${this.budgets.maxJSExecutionTime}ms`,
        severity: 'warning',
        duration: duration,
        startTime: entry.startTime
      });

      this.generateRecommendation('optimize_long_task', {
        title: 'Optimize Long Running Task',
        description: `A task ran for ${Math.round(duration)}ms, blocking the main thread. Consider breaking it into smaller chunks or using Web Workers.`,
        priority: 'high',
        actionable: true,
        estimatedImpact: 'medium',
        task: {
          duration,
          startTime: entry.startTime,
          attribution: entry.attribution
        }
      });
    }
  }

  /**
   * Analyze custom measure
   */
  analyzeCustomMeasure(entry) {
    this.metrics.set(`custom_${entry.name}`, entry.duration);
    
    // Track simulation performance measures
    if (entry.name.startsWith('simulation_')) {
      if (entry.duration > 16) { // Over one frame at 60fps
        this.generateAlert('simulation_performance_issue', {
          message: `Simulation frame time exceeded budget: ${entry.name} took ${entry.duration}ms`,
          severity: 'info',
          simulation: entry.name,
          duration: entry.duration
        });
      }
    }
  }

  /**
   * Monitor network information
   */
  monitorNetworkInformation() {
    const connection = navigator.connection;
    
    this.metrics.set('network_effectiveType', connection.effectiveType);
    this.metrics.set('network_downlink', connection.downlink);
    this.metrics.set('network_rtt', connection.rtt);
    this.metrics.set('network_saveData', connection.saveData);

    // Adjust monitoring based on connection
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      this.log('Slow connection detected, adjusting thresholds', 'info');
      // Relax performance thresholds for slow connections
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    const memory = performance.memory;
    
    this.metrics.set('memory_used', memory.usedJSHeapSize);
    this.metrics.set('memory_total', memory.totalJSHeapSize);
    this.metrics.set('memory_limit', memory.jsHeapSizeLimit);
    
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    if (usagePercent > 80) {
      this.generateAlert('high_memory_usage', {
        message: `Memory usage is high: ${Math.round(usagePercent)}%`,
        severity: 'warning',
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    }
  }

  /**
   * Collect current metrics
   */
  async collectCurrentMetrics() {
    await super.collectMetrics();

    // Collect Web Vitals
    for (const [name, metric] of this.webVitalsMetrics.entries()) {
      this.metrics.set(`webvitals_${name}`, metric.value);
      this.metrics.set(`webvitals_${name}_rating`, metric.rating);
    }

    // Collect resource counts
    this.metrics.set('resource_count', this.resourceTimings.length);
    this.metrics.set('layout_shift_count', this.layoutShifts.length);
    this.metrics.set('long_task_count', this.longTasks.length);

    // Calculate performance score
    const score = this.calculatePerformanceScore();
    this.metrics.set('performance_score', score);
  }

  /**
   * Check Web Vitals status
   */
  checkWebVitalsStatus() {
    for (const [name, metric] of this.webVitalsMetrics.entries()) {
      if (metric.rating === 'poor') {
        this.generateRecommendation(`improve_${name.toLowerCase()}`, {
          title: `Improve ${name}`,
          description: `${name} is in poor range (${metric.value}). Consider optimization strategies.`,
          priority: 'high',
          actionable: true,
          estimatedImpact: 'high',
          currentValue: metric.value,
          goodThreshold: this.getGoodThreshold(name)
        });
      }
    }
  }

  /**
   * Check threshold for a specific metric
   */
  checkThreshold(metricName, value) {
    const threshold = this.thresholds[metricName];
    if (!threshold) return;

    if (value > threshold.alertThreshold) {
      this.generateAlert(`${metricName}_threshold_exceeded`, {
        message: `${metricName} exceeded threshold: ${value} > ${threshold.alertThreshold}`,
        severity: value > threshold.target * 1.5 ? 'critical' : 'warning',
        metric: metricName,
        value: value,
        threshold: threshold.alertThreshold,
        target: threshold.target
      });
    }
  }

  /**
   * Get performance rating for Web Vitals
   */
  getRating(metric, value) {
    const thresholds = {
      'LCP': { good: 2500, needsImprovement: 4000 },
      'FID': { good: 100, needsImprovement: 300 },
      'CLS': { good: 0.1, needsImprovement: 0.25 },
      'FCP': { good: 1800, needsImprovement: 3000 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get good threshold for a metric
   */
  getGoodThreshold(metric) {
    const thresholds = {
      'LCP': 2500,
      'FID': 100,
      'CLS': 0.1,
      'FCP': 1800
    };
    return thresholds[metric] || 0;
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore() {
    let score = 100;
    let factors = 0;

    // Web Vitals scoring
    for (const [name, metric] of this.webVitalsMetrics.entries()) {
      factors++;
      switch (metric.rating) {
        case 'good':
          // No penalty
          break;
        case 'needs-improvement':
          score -= 10;
          break;
        case 'poor':
          score -= 25;
          break;
      }
    }

    // Long tasks penalty
    if (this.longTasks.length > 0) {
      score -= Math.min(20, this.longTasks.length * 2);
    }

    // Large resource penalty
    const largeResources = this.resourceTimings.filter(r => 
      (r.transferSize || r.decodedBodySize || 0) > 200 * 1024
    ).length;
    
    if (largeResources > 0) {
      score -= Math.min(15, largeResources * 3);
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate performance optimization recommendations
   */
  generateOptimizationRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    const largeScripts = this.resourceTimings.filter(r => 
      r.initiatorType === 'script' && (r.transferSize || 0) > this.budgets.maxBundleSize
    );

    if (largeScripts.length > 0) {
      recommendations.push(this.generateRecommendation('reduce_bundle_size', {
        title: 'Reduce JavaScript Bundle Size',
        description: `${largeScripts.length} script(s) exceed the size budget. Consider code splitting and tree shaking.`,
        priority: 'high',
        actionable: true,
        estimatedImpact: 'high',
        scripts: largeScripts.map(s => ({ name: s.name, size: s.transferSize }))
      }));
    }

    // Image optimization recommendations
    const largeImages = this.resourceTimings.filter(r => 
      r.initiatorType === 'img' && (r.transferSize || 0) > this.budgets.maxImageSize
    );

    if (largeImages.length > 0) {
      recommendations.push(this.generateRecommendation('optimize_images', {
        title: 'Optimize Image Assets',
        description: `${largeImages.length} image(s) exceed the size budget. Consider compression and modern formats.`,
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'medium',
        images: largeImages.map(i => ({ name: i.name, size: i.transferSize }))
      }));
    }

    return recommendations;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const baseReport = super.generateReport();
    
    return {
      ...baseReport,
      webVitals: Object.fromEntries(this.webVitalsMetrics),
      performanceScore: this.calculatePerformanceScore(),
      resourceSummary: {
        totalResources: this.resourceTimings.length,
        totalSize: this.resourceTimings.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        largeResources: this.resourceTimings.filter(r => (r.transferSize || 0) > 200 * 1024).length
      },
      performanceIssues: {
        longTasks: this.longTasks.length,
        layoutShifts: this.layoutShifts.length,
        slowResources: this.resourceTimings.filter(r => (r.responseEnd - r.startTime) > 2000).length
      },
      budgetStatus: {
        bundleSize: {
          budget: this.budgets.maxBundleSize,
          largest: Math.max(...this.resourceTimings
            .filter(r => r.initiatorType === 'script')
            .map(r => r.transferSize || 0), 0),
          compliant: this.resourceTimings
            .filter(r => r.initiatorType === 'script')
            .every(r => (r.transferSize || 0) <= this.budgets.maxBundleSize)
        }
      },
      recommendations: this.generateOptimizationRecommendations()
    };
  }

  /**
   * Shutdown performance monitoring
   */
  async shutdown() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
    }

    if (this.vitalsCheckInterval) {
      clearInterval(this.vitalsCheckInterval);
    }

    await super.shutdown();
  }
}

export default PerformanceMonitorAgent;