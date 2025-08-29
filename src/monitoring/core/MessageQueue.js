/**
 * Message Queue System for Agent Coordination
 * Handles inter-agent communication with priority queuing and delivery guarantees
 */

export class MessageQueue {
  constructor(config = {}) {
    this.queues = new Map(); // agentId -> queue
    this.priorityLevels = ['low', 'medium', 'high', 'critical', 'emergency'];
    this.messageRetention = config.messageRetention || 30 * 24 * 60 * 60 * 1000; // 30 days
    this.deliveryTimeout = config.deliveryTimeout || 30000; // 30 seconds
    this.maxRetries = config.maxRetries || 3;
    
    // Message store for deduplication and history
    this.messageStore = new Map();
    this.deliveryCallbacks = new Map();
    
    // Cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Register an agent with the message queue
   */
  registerAgent(agentId, messageHandler) {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, {
        handler: messageHandler,
        pending: [],
        processing: new Set(),
        stats: {
          sent: 0,
          received: 0,
          failed: 0,
          deduplicated: 0
        }
      });
    }
  }

  /**
   * Unregister an agent from the message queue
   */
  unregisterAgent(agentId) {
    this.queues.delete(agentId);
  }

  /**
   * Send a message to a specific agent
   */
  async sendMessage(toAgentId, message, options = {}) {
    const messageId = this.generateMessageId();
    const fullMessage = {
      id: messageId,
      to: toAgentId,
      from: message.from,
      type: message.type,
      priority: message.priority || 'medium',
      data: message.data,
      timestamp: Date.now(),
      retryCount: 0,
      deduplicationKey: message.deduplicationKey || messageId
    };

    // Check for deduplication
    if (this.isDuplicate(fullMessage)) {
      const queue = this.queues.get(toAgentId);
      if (queue) queue.stats.deduplicated++;
      return { status: 'deduplicated', messageId };
    }

    // Store message for deduplication and history
    this.messageStore.set(messageId, fullMessage);

    // Add to recipient's queue
    const queue = this.queues.get(toAgentId);
    if (!queue) {
      throw new Error(`Agent ${toAgentId} not registered`);
    }

    this.insertByPriority(queue.pending, fullMessage);
    
    // Process queue
    this.processQueue(toAgentId);

    return { status: 'queued', messageId };
  }

  /**
   * Broadcast a message to all registered agents
   */
  async broadcast(message, options = {}) {
    const results = [];
    
    for (const agentId of this.queues.keys()) {
      if (agentId !== message.from) { // Don't send to sender
        try {
          const result = await this.sendMessage(agentId, message, options);
          results.push({ agentId, ...result });
        } catch (error) {
          results.push({ agentId, status: 'error', error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Process messages in an agent's queue
   */
  async processQueue(agentId) {
    const queue = this.queues.get(agentId);
    if (!queue || queue.pending.length === 0) return;

    // Process messages one at a time to maintain order within priority levels
    const message = queue.pending.shift();
    queue.processing.add(message.id);

    try {
      // Set delivery timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Message delivery timeout')), this.deliveryTimeout);
      });

      // Attempt delivery
      const deliveryPromise = queue.handler(message);
      
      await Promise.race([deliveryPromise, timeoutPromise]);
      
      // Message delivered successfully
      queue.processing.delete(message.id);
      queue.stats.sent++;
      
      // Execute delivery callback if exists
      const callback = this.deliveryCallbacks.get(message.id);
      if (callback) {
        callback(null, { status: 'delivered', messageId: message.id });
        this.deliveryCallbacks.delete(message.id);
      }

    } catch (error) {
      queue.processing.delete(message.id);
      
      // Retry logic
      if (message.retryCount < this.maxRetries) {
        message.retryCount++;
        message.lastError = error.message;
        message.nextRetry = Date.now() + (1000 * Math.pow(2, message.retryCount)); // Exponential backoff
        
        // Re-queue for retry
        this.insertByPriority(queue.pending, message);
      } else {
        // Max retries exceeded
        queue.stats.failed++;
        
        const callback = this.deliveryCallbacks.get(message.id);
        if (callback) {
          callback(error, { status: 'failed', messageId: message.id, retryCount: message.retryCount });
          this.deliveryCallbacks.delete(message.id);
        }
      }
    }

    // Continue processing queue if there are more messages
    if (queue.pending.length > 0) {
      setTimeout(() => this.processQueue(agentId), 100);
    }
  }

  /**
   * Insert message into queue by priority
   */
  insertByPriority(queue, message) {
    const priorityIndex = this.priorityLevels.indexOf(message.priority);
    
    // Find insertion point based on priority
    let insertIndex = 0;
    for (let i = 0; i < queue.length; i++) {
      const existingPriorityIndex = this.priorityLevels.indexOf(queue[i].priority);
      if (priorityIndex > existingPriorityIndex) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    queue.splice(insertIndex, 0, message);
  }

  /**
   * Check if message is a duplicate
   */
  isDuplicate(message) {
    const key = `${message.from}_${message.to}_${message.deduplicationKey}`;
    const cutoff = Date.now() - 60000; // 1 minute deduplication window
    
    for (const [id, storedMessage] of this.messageStore.entries()) {
      if (storedMessage.timestamp < cutoff) continue;
      
      const storedKey = `${storedMessage.from}_${storedMessage.to}_${storedMessage.deduplicationKey}`;
      if (key === storedKey) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get queue statistics for an agent
   */
  getQueueStats(agentId) {
    const queue = this.queues.get(agentId);
    if (!queue) return null;

    return {
      pending: queue.pending.length,
      processing: queue.processing.size,
      stats: { ...queue.stats }
    };
  }

  /**
   * Get system-wide statistics
   */
  getSystemStats() {
    const stats = {
      totalAgents: this.queues.size,
      totalPending: 0,
      totalProcessing: 0,
      totalSent: 0,
      totalReceived: 0,
      totalFailed: 0,
      totalDeduplicated: 0,
      messagesInStore: this.messageStore.size
    };

    for (const queue of this.queues.values()) {
      stats.totalPending += queue.pending.length;
      stats.totalProcessing += queue.processing.size;
      stats.totalSent += queue.stats.sent;
      stats.totalReceived += queue.stats.received;
      stats.totalFailed += queue.stats.failed;
      stats.totalDeduplicated += queue.stats.deduplicated;
    }

    return stats;
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Cleanup old messages and failed deliveries
   */
  cleanup() {
    const cutoff = Date.now() - this.messageRetention;
    
    // Clean message store
    for (const [id, message] of this.messageStore.entries()) {
      if (message.timestamp < cutoff) {
        this.messageStore.delete(id);
      }
    }

    // Clean failed delivery callbacks
    for (const [id, _] of this.deliveryCallbacks.entries()) {
      const message = this.messageStore.get(id);
      if (!message || message.timestamp < cutoff) {
        this.deliveryCallbacks.delete(id);
      }
    }

    // Retry pending messages that are ready
    const now = Date.now();
    for (const [agentId, queue] of this.queues.entries()) {
      const readyToRetry = queue.pending.filter(msg => msg.nextRetry && msg.nextRetry <= now);
      if (readyToRetry.length > 0) {
        this.processQueue(agentId);
      }
    }
  }

  /**
   * Shutdown the message queue
   */
  shutdown() {
    clearInterval(this.cleanupInterval);
    this.queues.clear();
    this.messageStore.clear();
    this.deliveryCallbacks.clear();
  }
}

// Global message queue instance
export const messageQueue = new MessageQueue();

export default MessageQueue;