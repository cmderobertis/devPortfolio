/**
 * useAsync Hook - Advanced asynchronous operations management
 * Features: Concurrent-safe data fetching, caching, error handling, retry logic
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useConcurrent } from '../components/concurrent/ConcurrentRoot'
import { useAppActions } from '../store'

export const useAsync = (asyncFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    retryCount = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    concurrent = true
  } = options

  // State management
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [retryAttempt, setRetryAttempt] = useState(0)

  // Refs for cleanup and tracking
  const cancelRef = useRef(null)
  const mountedRef = useRef(true)
  const lastCallRef = useRef(0)

  // Concurrent features
  const { startTransition } = concurrent ? useConcurrent() : { startTransition: (cb) => cb() }
  const { addNotification } = useAppActions()

  // Cache management
  const cache = useRef(new Map())
  
  const getCachedData = useCallback((key) => {
    if (!key) return null
    const cached = cache.current.get(key)
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data
    }
    return null
  }, [cacheDuration])

  const setCachedData = useCallback((key, data) => {
    if (key) {
      cache.current.set(key, {
        data,
        timestamp: Date.now()
      })
    }
  }, [])

  // Main execution function
  const execute = useCallback(async (...args) => {
    const callId = Date.now()
    lastCallRef.current = callId

    // Check cache first
    if (cacheKey) {
      const cachedResult = getCachedData(cacheKey)
      if (cachedResult) {
        startTransition(() => {
          if (mountedRef.current && lastCallRef.current === callId) {
            setData(cachedResult)
            setLoading(false)
            setError(null)
          }
        })
        return cachedResult
      }
    }

    // Cancel previous request if exists
    if (cancelRef.current) {
      cancelRef.current()
    }

    // Create abort controller for cancellation
    const abortController = new AbortController()
    cancelRef.current = () => abortController.abort()

    try {
      startTransition(() => {
        if (mountedRef.current && lastCallRef.current === callId) {
          setLoading(true)
          setError(null)
        }
      })

      // Execute async function with abort signal
      const result = await asyncFunction(...args, abortController.signal)

      // Only update if component is still mounted and this is the latest call
      if (mountedRef.current && lastCallRef.current === callId && !abortController.signal.aborted) {
        startTransition(() => {
          setData(result)
          setLoading(false)
          setRetryAttempt(0)
        })

        // Cache the result
        setCachedData(cacheKey, result)

        // Call success callback
        if (onSuccess) {
          onSuccess(result)
        }

        return result
      }
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return
      }

      if (mountedRef.current && lastCallRef.current === callId) {
        // Retry logic
        if (retryAttempt < retryCount) {
          const nextAttempt = retryAttempt + 1
          const delay = retryDelay * Math.pow(2, nextAttempt - 1) // Exponential backoff

          addNotification({
            type: 'warning',
            title: 'Request Failed',
            message: `Retrying in ${delay / 1000}s (attempt ${nextAttempt}/${retryCount})`,
            duration: 2000
          })

          setTimeout(() => {
            if (mountedRef.current) {
              setRetryAttempt(nextAttempt)
              execute(...args)
            }
          }, delay)

          return
        }

        // Final error state
        startTransition(() => {
          setError(err)
          setLoading(false)
        })

        // Call error callback
        if (onError) {
          onError(err)
        }

        // Add error notification
        addNotification({
          type: 'error',
          title: 'Request Failed',
          message: err.message || 'An unexpected error occurred',
          duration: 5000
        })
      }

      throw err
    } finally {
      cancelRef.current = null
    }
  }, [
    asyncFunction, 
    cacheKey, 
    getCachedData, 
    setCachedData, 
    startTransition, 
    retryAttempt, 
    retryCount, 
    retryDelay, 
    onSuccess, 
    onError, 
    addNotification
  ])

  // Execute on mount or dependency changes
  useEffect(() => {
    if (immediate) {
      execute()
    }
    
    // Cleanup function
    return () => {
      if (cancelRef.current) {
        cancelRef.current()
      }
    }
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (cancelRef.current) {
        cancelRef.current()
      }
    }
  }, [])

  // Manual retry function
  const retry = useCallback(() => {
    setRetryAttempt(0)
    execute()
  }, [execute])

  // Reset function
  const reset = useCallback(() => {
    startTransition(() => {
      setData(null)
      setError(null)
      setLoading(false)
      setRetryAttempt(0)
    })
    
    // Clear cache for this key
    if (cacheKey) {
      cache.current.delete(cacheKey)
    }
  }, [startTransition, cacheKey])

  // Cancel function
  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current()
    }
    startTransition(() => {
      setLoading(false)
    })
  }, [startTransition])

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset,
    cancel,
    retryAttempt,
    // Computed properties
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    isIdle: !loading && !error && data === null
  }
}

// Specialized hooks built on useAsync

// Hook for API calls
export const useApi = (url, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body = null,
    ...asyncOptions
  } = options

  const apiCall = useCallback(async (signal) => {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal
    }

    if (body && method !== 'GET') {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }

    return response.text()
  }, [url, method, headers, body])

  return useAsync(apiCall, [url, method, JSON.stringify(headers), JSON.stringify(body)], {
    cacheKey: `api:${method}:${url}`,
    ...asyncOptions
  })
}

// Hook for GraphQL queries
export const useGraphQL = (query, variables = {}, options = {}) => {
  const { endpoint = '/graphql', ...asyncOptions } = options

  const graphqlCall = useCallback(async (signal) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      }),
      signal
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL Error')
    }

    return result.data
  }, [endpoint, query, variables])

  return useAsync(graphqlCall, [query, JSON.stringify(variables)], {
    cacheKey: `graphql:${query}:${JSON.stringify(variables)}`,
    ...asyncOptions
  })
}

// Hook for paginated data
export const usePagination = (fetchFunction, initialParams = {}, options = {}) => {
  const [allData, setAllData] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [params, setParams] = useState(initialParams)

  const paginatedFetch = useCallback(async (signal) => {
    const result = await fetchFunction(params, signal)
    
    return {
      data: result.data || result,
      hasMore: result.hasMore !== undefined ? result.hasMore : result.data?.length > 0,
      nextParams: result.nextParams || { ...params, page: (params.page || 1) + 1 }
    }
  }, [fetchFunction, params])

  const asyncResult = useAsync(paginatedFetch, [params], options)

  // Update accumulated data
  useEffect(() => {
    if (asyncResult.data) {
      if (params.page === 1 || !params.page) {
        // First page - replace all data
        setAllData(asyncResult.data.data)
      } else {
        // Subsequent pages - append data
        setAllData(prev => [...prev, ...asyncResult.data.data])
      }
      
      setHasMore(asyncResult.data.hasMore)
    }
  }, [asyncResult.data, params.page])

  const loadMore = useCallback(() => {
    if (hasMore && !asyncResult.loading) {
      setParams(prev => ({
        ...prev,
        page: (prev.page || 1) + 1
      }))
    }
  }, [hasMore, asyncResult.loading])

  const refresh = useCallback(() => {
    setAllData([])
    setParams({ ...initialParams, page: 1 })
    setHasMore(true)
  }, [initialParams])

  return {
    ...asyncResult,
    data: allData,
    hasMore,
    loadMore,
    refresh,
    currentPage: params.page || 1
  }
}