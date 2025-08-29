/**
 * useDebounce and useThrottle Hooks - Performance optimization utilities
 * Features: Debouncing, throttling, concurrent-safe updates, cancellation
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useConcurrent } from '../components/concurrent/ConcurrentRoot'

// Debounce hook - delays execution until after specified delay
export const useDebounce = (value, delay, options = {}) => {
  const {
    leading = false,      // Execute immediately on first call
    trailing = true,      // Execute after delay
    maxWait = null,      // Maximum time to wait before forcing execution
    concurrent = true     // Use React 18 concurrent features
  } = options

  const [debouncedValue, setDebouncedValue] = useState(value)
  const timeoutRef = useRef(null)
  const maxWaitTimeoutRef = useRef(null)
  const lastCallTimeRef = useRef(0)
  const lastInvokeTimeRef = useRef(0)
  const leadingInvokedRef = useRef(false)

  // Concurrent features
  const { startTransition } = concurrent ? useConcurrent() : { startTransition: (cb) => cb() }

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current)
      maxWaitTimeoutRef.current = null
    }
  }, [])

  // Update debounced value
  const updateValue = useCallback((newValue) => {
    startTransition(() => {
      setDebouncedValue(newValue)
    })
    lastInvokeTimeRef.current = Date.now()
  }, [startTransition])

  useEffect(() => {
    const now = Date.now()
    lastCallTimeRef.current = now

    // Leading edge execution
    if (leading && !leadingInvokedRef.current) {
      updateValue(value)
      leadingInvokedRef.current = true
    }

    // Clear existing timeouts
    cleanup()

    // Set up trailing execution
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        if (lastCallTimeRef.current + delay <= Date.now()) {
          updateValue(value)
        }
      }, delay)
    }

    // Set up max wait timeout
    if (maxWait && now - lastInvokeTimeRef.current >= maxWait) {
      updateValue(value)
    } else if (maxWait) {
      const remainingWait = maxWait - (now - lastInvokeTimeRef.current)
      maxWaitTimeoutRef.current = setTimeout(() => {
        updateValue(value)
      }, remainingWait)
    }

    // Reset leading flag after delay
    if (leading) {
      const resetLeadingTimeout = setTimeout(() => {
        leadingInvokedRef.current = false
      }, delay)
      
      return () => {
        clearTimeout(resetLeadingTimeout)
        cleanup()
      }
    }

    return cleanup
  }, [value, delay, leading, trailing, maxWait, updateValue, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return debouncedValue
}

// Debounced callback hook
export const useDebouncedCallback = (callback, dependencies, delay, options = {}) => {
  const {
    leading = false,
    trailing = true,
    maxWait = null,
    concurrent = true
  } = options

  const callbackRef = useRef(callback)
  const timeoutRef = useRef(null)
  const maxWaitTimeoutRef = useRef(null)
  const lastCallTimeRef = useRef(0)
  const lastInvokeTimeRef = useRef(0)
  const leadingInvokedRef = useRef(false)
  const argsRef = useRef(null)

  // Concurrent features
  const { startTransition } = concurrent ? useConcurrent() : { startTransition: (cb) => cb() }

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current)
      maxWaitTimeoutRef.current = null
    }
  }, [])

  // Execute callback
  const executeCallback = useCallback((...args) => {
    const execute = () => {
      if (callbackRef.current) {
        callbackRef.current(...args)
      }
      lastInvokeTimeRef.current = Date.now()
    }

    if (concurrent) {
      startTransition(execute)
    } else {
      execute()
    }
  }, [concurrent, startTransition])

  // Debounced function
  const debouncedCallback = useCallback((...args) => {
    const now = Date.now()
    lastCallTimeRef.current = now
    argsRef.current = args

    // Leading edge execution
    if (leading && !leadingInvokedRef.current) {
      executeCallback(...args)
      leadingInvokedRef.current = true
    }

    // Clear existing timeouts
    cleanup()

    // Set up trailing execution
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        if (lastCallTimeRef.current + delay <= Date.now()) {
          executeCallback(...argsRef.current)
        }
      }, delay)
    }

    // Set up max wait timeout
    if (maxWait && now - lastInvokeTimeRef.current >= maxWait) {
      executeCallback(...args)
    } else if (maxWait) {
      const remainingWait = maxWait - (now - lastInvokeTimeRef.current)
      maxWaitTimeoutRef.current = setTimeout(() => {
        executeCallback(...argsRef.current)
      }, remainingWait)
    }

    // Reset leading flag after delay
    if (leading) {
      setTimeout(() => {
        leadingInvokedRef.current = false
      }, delay)
    }
  }, [delay, leading, trailing, maxWait, executeCallback, cleanup])

  // Cancel function
  const cancel = useCallback(() => {
    cleanup()
    leadingInvokedRef.current = false
  }, [cleanup])

  // Flush function - execute immediately
  const flush = useCallback(() => {
    if (argsRef.current) {
      cleanup()
      executeCallback(...argsRef.current)
    }
  }, [cleanup, executeCallback])

  // Cleanup on unmount or dependencies change
  useEffect(() => {
    return cleanup
  }, [cleanup, ...dependencies])

  return useMemo(() => ({
    callback: debouncedCallback,
    cancel,
    flush
  }), [debouncedCallback, cancel, flush])
}

// Throttle hook - limits execution to once per specified interval
export const useThrottle = (value, interval, options = {}) => {
  const {
    leading = true,      // Execute on first call
    trailing = true,     // Execute after interval if there were calls during interval
    concurrent = true    // Use React 18 concurrent features
  } = options

  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecutedRef = useRef(0)
  const timeoutRef = useRef(null)
  const pendingValueRef = useRef(null)

  // Concurrent features
  const { startTransition } = concurrent ? useConcurrent() : { startTransition: (cb) => cb() }

  // Update throttled value
  const updateValue = useCallback((newValue) => {
    startTransition(() => {
      setThrottledValue(newValue)
    })
    lastExecutedRef.current = Date.now()
  }, [startTransition])

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecutedRef.current

    pendingValueRef.current = value

    // Leading execution
    if (leading && timeSinceLastExecution >= interval) {
      updateValue(value)
      return
    }

    // Schedule trailing execution
    if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const remainingTime = interval - timeSinceLastExecution
      timeoutRef.current = setTimeout(() => {
        if (pendingValueRef.current !== throttledValue) {
          updateValue(pendingValueRef.current)
        }
      }, remainingTime)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, interval, leading, trailing, throttledValue, updateValue])

  return throttledValue
}

// Throttled callback hook
export const useThrottledCallback = (callback, dependencies, interval, options = {}) => {
  const {
    leading = true,
    trailing = true,
    concurrent = true
  } = options

  const callbackRef = useRef(callback)
  const lastExecutedRef = useRef(0)
  const timeoutRef = useRef(null)
  const pendingArgsRef = useRef(null)

  // Concurrent features
  const { startTransition } = concurrent ? useConcurrent() : { startTransition: (cb) => cb() }

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Execute callback
  const executeCallback = useCallback((...args) => {
    const execute = () => {
      if (callbackRef.current) {
        callbackRef.current(...args)
      }
      lastExecutedRef.current = Date.now()
    }

    if (concurrent) {
      startTransition(execute)
    } else {
      execute()
    }
  }, [concurrent, startTransition])

  // Throttled function
  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecutedRef.current

    pendingArgsRef.current = args

    // Leading execution
    if (leading && timeSinceLastExecution >= interval) {
      executeCallback(...args)
      return
    }

    // Schedule trailing execution
    if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const remainingTime = interval - timeSinceLastExecution
      timeoutRef.current = setTimeout(() => {
        if (pendingArgsRef.current) {
          executeCallback(...pendingArgsRef.current)
        }
      }, remainingTime)
    }
  }, [interval, leading, trailing, executeCallback])

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingArgsRef.current = null
  }, [])

  // Flush function - execute immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (pendingArgsRef.current) {
      executeCallback(...pendingArgsRef.current)
    }
  }, [executeCallback])

  // Cleanup on unmount or dependencies change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [...dependencies])

  return useMemo(() => ({
    callback: throttledCallback,
    cancel,
    flush
  }), [throttledCallback, cancel, flush])
}

// Combined debounce/throttle hook with smart mode selection
export const useSmartDelay = (value, delay, options = {}) => {
  const {
    mode = 'debounce', // 'debounce', 'throttle', 'smart'
    maxWait = null,
    concurrent = true
  } = options

  // Smart mode: use throttle for rapid changes, debounce for slow changes
  const smartMode = useMemo(() => {
    if (mode !== 'smart') return mode

    // This would typically be based on actual usage patterns
    // For now, we'll use debounce as default for smart mode
    return 'debounce'
  }, [mode])

  const debouncedValue = useDebounce(value, delay, {
    maxWait,
    concurrent,
    trailing: true,
    leading: false
  })

  const throttledValue = useThrottle(value, delay, {
    concurrent,
    leading: true,
    trailing: true
  })

  return smartMode === 'throttle' ? throttledValue : debouncedValue
}