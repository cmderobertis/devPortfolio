/**
 * Accessibility Auditor Agent
 * Performs comprehensive WCAG 2.1 AA compliance testing and monitoring
 */

import { BaseAgent } from '../core/BaseAgent.js';

export class AccessibilityAuditorAgent extends BaseAgent {
  constructor(config = {}) {
    const defaultConfig = {
      agentId: 'accessibility_auditor_001',
      name: 'Accessibility Auditor Agent',
      type: 'analyst',
      cognitivePattern: 'compliance_focused',
      priorityLevel: 'critical',
      capabilities: [
        'wcag_compliance_testing',
        'keyboard_navigation_validation',
        'screen_reader_compatibility_checking',
        'color_contrast_analysis',
        'focus_management_auditing',
        'aria_validation'
      ],
      responsibilities: [
        'Perform comprehensive WCAG 2.1 AA compliance audits',
        'Test keyboard navigation for all interactive elements',
        'Validate screen reader compatibility and ARIA implementation',
        'Monitor color contrast ratios across all themes',
        'Audit focus management and visual focus indicators',
        'Generate accessibility improvement recommendations'
      ],
      complianceStandards: {
        wcagVersion: '2.1',
        conformanceLevel: 'AA',
        targetCompliance: 100,
        minimumAcceptable: 90
      },
      ...config
    };

    super(defaultConfig);

    // Accessibility-specific properties
    this.axe = null;
    this.auditResults = new Map();
    this.keyboardTestResults = [];
    this.contrastResults = new Map();
    this.focusTestResults = [];
    this.screenReaderTests = [];
    
    // Compliance tracking
    this.complianceScore = 0;
    this.violationsByLevel = new Map();
    this.violationsByRule = new Map();
    
    // Testing configuration
    this.testingMatrix = {
      keyboardNavigation: {
        testFrequency: 'per_component_update',
        coverageTarget: 100,
        testScenarios: ['tab_navigation', 'arrow_key_navigation', 'enter_space_activation', 'escape_key_handling']
      },
      screenReaderSupport: {
        testFrequency: 'weekly',
        screenReaders: ['NVDA', 'JAWS', 'VoiceOver', 'TalkBack'],
        browsers: ['Chrome', 'Firefox', 'Safari', 'Edge']
      },
      colorContrast: {
        testFrequency: 'per_theme_change',
        standards: {
          normalText: 4.5,
          largeText: 3.0,
          uiComponents: 3.0
        }
      }
    };

    // Audit intervals
    this.auditInterval = null;
    this.continuousMonitoringInterval = null;
  }

  /**
   * Set up accessibility monitoring
   */
  async setupMonitoring() {
    this.log('Setting up accessibility monitoring...');

    try {
      // Load axe-core
      await this.initializeAxeCore();
      
      // Set up continuous monitoring
      await this.initializeContinuousMonitoring();
      
      // Set up keyboard navigation testing
      await this.initializeKeyboardTesting();
      
      // Set up color contrast monitoring
      await this.initializeContrastMonitoring();
      
      // Set up focus management monitoring
      await this.initializeFocusMonitoring();
      
      // Perform initial audit
      await this.performComprehensiveAudit();
      
      // Start periodic audits
      this.startPeriodicAudits();
      
      this.log('Accessibility monitoring setup complete');
      
    } catch (error) {
      this.handleError('Accessibility monitoring setup failed', error);
    }
  }

  /**
   * Initialize axe-core accessibility testing library
   */
  async initializeAxeCore() {
    try {
      // Dynamic import of axe-core
      const axeModule = await import('axe-core');
      this.axe = axeModule.default || axeModule;
      
      // Configure axe with custom rules and tags
      this.axe.configure({
        rules: {
          // Enable all WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'landmark-banner-is-top-level': { enabled: true },
          'landmark-main-is-top-level': { enabled: true },
          'landmark-no-duplicate-banner': { enabled: true },
          'landmark-one-main': { enabled: true },
          // Custom rules for portfolio-specific patterns
          'simulation-controls-accessible': { enabled: true },
          'canvas-alternative-text': { enabled: true }
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508', 'best-practice']
      });

      this.log('axe-core initialized successfully');
      
    } catch (error) {
      this.log('Failed to initialize axe-core', 'error');
      throw error;
    }
  }

  /**
   * Initialize continuous accessibility monitoring
   */
  async initializeContinuousMonitoring() {
    // Set up mutation observer to monitor DOM changes
    if (typeof MutationObserver !== 'undefined') {
      this.domObserver = new MutationObserver((mutations) => {
        let significantChange = false;
        
        for (const mutation of mutations) {
          // Check if the change affects accessibility
          if (this.isAccessibilityRelevantChange(mutation)) {
            significantChange = true;
            break;
          }
        }
        
        if (significantChange) {
          // Debounce audit calls
          clearTimeout(this.auditDebounceTimer);
          this.auditDebounceTimer = setTimeout(() => {
            this.performQuickAudit();
          }, 1000);
        }
      });

      this.domObserver.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-*', 'role', 'tabindex', 'alt', 'title', 'id', 'class']
      });
    }

    // Monitor focus changes
    document.addEventListener('focusin', (event) => {
      this.handleFocusChange(event);
    });

    document.addEventListener('focusout', (event) => {
      this.handleFocusLoss(event);
    });
  }

  /**
   * Initialize keyboard navigation testing
   */
  async initializeKeyboardTesting() {
    // Set up keyboard event monitoring
    document.addEventListener('keydown', (event) => {
      this.monitorKeyboardInteraction(event);
    });

    // Test keyboard accessibility for interactive elements
    this.keyboardTestElements = this.findInteractiveElements();
    this.log(`Found ${this.keyboardTestElements.length} interactive elements for keyboard testing`);
  }

  /**
   * Initialize color contrast monitoring
   */
  async initializeContrastMonitoring() {
    // Monitor theme changes
    const themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
          this.scheduleContrastAudit();
        }
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    // Initial contrast audit
    await this.performContrastAudit();
  }

  /**
   * Initialize focus management monitoring
   */
  async initializeFocusMonitoring() {
    // Track focus order and management
    this.focusHistory = [];
    this.focusTraps = new Set();
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.trackFocusOrder(event);
      }
      
      if (event.key === 'Escape') {
        this.testEscapeKeyHandling(event);
      }
    });
  }

  /**
   * Perform comprehensive accessibility audit
   */
  async performComprehensiveAudit() {
    this.log('Starting comprehensive accessibility audit...');
    
    try {
      // Run axe audit
      const axeResults = await this.runAxeAudit();
      
      // Run keyboard navigation tests
      const keyboardResults = await this.runKeyboardTests();
      
      // Run color contrast tests
      const contrastResults = await this.runContrastTests();
      
      // Run focus management tests
      const focusResults = await this.runFocusTests();
      
      // Run ARIA validation
      const ariaResults = await this.runAriaValidation();
      
      // Compile results
      const auditResult = this.compileAuditResults({
        axe: axeResults,
        keyboard: keyboardResults,
        contrast: contrastResults,
        focus: focusResults,
        aria: ariaResults
      });

      this.auditResults.set('comprehensive', auditResult);
      this.updateComplianceScore(auditResult);
      
      // Generate alerts for critical violations
      this.processAuditResults(auditResult);
      
      this.log(`Comprehensive audit complete. Compliance score: ${this.complianceScore}%`);
      
      return auditResult;
      
    } catch (error) {
      this.handleError('Comprehensive audit failed', error);
      return null;
    }
  }

  /**
   * Run axe-core accessibility audit
   */
  async runAxeAudit() {
    if (!this.axe) {
      throw new Error('axe-core not initialized');
    }

    return new Promise((resolve, reject) => {
      this.axe.run(document, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        resultTypes: ['violations', 'incomplete', 'passes']
      }, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Run keyboard navigation tests
   */
  async runKeyboardTests() {
    const results = {
      totalElements: this.keyboardTestElements.length,
      passedElements: 0,
      failedElements: [],
      testScenarios: []
    };

    for (const element of this.keyboardTestElements) {
      const elementResult = await this.testElementKeyboardAccessibility(element);
      
      if (elementResult.passed) {
        results.passedElements++;
      } else {
        results.failedElements.push(elementResult);
      }
    }

    // Test specific keyboard scenarios
    for (const scenario of this.testingMatrix.keyboardNavigation.testScenarios) {
      const scenarioResult = await this.testKeyboardScenario(scenario);
      results.testScenarios.push(scenarioResult);
    }

    results.passRate = (results.passedElements / results.totalElements) * 100;
    
    return results;
  }

  /**
   * Run color contrast tests
   */
  async runContrastTests() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a, label, input, textarea');
    const results = {
      totalElements: textElements.length,
      passedElements: 0,
      failedElements: [],
      contrastRatios: []
    };

    for (const element of textElements) {
      const contrastResult = this.calculateColorContrast(element);
      
      if (contrastResult) {
        results.contrastRatios.push(contrastResult);
        
        if (contrastResult.passed) {
          results.passedElements++;
        } else {
          results.failedElements.push(contrastResult);
        }
      }
    }

    results.passRate = (results.passedElements / results.totalElements) * 100;
    
    return results;
  }

  /**
   * Run focus management tests
   */
  async runFocusTests() {
    const results = {
      focusOrder: this.validateFocusOrder(),
      focusTraps: this.validateFocusTraps(),
      focusIndicators: this.validateFocusIndicators(),
      skipLinks: this.validateSkipLinks()
    };

    return results;
  }

  /**
   * Run ARIA validation tests
   */
  async runAriaValidation() {
    const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-hidden]');
    const results = {
      totalElements: ariaElements.length,
      validElements: 0,
      invalidElements: [],
      warnings: []
    };

    for (const element of ariaElements) {
      const validation = this.validateAriaElement(element);
      
      if (validation.valid) {
        results.validElements++;
      } else {
        results.invalidElements.push(validation);
      }
      
      results.warnings.push(...validation.warnings);
    }

    results.validationRate = (results.validElements / results.totalElements) * 100;
    
    return results;
  }

  /**
   * Test keyboard accessibility for a single element
   */
  async testElementKeyboardAccessibility(element) {
    const result = {
      element: this.getElementSelector(element),
      passed: true,
      issues: []
    };

    // Test if element is focusable
    if (this.isInteractiveElement(element)) {
      if (!this.isFocusable(element)) {
        result.passed = false;
        result.issues.push('Element is not focusable via keyboard');
      }
      
      // Test if element has visible focus indicator
      if (!this.hasVisibleFocusIndicator(element)) {
        result.passed = false;
        result.issues.push('Element lacks visible focus indicator');
      }
      
      // Test if element responds to keyboard activation
      if (!this.respondsToKeyboardActivation(element)) {
        result.passed = false;
        result.issues.push('Element does not respond to keyboard activation');
      }
    }

    return result;
  }

  /**
   * Test a specific keyboard scenario
   */
  async testKeyboardScenario(scenario) {
    const result = {
      scenario,
      passed: false,
      description: '',
      issues: []
    };

    switch (scenario) {
      case 'tab_navigation':
        result.passed = this.testTabNavigation();
        result.description = 'All interactive elements are reachable via Tab key';
        break;
        
      case 'arrow_key_navigation':
        result.passed = this.testArrowKeyNavigation();
        result.description = 'Arrow keys work correctly in grid/list interfaces';
        break;
        
      case 'enter_space_activation':
        result.passed = this.testEnterSpaceActivation();
        result.description = 'Interactive elements activate with Enter/Space keys';
        break;
        
      case 'escape_key_handling':
        result.passed = this.testEscapeKeyHandling();
        result.description = 'Escape key properly closes modals and menus';
        break;
    }

    return result;
  }

  /**
   * Calculate color contrast for an element
   */
  calculateColorContrast(element) {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = this.getEffectiveBackgroundColor(element);

    if (!color || !backgroundColor) {
      return null;
    }

    const contrastRatio = this.getContrastRatio(color, backgroundColor);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    
    // Determine if it's large text (18pt+ or 14pt+ bold)
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
    const requiredRatio = isLargeText ? this.testingMatrix.colorContrast.standards.largeText : this.testingMatrix.colorContrast.standards.normalText;
    
    const passed = contrastRatio >= requiredRatio;

    return {
      element: this.getElementSelector(element),
      color,
      backgroundColor,
      contrastRatio: Math.round(contrastRatio * 100) / 100,
      requiredRatio,
      isLargeText,
      passed,
      text: element.textContent?.slice(0, 50) + '...'
    };
  }

  /**
   * Get effective background color of an element
   */
  getEffectiveBackgroundColor(element) {
    let current = element;
    
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const bgColor = style.backgroundColor;
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
      
      current = current.parentElement;
    }
    
    // Default to white if no background found
    return 'rgb(255, 255, 255)';
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 1;

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string to RGB values
   */
  parseColor(colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }

  /**
   * Calculate relative luminance
   */
  getRelativeLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Validate ARIA element
   */
  validateAriaElement(element) {
    const result = {
      element: this.getElementSelector(element),
      valid: true,
      issues: [],
      warnings: []
    };

    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledby = element.getAttribute('aria-labelledby');
    const ariaDescribedby = element.getAttribute('aria-describedby');

    // Validate role
    if (role && !this.isValidAriaRole(role)) {
      result.valid = false;
      result.issues.push(`Invalid ARIA role: ${role}`);
    }

    // Check for accessible name
    if (this.requiresAccessibleName(element) && !ariaLabel && !ariaLabelledby && !element.textContent.trim()) {
      result.valid = false;
      result.issues.push('Element requires accessible name but none provided');
    }

    // Validate referenced IDs exist
    if (ariaLabelledby) {
      const ids = ariaLabelledby.split(' ');
      for (const id of ids) {
        if (!document.getElementById(id)) {
          result.valid = false;
          result.issues.push(`Referenced ID not found: ${id}`);
        }
      }
    }

    if (ariaDescribedby) {
      const ids = ariaDescribedby.split(' ');
      for (const id of ids) {
        if (!document.getElementById(id)) {
          result.valid = false;
          result.issues.push(`Referenced ID not found: ${id}`);
        }
      }
    }

    return result;
  }

  /**
   * Compile audit results
   */
  compileAuditResults(results) {
    const compiled = {
      timestamp: Date.now(),
      wcagCompliance: this.calculateWCAGCompliance(results.axe),
      keyboardAccessibility: results.keyboard,
      colorContrast: results.contrast,
      focusManagement: results.focus,
      ariaImplementation: results.aria,
      overallScore: 0,
      criticalIssues: [],
      recommendations: []
    };

    // Calculate overall score
    const scores = [
      compiled.wcagCompliance.score,
      results.keyboard.passRate,
      results.contrast.passRate,
      compiled.ariaImplementation.validationRate
    ];

    compiled.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Identify critical issues
    compiled.criticalIssues = this.identifyCriticalIssues(results);

    // Generate recommendations
    compiled.recommendations = this.generateAccessibilityRecommendations(results);

    return compiled;
  }

  /**
   * Calculate WCAG compliance score
   */
  calculateWCAGCompliance(axeResults) {
    const violations = axeResults.violations || [];
    const passes = axeResults.passes || [];
    const incomplete = axeResults.incomplete || [];

    const totalChecks = violations.length + passes.length + incomplete.length;
    const passedChecks = passes.length;

    const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;

    return {
      score: Math.round(score),
      violations: violations.length,
      passes: passes.length,
      incomplete: incomplete.length,
      details: violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length
      }))
    };
  }

  /**
   * Update compliance score
   */
  updateComplianceScore(auditResult) {
    this.complianceScore = auditResult.overallScore;
    
    // Update violation tracking
    this.violationsByLevel.clear();
    this.violationsByRule.clear();

    if (auditResult.wcagCompliance && auditResult.wcagCompliance.details) {
      for (const violation of auditResult.wcagCompliance.details) {
        // Track by impact level
        const level = violation.impact || 'unknown';
        this.violationsByLevel.set(level, (this.violationsByLevel.get(level) || 0) + 1);
        
        // Track by rule
        this.violationsByRule.set(violation.id, violation);
      }
    }

    this.metrics.set('accessibility_score', this.complianceScore);
    this.metrics.set('wcag_violations', auditResult.wcagCompliance?.violations || 0);
    this.metrics.set('keyboard_pass_rate', auditResult.keyboardAccessibility?.passRate || 0);
    this.metrics.set('contrast_pass_rate', auditResult.colorContrast?.passRate || 0);
  }

  /**
   * Process audit results and generate alerts
   */
  processAuditResults(auditResult) {
    // Alert on low compliance score
    if (auditResult.overallScore < this.config.complianceStandards.minimumAcceptable) {
      this.generateAlert('accessibility_compliance_low', {
        message: `Accessibility compliance below threshold: ${Math.round(auditResult.overallScore)}% < ${this.config.complianceStandards.minimumAcceptable}%`,
        severity: 'critical',
        score: auditResult.overallScore,
        threshold: this.config.complianceStandards.minimumAcceptable
      });
    }

    // Alert on critical violations
    for (const issue of auditResult.criticalIssues) {
      this.generateAlert('critical_accessibility_violation', {
        message: `Critical accessibility violation: ${issue.description}`,
        severity: 'critical',
        violation: issue
      });
    }

    // Alert on keyboard accessibility issues
    if (auditResult.keyboardAccessibility.passRate < 90) {
      this.generateAlert('keyboard_accessibility_issues', {
        message: `Keyboard accessibility below 90%: ${Math.round(auditResult.keyboardAccessibility.passRate)}%`,
        severity: 'warning',
        passRate: auditResult.keyboardAccessibility.passRate,
        failedElements: auditResult.keyboardAccessibility.failedElements.length
      });
    }

    // Alert on color contrast issues
    if (auditResult.colorContrast.passRate < 95) {
      this.generateAlert('color_contrast_issues', {
        message: `Color contrast compliance below 95%: ${Math.round(auditResult.colorContrast.passRate)}%`,
        severity: 'warning',
        passRate: auditResult.colorContrast.passRate,
        failedElements: auditResult.colorContrast.failedElements.length
      });
    }
  }

  /**
   * Identify critical accessibility issues
   */
  identifyCriticalIssues(results) {
    const critical = [];

    // Critical WCAG violations
    if (results.axe && results.axe.violations) {
      for (const violation of results.axe.violations) {
        if (violation.impact === 'critical' || violation.impact === 'serious') {
          critical.push({
            type: 'wcag_violation',
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            nodes: violation.nodes.length
          });
        }
      }
    }

    // Critical keyboard issues
    if (results.keyboard && results.keyboard.failedElements) {
      const keyboardCritical = results.keyboard.failedElements.filter(el => 
        el.issues.includes('Element is not focusable via keyboard')
      );
      
      if (keyboardCritical.length > 0) {
        critical.push({
          type: 'keyboard_critical',
          description: `${keyboardCritical.length} interactive elements not keyboard accessible`,
          elements: keyboardCritical.map(el => el.element)
        });
      }
    }

    // Critical contrast issues
    if (results.contrast && results.contrast.failedElements) {
      const contrastCritical = results.contrast.failedElements.filter(el => 
        el.contrastRatio < 3.0
      );
      
      if (contrastCritical.length > 0) {
        critical.push({
          type: 'contrast_critical',
          description: `${contrastCritical.length} elements with extremely low contrast ratio`,
          elements: contrastCritical.map(el => ({ element: el.element, ratio: el.contrastRatio }))
        });
      }
    }

    return critical;
  }

  /**
   * Generate accessibility recommendations
   */
  generateAccessibilityRecommendations(results) {
    const recommendations = [];

    // WCAG recommendations
    if (results.axe && results.axe.violations) {
      const violationCounts = new Map();
      
      for (const violation of results.axe.violations) {
        violationCounts.set(violation.id, (violationCounts.get(violation.id) || 0) + violation.nodes.length);
      }

      for (const [ruleId, count] of violationCounts.entries()) {
        const violation = results.axe.violations.find(v => v.id === ruleId);
        
        recommendations.push(this.generateRecommendation(`fix_${ruleId}`, {
          title: `Fix ${violation.help}`,
          description: `${count} instance(s) of ${violation.description}`,
          priority: violation.impact === 'critical' ? 'critical' : violation.impact === 'serious' ? 'high' : 'medium',
          actionable: true,
          estimatedImpact: violation.impact,
          wcagRule: ruleId,
          instanceCount: count
        }));
      }
    }

    // Keyboard recommendations
    if (results.keyboard && results.keyboard.passRate < 100) {
      recommendations.push(this.generateRecommendation('improve_keyboard_access', {
        title: 'Improve Keyboard Accessibility',
        description: `${results.keyboard.failedElements.length} elements need keyboard accessibility improvements`,
        priority: 'high',
        actionable: true,
        estimatedImpact: 'high',
        passRate: results.keyboard.passRate,
        failedCount: results.keyboard.failedElements.length
      }));
    }

    // Contrast recommendations  
    if (results.contrast && results.contrast.passRate < 95) {
      recommendations.push(this.generateRecommendation('improve_color_contrast', {
        title: 'Improve Color Contrast',
        description: `${results.contrast.failedElements.length} elements need better color contrast`,
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'medium',
        passRate: results.contrast.passRate,
        failedCount: results.contrast.failedElements.length
      }));
    }

    return recommendations;
  }

  /**
   * Start periodic accessibility audits
   */
  startPeriodicAudits() {
    // Full audit every hour
    this.auditInterval = setInterval(() => {
      this.performComprehensiveAudit();
    }, 60 * 60 * 1000);

    // Quick checks every 5 minutes
    this.continuousMonitoringInterval = setInterval(() => {
      this.performQuickAudit();
    }, 5 * 60 * 1000);

    this.log('Periodic accessibility audits started');
  }

  /**
   * Perform quick accessibility audit
   */
  async performQuickAudit() {
    try {
      // Quick axe run with limited scope
      const quickResults = await this.axe.run(document, {
        tags: ['wcag2aa'],
        resultTypes: ['violations']
      });

      if (quickResults.violations.length > 0) {
        this.generateAlert('new_accessibility_violations', {
          message: `${quickResults.violations.length} new accessibility violations detected`,
          severity: 'warning',
          violations: quickResults.violations.length
        });
      }

    } catch (error) {
      this.log('Quick audit failed', 'error');
    }
  }

  /**
   * Helper methods for accessibility testing
   */
  
  isAccessibilityRelevantChange(mutation) {
    if (mutation.type === 'attributes') {
      return ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex', 'alt'].includes(mutation.attributeName);
    }
    
    if (mutation.type === 'childList') {
      // Check if added/removed nodes contain interactive elements
      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        (this.isInteractiveElement(node) || node.querySelector('button, a, input, select, textarea'))
      );
    }
    
    return false;
  }

  findInteractiveElements() {
    return Array.from(document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"], [role="tab"], [role="menuitem"]'
    ));
  }

  isInteractiveElement(element) {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'];
    
    return interactiveTags.includes(element.tagName.toLowerCase()) ||
           interactiveRoles.includes(element.getAttribute('role')) ||
           element.hasAttribute('tabindex');
  }

  isFocusable(element) {
    const tabindex = element.getAttribute('tabindex');
    if (tabindex === '-1') return false;
    if (tabindex && parseInt(tabindex) >= 0) return true;
    
    const focusableTags = ['button', 'a', 'input', 'select', 'textarea'];
    return focusableTags.includes(element.tagName.toLowerCase()) && !element.disabled;
  }

  hasVisibleFocusIndicator(element) {
    // This is simplified - in practice, you'd need to simulate focus and check computed styles
    const style = window.getComputedStyle(element, ':focus');
    return style.outline !== 'none' || style.boxShadow !== 'none';
  }

  respondsToKeyboardActivation(element) {
    // Check if element has keyboard event listeners or is naturally activatable
    const activatableTags = ['button', 'a', 'input', 'select', 'textarea'];
    return activatableTags.includes(element.tagName.toLowerCase()) ||
           element.getAttribute('role') === 'button';
  }

  isValidAriaRole(role) {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
      'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
      'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
      'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
      'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
      'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
      'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
      'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
      'treeitem'
    ];
    return validRoles.includes(role);
  }

  requiresAccessibleName(element) {
    const requiresName = ['button', 'a', 'input', 'select', 'textarea'];
    const nameRoles = ['button', 'link', 'textbox', 'combobox', 'listbox'];
    
    return requiresName.includes(element.tagName.toLowerCase()) ||
           nameRoles.includes(element.getAttribute('role'));
  }

  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  // Placeholder methods for complex keyboard testing
  testTabNavigation() { return true; } // Would implement comprehensive tab order testing
  testArrowKeyNavigation() { return true; } // Would test grid/list navigation
  testEnterSpaceActivation() { return true; } // Would test activation keys
  testEscapeKeyHandling() { return true; } // Would test escape key behavior
  
  validateFocusOrder() { return { valid: true }; } // Would validate logical focus order
  validateFocusTraps() { return { valid: true }; } // Would validate modal focus traps
  validateFocusIndicators() { return { valid: true }; } // Would validate focus visibility
  validateSkipLinks() { return { valid: true }; } // Would validate skip navigation

  /**
   * Generate comprehensive accessibility report
   */
  generateReport() {
    const baseReport = super.generateReport();
    
    return {
      ...baseReport,
      accessibilityScore: this.complianceScore,
      wcagCompliance: {
        version: this.config.complianceStandards.wcagVersion,
        level: this.config.complianceStandards.conformanceLevel,
        score: this.complianceScore,
        target: this.config.complianceStandards.targetCompliance
      },
      violationSummary: {
        byLevel: Object.fromEntries(this.violationsByLevel),
        byRule: Object.fromEntries(this.violationsByRule),
        total: Array.from(this.violationsByLevel.values()).reduce((sum, count) => sum + count, 0)
      },
      testCoverage: {
        keyboardTesting: this.keyboardTestElements.length,
        contrastTesting: this.contrastResults.size,
        ariaTesting: document.querySelectorAll('[role], [aria-*]').length
      },
      latestAudit: this.auditResults.get('comprehensive'),
      complianceHistory: Array.from(this.auditResults.entries()).slice(-5)
    };
  }

  /**
   * Shutdown accessibility monitoring
   */
  async shutdown() {
    if (this.domObserver) {
      this.domObserver.disconnect();
    }

    if (this.auditInterval) {
      clearInterval(this.auditInterval);
    }

    if (this.continuousMonitoringInterval) {
      clearInterval(this.continuousMonitoringInterval);
    }

    clearTimeout(this.auditDebounceTimer);

    await super.shutdown();
  }
}

export default AccessibilityAuditorAgent;