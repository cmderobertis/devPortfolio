/**
 * Axe-core setup for development
 * Automatically runs accessibility audits during development
 */

import { accessibilityMonitor } from './AccessibilityMonitorAgent.js';

let isSetup = false;

export const setupAxeForDevelopment = () => {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development' || isSetup) {
    return;
  }

  isSetup = true;

  console.log('🔍 Setting up Accessibility Monitoring for Development');

  // Start accessibility monitoring with development-friendly settings
  accessibilityMonitor.start();

  // Add keyboard shortcut for manual audit (Alt+A)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      console.log('🔍 Running manual accessibility audit...');
      accessibilityMonitor.audit().then(audit => {
        console.log('✅ Manual audit complete');
      });
    }
  });

  // Log accessibility monitoring status
  console.log('ℹ️ Accessibility Monitoring Active:');
  console.log('  • Automated audits running every 30 seconds');
  console.log('  • Press Alt+A for manual audit');
  console.log('  • Check console for audit results');
  
  // Set up audit event listener for custom handling
  document.addEventListener('accessibilityAudit', (event) => {
    const { audit, metrics } = event.detail;
    
    // Store latest metrics globally for debugging
    window.__ACCESSIBILITY_METRICS__ = metrics;
    window.__ACCESSIBILITY_AUDIT__ = audit;
    
    // Optionally show notification for violations
    if (audit.summary.totalViolations > 0) {
      console.group('🚨 Accessibility Issues Detected');
      console.log(`Total Violations: ${audit.summary.totalViolations}`);
      console.log(`Compliance Score: ${audit.summary.complianceScore}/100`);
      console.log('Run window.__ACCESSIBILITY_AUDIT__ to inspect details');
      console.groupEnd();
    }
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    accessibilityMonitor.stop();
  });
};

// Auto-setup in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAxeForDevelopment);
  } else {
    setupAxeForDevelopment();
  }
}