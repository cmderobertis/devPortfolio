/**
 * Accessibility Monitoring Hook
 * Phase 2: Integration with Performance Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { touchOptimization, preferences } from '../utils/accessibility';

// Color contrast analysis utility
const analyzeColorContrast = (element) => {
  if (!element) return null;
  
  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  
  // Basic luminance calculation for WCAG contrast checking
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  try {
    if (color.startsWith('rgb') && backgroundColor.startsWith('rgb')) {
      const textLuminance = getLuminance(color);
      const bgLuminance = getLuminance(backgroundColor);
      const contrast = (Math.max(textLuminance, bgLuminance) + 0.05) / 
                      (Math.min(textLuminance, bgLuminance) + 0.05);
      
      return {
        ratio: contrast,
        passes: {
          AA: contrast >= 4.5,
          AAA: contrast >= 7,
          AALarge: contrast >= 3
        }
      };
    }
  } catch (error) {
    console.warn('Error analyzing contrast:', error);
  }
  
  return null;
};

// ARIA validation utility
const validateAriaLabels = (container = document.body) => {
  const issues = [];
  
  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label') && img.getAttribute('role') !== 'presentation') {
      issues.push({
        type: 'missing-alt',
        element: img,
        severity: 'error',
        message: 'Image missing alternative text'
      });
    }
  });
  
  // Check for buttons without accessible names
  const buttons = container.querySelectorAll('button, [role="button"]');
  buttons.forEach(btn => {
    const hasText = btn.textContent.trim().length > 0;
    const hasLabel = btn.getAttribute('aria-label');
    const hasLabelledBy = btn.getAttribute('aria-labelledby');
    
    if (!hasText && !hasLabel && !hasLabelledBy) {
      issues.push({
        type: 'missing-button-name',
        element: btn,
        severity: 'error',
        message: 'Button missing accessible name'
      });
    }
  });
  
  // Check for form controls without labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel = container.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && input.type !== 'hidden') {
      issues.push({
        type: 'missing-form-label',
        element: input,
        severity: 'error',
        message: 'Form control missing label'
      });
    }
  });
  
  // Check for proper heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach(heading => {
    const currentLevel = parseInt(heading.tagName[1]);
    if (currentLevel > lastLevel + 1) {
      issues.push({
        type: 'heading-hierarchy',
        element: heading,
        severity: 'warning',
        message: `Heading level skipped (from h${lastLevel} to h${currentLevel})`
      });
    }
    lastLevel = currentLevel;
  });
  
  return issues;
};

// Keyboard navigation testing
const testKeyboardNavigation = (container = document.body) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details summary'
  );
  
  const issues = [];
  
  focusableElements.forEach(element => {
    // Check if element is focusable
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      issues.push({
        type: 'hidden-focusable',
        element,
        severity: 'warning',
        message: 'Focusable element is hidden'
      });
    }
    
    // Check for focus indicators
    const computedStyle = window.getComputedStyle(element, ':focus');
    const outline = computedStyle.outline;
    const outlineWidth = computedStyle.outlineWidth;
    
    if (outline === 'none' || outlineWidth === '0px') {
      issues.push({
        type: 'missing-focus-indicator',
        element,
        severity: 'error',
        message: 'Element lacks visible focus indicator'
      });
    }
  });
  
  return {
    totalFocusable: focusableElements.length,
    issues
  };
};

// Main accessibility monitoring hook
export function useAccessibilityMonitoring(options = {}) {
  const {
    enableLiveReporting = false,
    checkInterval = 30000, // 30 seconds
    includeTouchTargets = true,
    includeColorContrast = true,
    includeKeyboardNav = true
  } = options;
  
  const [accessibilityReport, setAccessibilityReport] = useState({
    score: 100,
    issues: [],
    touchTargets: { total: 0, violations: 0 },
    contrastIssues: [],
    keyboardNavigation: { totalFocusable: 0, issues: [] },
    userPreferences: {},
    lastUpdated: null
  });
  
  const runAccessibilityAudit = useCallback((container = document.body) => {
    const startTime = performance.now();
    const report = {
      issues: [],
      touchTargets: { total: 0, violations: 0 },
      contrastIssues: [],
      keyboardNavigation: { totalFocusable: 0, issues: [] },
      userPreferences: {
        reducedMotion: preferences.checkReducedMotion(),
        highContrast: preferences.checkHighContrast(),
        colorScheme: preferences.checkColorScheme()
      },
      lastUpdated: new Date().toISOString()
    };
    
    // ARIA validation
    const ariaIssues = validateAriaLabels(container);
    report.issues = [...report.issues, ...ariaIssues];
    
    // Touch target validation
    if (includeTouchTargets) {
      const touchIssues = touchOptimization.validateTouchTargets(container);
      report.touchTargets = {
        total: container.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]').length,
        violations: touchIssues.length
      };
      
      touchIssues.forEach(issue => {
        report.issues.push({
          type: 'small-touch-target',
          element: issue.element,
          severity: 'warning',
          message: issue.recommendation,
          size: issue.size
        });
      });
    }
    
    // Color contrast analysis
    if (includeColorContrast) {
      const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
      textElements.forEach(element => {
        if (element.textContent.trim()) {
          const contrast = analyzeColorContrast(element);
          if (contrast && !contrast.passes.AA) {
            report.contrastIssues.push({
              element,
              contrast: contrast.ratio,
              passes: contrast.passes
            });
            
            report.issues.push({
              type: 'low-contrast',
              element,
              severity: 'error',
              message: `Low contrast ratio: ${contrast.ratio.toFixed(2)}:1 (minimum 4.5:1 required)`
            });
          }
        }
      });
    }
    
    // Keyboard navigation testing
    if (includeKeyboardNav) {
      report.keyboardNavigation = testKeyboardNavigation(container);
      report.issues = [...report.issues, ...report.keyboardNavigation.issues];
    }
    
    // Calculate accessibility score
    const errorCount = report.issues.filter(i => i.severity === 'error').length;
    const warningCount = report.issues.filter(i => i.severity === 'warning').length;
    
    let score = 100;
    score -= errorCount * 15; // Major deduction for errors
    score -= warningCount * 5;  // Minor deduction for warnings
    score = Math.max(0, score);
    
    report.score = score;
    report.auditTime = performance.now() - startTime;
    
    return report;
  }, [includeTouchTargets, includeColorContrast, includeKeyboardNav]);
  
  // Run periodic audits
  useEffect(() => {
    const runAudit = () => {
      const report = runAccessibilityAudit();
      setAccessibilityReport(report);
      
      if (enableLiveReporting && report.issues.length > 0) {
        console.group('🔍 Accessibility Audit Results');
        console.log(`Score: ${report.score}/100`);
        console.log(`Issues found: ${report.issues.length}`);
        report.issues.forEach(issue => {
          console[issue.severity === 'error' ? 'error' : 'warn'](
            `${issue.type}: ${issue.message}`,
            issue.element
          );
        });
        console.groupEnd();
      }
    };
    
    // Run initial audit
    runAudit();
    
    // Set up periodic audits
    const interval = setInterval(runAudit, checkInterval);
    
    return () => clearInterval(interval);
  }, [runAccessibilityAudit, enableLiveReporting, checkInterval]);
  
  // Manual audit trigger
  const runManualAudit = useCallback((container) => {
    const report = runAccessibilityAudit(container);
    setAccessibilityReport(report);
    return report;
  }, [runAccessibilityAudit]);
  
  // Get accessibility recommendations
  const getRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (accessibilityReport.score < 80) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        message: 'Multiple accessibility issues detected. Review and fix critical errors first.'
      });
    }
    
    if (accessibilityReport.touchTargets.violations > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'mobile',
        message: `${accessibilityReport.touchTargets.violations} touch targets are too small (minimum 44x44px required)`
      });
    }
    
    if (accessibilityReport.contrastIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'visual',
        message: `${accessibilityReport.contrastIssues.length} elements have insufficient color contrast`
      });
    }
    
    const keyboardIssues = accessibilityReport.keyboardNavigation.issues;
    if (keyboardIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'keyboard',
        message: `${keyboardIssues.length} keyboard navigation issues found`
      });
    }
    
    return recommendations;
  }, [accessibilityReport]);
  
  return {
    report: accessibilityReport,
    runManualAudit,
    recommendations: getRecommendations(),
    isAccessible: accessibilityReport.score >= 85,
    hasErrors: accessibilityReport.issues.some(i => i.severity === 'error')
  };
}

export default useAccessibilityMonitoring;