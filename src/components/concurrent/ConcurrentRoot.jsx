/**
 * Concurrent Root Component - React 18 Concurrent Features
 * Features: useTransition, useDeferredValue, concurrent rendering optimizations
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useTransition, 
  useDeferredValue, 
  startTransition,
  useMemo,
  useCallback,
  useEffect
} from 'react'
import { useAppStore, useAppActions, usePerformanceActions } from '../../store'

// Concurrent features context
const ConcurrentContext = createContext({
  isPending: false,
  startTransition: () => {},
  deferredValue: null,
  setDeferredValue: () => {},
  priority: 'normal'
})

export const useConcurrent = () => {
  const context = useContext(ConcurrentContext)
  if (!context) {
    throw new Error('useConcurrent must be used within ConcurrentRoot')
  }
  return context
}

// Concurrent Root Provider
export const ConcurrentRoot = ({ children }) => {
  // React 18 concurrent hooks
  const [isPending, startTransitionInternal] = useTransition()
  const [value, setValue] = useState(null)
  const deferredValue = useDeferredValue(value)
  
  // Store integration
  const { updateConcurrentMetrics } = usePerformanceActions()
  const { addNotification } = useAppActions()
  
  // Priority state for different types of updates
  const [priority, setPriority] = useState('normal') // normal, high, low
  
  // Enhanced transition wrapper with metrics
  const startTransition = useCallback((callback, transitionPriority = 'normal') => {
    const startTime = performance.now()
    
    startTransitionInternal(() => {
      setPriority(transitionPriority)
      
      try {
        callback()
      } catch (error) {
        console.error('Transition error:', error)
        addNotification({
          type: 'error',
          title: 'Transition Error',
          message: error.message,
          duration: 5000
        })
      } finally {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // Update concurrent metrics
        updateConcurrentMetrics({
          transitionsActive: isPending ? 1 : 0,
          lastTransitionDuration: duration
        })
        
        // Reset priority after transition
        setTimeout(() => setPriority('normal'), 0)
      }
    })
  }, [startTransitionInternal, isPending, updateConcurrentMetrics, addNotification])
  
  // Deferred value setter
  const setDeferredValue = useCallback((newValue) => {
    setValue(newValue)
  }, [])\n  \n  // Performance monitoring for concurrent features\n  useEffect(() => {\n    if (isPending) {\n      const timeoutId = setTimeout(() => {\n        addNotification({\n          type: 'warning',\n          title: 'Slow Transition',\n          message: 'A transition is taking longer than expected',\n          duration: 3000\n        })\n      }, 5000) // Alert if transition takes more than 5 seconds\n      \n      return () => clearTimeout(timeoutId)\n    }\n  }, [isPending, addNotification])\n  \n  // Context value with memoization\n  const contextValue = useMemo(() => ({\n    isPending,\n    startTransition,\n    deferredValue,\n    setDeferredValue,\n    priority\n  }), [isPending, startTransition, deferredValue, setDeferredValue, priority])\n  \n  // Add loading indicator class to body during transitions\n  useEffect(() => {\n    if (isPending) {\n      document.body.classList.add('concurrent-pending')\n    } else {\n      document.body.classList.remove('concurrent-pending')\n    }\n    \n    return () => {\n      document.body.classList.remove('concurrent-pending')\n    }\n  }, [isPending])\n  \n  return (\n    <ConcurrentContext.Provider value={contextValue}>\n      {/* Global transition indicator */}\n      {isPending && (\n        <div \n          className=\"concurrent-transition-indicator\"\n          role=\"status\"\n          aria-live=\"polite\"\n          aria-label={`Updating content with ${priority} priority`}\n        >\n          <div className=\"transition-progress-bar\" />\n        </div>\n      )}\n      \n      {children}\n    </ConcurrentContext.Provider>\n  )\n}\n\n// Higher-order component for concurrent-safe components\nexport const withConcurrentSafety = (WrappedComponent) => {\n  const ConcurrentSafeComponent = (props) => {\n    const { isPending, startTransition } = useConcurrent()\n    \n    // Wrap state updates in transitions\n    const safeSetState = useCallback((updater) => {\n      startTransition(() => {\n        if (typeof updater === 'function') {\n          updater()\n        }\n      })\n    }, [startTransition])\n    \n    return (\n      <WrappedComponent \n        {...props} \n        isPending={isPending}\n        startTransition={startTransition}\n        safeSetState={safeSetState}\n      />\n    )\n  }\n  \n  ConcurrentSafeComponent.displayName = `withConcurrentSafety(${WrappedComponent.displayName || WrappedComponent.name})`\n  \n  return ConcurrentSafeComponent\n}\n\n// Hook for managing concurrent state updates\nexport const useConcurrentState = (initialState) => {\n  const [state, setState] = useState(initialState)\n  const { startTransition } = useConcurrent()\n  \n  const setConcurrentState = useCallback((newState) => {\n    startTransition(() => {\n      setState(newState)\n    })\n  }, [startTransition])\n  \n  return [state, setConcurrentState]\n}\n\n// Hook for deferred values with automatic updates\nexport const useDeferredState = (initialValue, delay = 300) => {\n  const [value, setValue] = useState(initialValue)\n  const deferredValue = useDeferredValue(value)\n  \n  const setDeferredState = useCallback((newValue) => {\n    // Immediate update for urgent changes\n    if (typeof newValue === 'object' && newValue.urgent) {\n      setValue(newValue.value)\n    } else {\n      // Deferred update for non-urgent changes\n      setTimeout(() => setValue(newValue), delay)\n    }\n  }, [delay])\n  \n  return [deferredValue, setDeferredState, value !== deferredValue]\n}\n\n// Suspense-safe data fetcher hook\nexport const useConcurrentData = (fetchFn, deps = []) => {\n  const [data, setData] = useState(null)\n  const [error, setError] = useState(null)\n  const [loading, setLoading] = useState(true)\n  const { startTransition } = useConcurrent()\n  \n  useEffect(() => {\n    let cancelled = false\n    \n    const fetchData = async () => {\n      try {\n        setLoading(true)\n        setError(null)\n        \n        const result = await fetchFn()\n        \n        if (!cancelled) {\n          startTransition(() => {\n            setData(result)\n            setLoading(false)\n          })\n        }\n      } catch (err) {\n        if (!cancelled) {\n          startTransition(() => {\n            setError(err)\n            setLoading(false)\n          })\n        }\n      }\n    }\n    \n    fetchData()\n    \n    return () => {\n      cancelled = true\n    }\n  }, deps) // eslint-disable-line react-hooks/exhaustive-deps\n  \n  return { data, error, loading }\n}"