/**
 * Base Agent Class for Hive-Mind Monitoring System
 * Provides common functionality and interface for all monitoring agents
 */

export class BaseAgent {
  constructor(config = {}) {
    this.agentId = config.agentId;
    this.name = config.name;
    this.type = config.type;
    this.cognitivePattern = config.cognitivePattern;
    this.priorityLevel = config.priorityLevel || 'medium';
    this.capabilities = config.capabilities || [];
    this.responsibilities = config.responsibilities || [];
    
    // Agent state
    this.status = 'initializing';
    this.lastActivity = Date.now();
    this.metrics = new Map();
    this.alerts = [];
    this.recommendations = [];
    
    // Communication
    this.messageQueue = [];
    this.coordinatorConnection = null;
    this.peerConnections = new Map();
    
    // Configuration
    this.config = {
      reportingFrequency: config.reportingFrequency || 60000, // 1 minute default
      alertThresholds: config.alertThresholds || {},
      ...config
    };
  }

  /**
   * Initialize the agent and establish connections
   */
  async initialize() {
    this.status = 'initializing';
    
    try {
      // Establish coordinator connection
      await this.connectToCoordinator();
      
      // Set up monitoring targets
      await this.setupMonitoring();
      
      // Start periodic tasks
      this.startPeriodicTasks();
      
      this.status = 'active';
      this.log('Agent initialized successfully');
      
      // Send initial status to coordinator
      await this.sendStatusUpdate();
      
    } catch (error) {
      this.status = 'error';
      this.handleError('Initialization failed', error);
    }
  }

  /**
   * Connect to the coordinator agent
   */
  async connectToCoordinator() {
    // This will be implemented with the coordination system
    this.log('Connecting to coordinator...');
    // For now, simulate successful connection
    this.coordinatorConnection = { connected: true };
  }

  /**
   * Set up agent-specific monitoring targets and configurations
   * Override in subclasses
   */
  async setupMonitoring() {
    // Base implementation - override in subclasses
    this.log('Setting up base monitoring...');
  }

  /**
   * Start periodic tasks like reporting and health checks
   */
  startPeriodicTasks() {
    // Status reporting interval
    setInterval(() => {
      this.sendStatusUpdate();
    }, this.config.reportingFrequency);

    // Metrics collection interval  
    setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsCollectionInterval || 30000);

    // Health check interval
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval || 120000);
  }

  /**
   * Collect agent-specific metrics
   * Override in subclasses
   */
  async collectMetrics() {
    // Base implementation
    this.metrics.set('lastActivity', this.lastActivity);
    this.metrics.set('status', this.status);
    this.metrics.set('messageQueueLength', this.messageQueue.length);
    this.metrics.set('alertCount', this.alerts.length);
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    if (timeSinceLastActivity > 300000) { // 5 minutes
      this.generateAlert('health_check_failed', {
        message: 'Agent has been inactive for too long',
        timeSinceLastActivity,
        severity: 'warning'
      });
    }
    
    this.lastActivity = now;
  }

  /**
   * Generate an alert
   */
  generateAlert(type, data) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      agentId: this.agentId,
      agentName: this.name,
      timestamp: Date.now(),
      severity: data.severity || 'info',
      message: data.message,
      data: data
    };

    this.alerts.push(alert);
    
    // Send to coordinator if critical
    if (alert.severity === 'critical' || alert.severity === 'emergency') {
      this.sendAlertToCoordinator(alert);
    }

    this.log(`Alert generated: ${type} - ${data.message}`);
    return alert;
  }

  /**
   * Send alert to coordinator
   */
  async sendAlertToCoordinator(alert) {
    if (this.coordinatorConnection) {
      // Implementation will be added with coordination system
      this.log(`Sending alert to coordinator: ${alert.type}`);
    }
  }

  /**
   * Generate recommendation
   */
  generateRecommendation(type, data) {
    const recommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      agentId: this.agentId,
      agentName: this.name,
      timestamp: Date.now(),
      priority: data.priority || 'medium',
      title: data.title,
      description: data.description,
      actionable: data.actionable || false,
      estimatedImpact: data.estimatedImpact || 'unknown',
      data: data
    };

    this.recommendations.push(recommendation);
    this.log(`Recommendation generated: ${type} - ${data.title}`);
    return recommendation;
  }

  /**
   * Send status update to coordinator
   */
  async sendStatusUpdate() {
    const status = {
      agentId: this.agentId,
      name: this.name,
      status: this.status,
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      alertCount: this.alerts.length,
      recommendationCount: this.recommendations.length
    };

    // Send to coordinator (implementation pending)
    this.log('Status update sent');
    return status;
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message) {
    this.messageQueue.push(message);
    this.lastActivity = Date.now();
    
    switch (message.type) {
      case 'coordination_request':
        this.handleCoordinationRequest(message);
        break;
      case 'alert':
        this.handlePeerAlert(message);
        break;
      case 'recommendation':
        this.handlePeerRecommendation(message);
        break;
      default:
        this.log(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle coordination request from coordinator
   */
  handleCoordinationRequest(message) {
    // Override in subclasses for specific coordination logic
    this.log(`Coordination request received: ${message.data.action}`);
  }

  /**
   * Handle alert from peer agent
   */
  handlePeerAlert(alert) {
    this.log(`Peer alert received: ${alert.type} from ${alert.agentId}`);
  }

  /**
   * Handle recommendation from peer agent
   */
  handlePeerRecommendation(recommendation) {
    this.log(`Peer recommendation received: ${recommendation.type} from ${recommendation.agentId}`);
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    return {
      agentInfo: {
        id: this.agentId,
        name: this.name,
        type: this.type,
        status: this.status,
        capabilities: this.capabilities,
        responsibilities: this.responsibilities
      },
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts.slice(-10), // Last 10 alerts
      recommendations: this.recommendations.slice(-10), // Last 10 recommendations
      performance: {
        uptime: Date.now() - this.initializationTime,
        messageQueueLength: this.messageQueue.length,
        lastActivity: this.lastActivity
      },
      timestamp: Date.now()
    };
  }

  /**
   * Shutdown the agent gracefully
   */
  async shutdown() {
    this.status = 'shutting_down';
    this.log('Agent shutting down...');
    
    try {
      // Send final status update
      await this.sendStatusUpdate();
      
      // Clear intervals
      clearInterval(this.statusInterval);
      clearInterval(this.metricsInterval);
      clearInterval(this.healthCheckInterval);
      
      // Close connections
      if (this.coordinatorConnection) {
        // Close coordinator connection
      }
      
      this.status = 'shutdown';
      this.log('Agent shut down successfully');
      
    } catch (error) {
      this.handleError('Shutdown failed', error);
    }
  }

  /**
   * Handle errors
   */
  handleError(context, error) {
    const errorMessage = `${context}: ${error.message}`;
    console.error(`[${this.name}] ${errorMessage}`, error);
    
    this.generateAlert('agent_error', {
      message: errorMessage,
      error: error.stack,
      severity: 'critical'
    });
  }

  /**
   * Logging utility
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.name}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

export default BaseAgent;