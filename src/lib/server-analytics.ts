import { PostHog } from 'posthog-node'

// Initialize PostHog for server-side tracking
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  }
)

export class ServerAnalytics {
  private static generateUserId(req: Request): string {
    // Generate a user ID from IP + User Agent for anonymous tracking
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    return `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 10)}`
  }

  // ======================
  // LLM API ANALYTICS
  // ======================

  static trackLLMAPICall(
    req: Request,
    {
      modelProvider,
      model,
      chatType,
      planet,
      inputTokens,
      outputTokens,
      responseTime,
      cost,
      success = true,
      errorType,
      errorMessage
    }: {
      modelProvider: 'openai' | 'anthropic'
      model: string
      chatType: 'individual' | 'group'
      planet?: string
      inputTokens?: number
      outputTokens?: number
      responseTime: number
      cost?: number
      success?: boolean
      errorType?: string
      errorMessage?: string
    }
  ) {
    const userId = this.generateUserId(req)
    
    posthog.capture({
      distinctId: userId,
      event: success ? 'llm_api_success' : 'llm_api_error',
      properties: {
        model_provider: modelProvider,
        model_name: model,
        chat_type: chatType,
        planet,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: (inputTokens || 0) + (outputTokens || 0),
        response_time_ms: responseTime,
        estimated_cost_usd: cost,
        success,
        error_type: errorType,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
        // Request metadata
        user_agent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        referer: req.headers.get('referer')
      }
    })
  }

  // ======================
  // API PERFORMANCE TRACKING
  // ======================

  static trackAPIPerformance(
    req: Request,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    requestSize?: number,
    responseSize?: number
  ) {
    const userId = this.generateUserId(req)
    
    posthog.capture({
      distinctId: userId,
      event: 'api_request',
      properties: {
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTime,
        request_size_bytes: requestSize,
        response_size_bytes: responseSize,
        success: statusCode < 400,
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
      }
    })
  }

  // ======================
  // BUSINESS METRICS
  // ======================

  static trackUserAction(
    req: Request,
    action: string,
    properties?: Record<string, any>
  ) {
    const userId = this.generateUserId(req)
    
    posthog.capture({
      distinctId: userId,
      event: `server_${action}`,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
      }
    })
  }

  // ======================
  // COST TRACKING
  // ======================

  static trackDailyCosts(date: string, costs: {
    openai_cost: number
    anthropic_cost: number
    total_requests: number
    total_tokens: number
  }) {
    posthog.capture({
      distinctId: 'system',
      event: 'daily_llm_costs',
      properties: {
        date,
        ...costs,
        cost_per_request: costs.total_requests > 0 ? 
          (costs.openai_cost + costs.anthropic_cost) / costs.total_requests : 0,
        cost_per_token: costs.total_tokens > 0 ? 
          (costs.openai_cost + costs.anthropic_cost) / costs.total_tokens : 0,
        timestamp: new Date().toISOString()
      }
    })
  }

  // ======================
  // SHUTDOWN
  // ======================

  static async shutdown() {
    await posthog.shutdown()
  }
}

// Middleware helper for automatic API tracking
export function withAnalytics<T>(
  handler: (req: Request, ...args: any[]) => Promise<T>,
  endpoint: string
) {
  return async (req: Request, ...args: any[]): Promise<T> => {
    const startTime = Date.now()
    let statusCode = 200
    let error: Error | null = null

    try {
      const result = await handler(req, ...args)
      return result
    } catch (e) {
      error = e as Error
      statusCode = 500
      throw e
    } finally {
      const responseTime = Date.now() - startTime
      
      ServerAnalytics.trackAPIPerformance(
        req,
        endpoint,
        req.method,
        statusCode,
        responseTime
      )

      if (error) {
        ServerAnalytics.trackUserAction(req, 'api_error', {
          endpoint,
          error_message: error.message,
          error_stack: error.stack
        })
      }
    }
  }
}