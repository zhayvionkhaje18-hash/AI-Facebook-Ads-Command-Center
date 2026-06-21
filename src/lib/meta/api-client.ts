/**
 * Meta Marketing API Client
 * Handles batch requests, rate limiting, and error retry logic
 */

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

interface BatchRequest {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  relative_url: string
  body?: string
}

interface BatchResponse {
  code: number
  headers: Array<{ name: string; value: string }>
  body: string
}

export class MetaAPIClient {
  private accessToken: string
  private baseURL = 'https://graph.facebook.com/v18.0'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Make a single API request with automatic retry on rate limits
   */
  async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'DELETE' | 'PUT'
      params?: Record<string, any>
      body?: any
      retry?: RetryOptions
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      params = {},
      body,
      retry = { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
    } = options

    // Build URL with access token and params
    const url = new URL(`${this.baseURL}${endpoint}`)
    url.searchParams.set('access_token', this.accessToken)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })

    let lastError: Error | null = null
    let attempt = 0

    while (attempt <= (retry.maxRetries || 0)) {
      try {
        const response = await fetch(url.toString(), {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json()

        // Handle Meta API errors
        if (data.error) {
          const error = data.error

          // Rate limit - retry with exponential backoff
          if (error.code === 4 || error.code === 17 || error.code === 32) {
            const delay = Math.min(
              retry.baseDelay! * Math.pow(2, attempt),
              retry.maxDelay!
            )
            
            console.warn(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retry.maxRetries! + 1})`)
            
            await this.sleep(delay)
            attempt++
            continue
          }

          // OAuth/Permission errors - don't retry
          if (error.code === 190 || error.code === 102 || error.code === 10) {
            throw new Error(`Auth error: ${error.message}`)
          }

          // Temporary errors - retry
          if (error.code === 1 || error.code === 2) {
            const delay = Math.min(
              retry.baseDelay! * Math.pow(2, attempt),
              retry.maxDelay!
            )
            
            console.warn(`Temporary error. Retrying in ${delay}ms...`)
            await this.sleep(delay)
            attempt++
            continue
          }

          // Other errors - throw
          throw new Error(`Meta API error: ${error.message} (code: ${error.code})`)
        }

        return data as T
      } catch (error) {
        lastError = error as Error
        
        // Network errors - retry
        if (attempt < (retry.maxRetries || 0)) {
          const delay = Math.min(
            retry.baseDelay! * Math.pow(2, attempt),
            retry.maxDelay!
          )
          
          console.warn(`Request failed. Retrying in ${delay}ms...`, error)
          await this.sleep(delay)
          attempt++
          continue
        }
        
        break
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  /**
   * Execute multiple requests in a single batch
   * Up to 50 requests per batch
   */
  async batch<T = any>(requests: BatchRequest[]): Promise<Array<T | Error>> {
    if (requests.length === 0) {
      return []
    }

    if (requests.length > 50) {
      throw new Error('Batch size cannot exceed 50 requests')
    }

    const batchPayload = requests.map(req => ({
      method: req.method,
      relative_url: req.relative_url,
      ...(req.body && { body: req.body })
    }))

    try {
      const response = await this.request<BatchResponse[]>('/', {
        method: 'POST',
        params: {
          batch: JSON.stringify(batchPayload)
        }
      })

      // Parse batch responses
      return response.map((res, index) => {
        try {
          if (res.code >= 200 && res.code < 300) {
            return JSON.parse(res.body) as T
          } else {
            const errorBody = JSON.parse(res.body)
            return new Error(errorBody.error?.message || `Request ${index} failed with code ${res.code}`)
          }
        } catch (e) {
          return new Error(`Failed to parse response for request ${index}`)
        }
      })
    } catch (error) {
      // If batch request itself fails, return errors for all
      return requests.map(() => error as Error)
    }
  }

  /**
   * Execute batches with automatic chunking
   * Splits large request arrays into chunks of 50
   */
  async batchAll<T = any>(requests: BatchRequest[]): Promise<Array<T | Error>> {
    const chunks: BatchRequest[][] = []
    
    for (let i = 0; i < requests.length; i += 50) {
      chunks.push(requests.slice(i, i + 50))
    }

    const results: Array<T | Error> = []

    for (const chunk of chunks) {
      const chunkResults = await this.batch<T>(chunk)
      results.push(...chunkResults)
    }

    return results
  }

  /**
   * Get paginated results automatically
   */
  async *paginate<T = any>(
    endpoint: string,
    params: Record<string, any> = {},
    limit = 100
  ): AsyncGenerator<T[], void, unknown> {
    let nextUrl: string | null = endpoint
    let hasMore = true

    while (hasMore && nextUrl) {
      const response = await this.request<{
        data: T[]
        paging?: { next?: string; cursors?: { after?: string } }
      }>(nextUrl, {
        params: { ...params, limit }
      })

      if (response.data && response.data.length > 0) {
        yield response.data
      }

      // Check for pagination
      if (response.paging?.next) {
        // Extract relative URL from full URL
        const url = new URL(response.paging.next)
        nextUrl = url.pathname + url.search
        nextUrl = nextUrl.replace(/\/v\d+\.\d+/, '') // Remove version from path
      } else {
        hasMore = false
      }
    }
  }

  /**
   * Helper: Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Create a new Meta API client instance
 */
export function createMetaClient(accessToken: string): MetaAPIClient {
  return new MetaAPIClient(accessToken)
}
