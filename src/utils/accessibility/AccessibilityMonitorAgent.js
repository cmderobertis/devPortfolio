/**
 * Accessibility Monitoring Agent
 * Automated accessibility monitoring and reporting
 * Implements WCAG 2.1 AA compliance monitoring
 */

import axe from 'axe-core';
import { 
  auditPageContrast, 
  touchTargets, 
  performAccessibilityAudit,
  calculateContrastRatio
} from './index.js';

class AccessibilityMonitorAgent {
  constructor(options = {}) {
    this.options = {
      autoStart: false,
      interval: 30000, // 30 seconds
      reportToConsole: true,
      storageKey: 'accessibility-audit-results',
      ...options
    };
    
    this.isRunning = false;
    this.intervalId = null;
    this.lastAudit = null;
    this.violations = [];
    this.metrics = {
      totalViolations: 0,
      contrastViolations: 0,
      touchTargetViolations: 0,
      keyboardViolations: 0,
      ariaViolations: 0,
      lastAuditTime: null,
      wcagLevel: 'AA'
    };
    
    // Initialize axe-core configuration
    this.initializeAxe();
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * Initialize axe-core with WCAG 2.1 AA configuration
   */
  initializeAxe() {
    // Configure axe-core for WCAG 2.1 AA compliance
    axe.configure({
      rules: [
        // Color contrast
        { id: 'color-contrast', enabled: true },
        { id: 'color-contrast-enhanced', enabled: false }, // AAA level
        
        // Keyboard navigation
        { id: 'keyboard', enabled: true },
        { id: 'focus-order-semantics', enabled: true },
        { id: 'focusable-no-name', enabled: true },
        
        // ARIA
        { id: 'aria-allowed-attr', enabled: true },
        { id: 'aria-required-attr', enabled: true },
        { id: 'aria-valid-attr-value', enabled: true },
        { id: 'aria-valid-attr', enabled: true },
        { id: 'aria-hidden-focus', enabled: true },
        
        // Labels and names
        { id: 'label', enabled: true },
        { id: 'button-name', enabled: true },
        { id: 'link-name', enabled: true },
        
        // Images
        { id: 'image-alt', enabled: true },
        
        // Structure
        { id: 'heading-order', enabled: true },
        { id: 'landmark-one-main', enabled: true },
        { id: 'region', enabled: true }
      ],
      tags: ['wcag2a', 'wcag2aa'],
      disableOtherRules: false
    });
  }

  /**
   * Start automated monitoring
   */
  start() {
    if (this.isRunning) {
      console.warn('Accessibility monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting Accessibility Monitor Agent');
    
    // Perform initial audit
    this.performFullAudit();
    
    // Set up periodic monitoring
    this.intervalId = setInterval(() => {
      this.performFullAudit();
    }, this.options.interval);
  }

  /**
   * Stop automated monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('⏹️ Stopped Accessibility Monitor Agent');
  }

  /**
   * Perform comprehensive accessibility audit
   */
  async performFullAudit() {
    const auditStart = performance.now();
    const audit = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      violations: [],
      passes: [],
      colorContrast: [],
      touchTargets: [],
      keyboardNavigation: {},
      summary: {}
    };

    try {
      // Run axe-core audit
      const axeResults = await this.runAxeAudit();
      audit.violations = axeResults.violations;
      audit.passes = axeResults.passes;

      // Color contrast audit
      audit.colorContrast = this.auditColorContrast();

      // Touch targets audit
      audit.touchTargets = this.auditTouchTargets();

      // Keyboard navigation audit
      audit.keyboardNavigation = this.auditKeyboardNavigation();

      // Generate summary
      audit.summary = this.generateSummary(audit);

      this.lastAudit = audit;
      this.updateMetrics(audit);

      const auditDuration = performance.now() - auditStart;
      
      if (this.options.reportToConsole) {
        this.reportToConsole(audit, auditDuration);
      }

      // Store audit results
      this.storeAuditResults(audit);

      // Dispatch audit complete event
      this.dispatchAuditEvent(audit);

    } catch (error) {
      console.error('Accessibility audit failed:', error);
      audit.error = error.message;
    }

    return audit;
  }

  /**
   * Run axe-core accessibility audit
   */
  async runAxeAudit() {
    return new Promise((resolve, reject) => {
      axe.run(document, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Audit color contrast violations
   */
  auditColorContrast() {
    try {
      return auditPageContrast();
    } catch (error) {
      console.warn('Color contrast audit failed:', error);
      return [];
    }
  }

  /**
   * Audit touch target compliance
   */
  auditTouchTargets() {
    try {
      return touchTargets.auditTouchTargets();
    } catch (error) {
      console.warn('Touch targets audit failed:', error);
      return [];
    }
  }

  /**
   * Audit keyboard navigation support
   */
  auditKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [role="button"], [onclick], [onkeypress]'
    );
    
    const elementsWithTabIndex = document.querySelectorAll('[tabindex]');
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label], [aria-labelledby]');

    return {
      focusableElements: focusableElements.length,
      interactiveElements: interactiveElements.length,
      elementsWithTabIndex: elementsWithTabIndex.length,
      elementsWithAriaLabel: elementsWithAriaLabel.length,
      tabIndexIssues: this.findTabIndexIssues(elementsWithTabIndex),
      missingLabels: this.findMissingLabels(interactiveElements)
    };
  }

  /**
   * Find problematic tabindex usage
   */
  findTabIndexIssues(elements) {
    const issues = [];
    elements.forEach(element => {
      const tabIndex = parseInt(element.getAttribute('tabindex'));
      if (tabIndex > 0) {
        issues.push({
          element,
          issue: `Positive tabindex value: ${tabIndex}`,
          recommendation: 'Use tabindex="0" or remove tabindex'
        });
      }
    });
    return issues;
  }

  /**
   * Find interactive elements missing accessible names
   */
  findMissingLabels(elements) {
    const missing = [];
    elements.forEach(element => {
      const hasLabel = element.getAttribute('aria-label') ||
                      element.getAttribute('aria-labelledby') ||
                      element.getAttribute('title') ||
                      (element.tagName === 'INPUT' && element.labels && element.labels.length > 0) ||
                      element.textContent.trim();
      
      if (!hasLabel) {
        missing.push({
          element,
          tagName: element.tagName,
          className: element.className,
          id: element.id
        });
      }
    });
    return missing;
  }

  /**
   * Generate audit summary
   */
  generateSummary(audit) {
    const totalViolations = audit.violations.length;
    const criticalViolations = audit.violations.filter(v => v.impact === 'critical').length;
    const seriousViolations = audit.violations.filter(v => v.impact === 'serious').length;
    const moderateViolations = audit.violations.filter(v => v.impact === 'moderate').length;
    const minorViolations = audit.violations.filter(v => v.impact === 'minor').length;

    const colorContrastViolations = audit.colorContrast.length;
    const touchTargetViolations = audit.touchTargets.length;

    const complianceScore = this.calculateComplianceScore(audit);

    return {
      totalViolations,
      criticalViolations,
      seriousViolations,
      moderateViolations,
      minorViolations,
      colorContrastViolations,
      touchTargetViolations,
      complianceScore,
      wcagLevel: complianceScore >= 95 ? 'AAA' : complianceScore >= 85 ? 'AA' : 'A',
      isCompliant: totalViolations === 0 && colorContrastViolations === 0 && touchTargetViolations === 0
    };
  }

  /**
   * Calculate compliance score (0-100)
   */
  calculateComplianceScore(audit) {
    const weights = {
      critical: 25,
      serious: 15,
      moderate: 5,
      minor: 1,
      colorContrast: 10,
      touchTarget: 5
    };

    const maxPossibleScore = 100;
    let deductions = 0;

    audit.violations.forEach(violation => {
      const impact = violation.impact || 'moderate';
      deductions += weights[impact] || weights.moderate;
    });

    deductions += audit.colorContrast.length * weights.colorContrast;
    deductions += audit.touchTargets.length * weights.touchTarget;

    return Math.max(0, maxPossibleScore - deductions);
  }

  /**
   * Update metrics
   */
  updateMetrics(audit) {
    this.metrics.totalViolations = audit.violations.length;
    this.metrics.contrastViolations = audit.colorContrast.length;
    this.metrics.touchTargetViolations = audit.touchTargets.length;
    this.metrics.keyboardViolations = audit.violations.filter(v => 
      v.id.includes('keyboard') || v.id.includes('focus')
    ).length;
    this.metrics.ariaViolations = audit.violations.filter(v => 
      v.id.includes('aria')
    ).length;
    this.metrics.lastAuditTime = audit.timestamp;
    this.metrics.complianceScore = audit.summary.complianceScore;
    this.metrics.wcagLevel = audit.summary.wcagLevel;
  }

  /**
   * Report results to console
   */
  reportToConsole(audit, duration) {
    console.group('🔍 Accessibility Audit Results');
    console.log(`⏱️ Audit Duration: ${duration.toFixed(2)}ms`);
    console.log(`📊 Compliance Score: ${audit.summary.complianceScore}/100`);
    console.log(`🎯 WCAG Level: ${audit.summary.wcagLevel}`);
    
    if (audit.summary.totalViolations > 0) {
      console.warn(`⚠️ Total Violations: ${audit.summary.totalViolations}`);
      console.table(audit.violations.map(v => ({
        Rule: v.id,
        Impact: v.impact,
        Elements: v.nodes.length,
        Description: v.description
      })));
    } else {
      console.log('✅ No accessibility violations found!');
    }

    if (audit.colorContrast.length > 0) {
      console.warn(`🎨 Color Contrast Issues: ${audit.colorContrast.length}`);
    }

    if (audit.touchTargets.length > 0) {
      console.warn(`👆 Touch Target Issues: ${audit.touchTargets.length}`);
    }

    console.groupEnd();
  }

  /**
   * Store audit results in localStorage
   */
  storeAuditResults(audit) {
    try {
      const results = {
        timestamp: audit.timestamp,
        summary: audit.summary,
        violationCount: audit.violations.length,
        complianceScore: audit.summary.complianceScore
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(results));
    } catch (error) {
      console.warn('Failed to store audit results:', error);
    }
  }

  /**
   * Dispatch custom event with audit results
   */
  dispatchAuditEvent(audit) {
    const event = new CustomEvent('accessibilityAudit', {
      detail: {
        audit,
        metrics: this.metrics
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Get last audit results
   */
  getLastAudit() {
    return this.lastAudit;
  }

  /**
   * Manual audit trigger
   */
  async audit() {
    return await this.performFullAudit();
  }

  /**
   * Generate accessibility report
   */
  generateReport() {
    if (!this.lastAudit) {
      return null;
    }

    return {
      metadata: {
        timestamp: this.lastAudit.timestamp,
        url: this.lastAudit.url,
        userAgent: this.lastAudit.userAgent
      },
      summary: this.lastAudit.summary,
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      violations: this.lastAudit.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        elementCount: v.nodes.length
      }))
    };
  }

  /**
   * Generate accessibility recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.contrastViolations > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Color Contrast',
        issue: 'Color contrast ratios below WCAG AA standards',
        solution: 'Increase contrast ratios to at least 4.5:1 for normal text and 3:1 for large text',
        automated: false
      });
    }

    if (this.metrics.touchTargetViolations > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Touch Targets',
        issue: 'Touch targets smaller than 44px minimum',
        solution: 'Increase touch target sizes to at least 44x44 pixels',
        automated: true
      });
    }

    if (this.metrics.keyboardViolations > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Keyboard Navigation',
        issue: 'Elements not accessible via keyboard',
        solution: 'Ensure all interactive elements are focusable and usable with keyboard',
        automated: false
      });
    }

    if (this.metrics.ariaViolations > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'ARIA',
        issue: 'Invalid or missing ARIA attributes',
        solution: 'Fix ARIA attribute usage and add missing labels',
        automated: false
      });
    }

    return recommendations;
  }
}

// Create default instance
export const accessibilityMonitor = new AccessibilityMonitorAgent();

export default AccessibilityMonitorAgent;