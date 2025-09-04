// Analytics Dashboard Helpers
// Query builders and data processors for PostHog analytics

export interface LLMMetrics {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  totalCost: number
  errorsByType: Record<string, number>
  requestsByModel: Record<string, number>
  dailyUsage: Array<{
    date: string
    requests: number
    cost: number
  }>
}

export interface ProductMetrics {
  activeUsers: number
  newUsers: number
  retentionRate: number
  featureUsage: Record<string, number>
  conversionFunnel: Array<{
    stage: string
    users: number
    conversionRate: number
  }>
  planetPopularity: Record<string, number>
  signDistribution: Record<string, number>
}

export interface WebMetrics {
  pageViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  bounceRate: number
  topPages: Array<{
    page: string
    views: number
    avgTimeOnPage: number
  }>
  errorRate: number
  performanceMetrics: {
    averageLoadTime: number
    timeToInteraction: number
  }
}

// PostHog Query Builders
export class AnalyticsQueries {
  
  // LLM Analytics Queries
  static getLLMMetrics(dateRange: { start: string; end: string }): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "TrendsQuery",
        "dateRange": dateRange,
        "series": [
          {
            "kind": "EventsNode",
            "event": "llm_api_success",
            "name": "Successful LLM Calls"
          },
          {
            "kind": "EventsNode", 
            "event": "llm_api_error",
            "name": "Failed LLM Calls"
          }
        ],
        "trendsFilter": {
          "display": "ActionsLineGraph"
        }
      }
    })
  }

  static getLLMCostAnalysis(dateRange: { start: string; end: string }): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "TrendsQuery",
        "dateRange": dateRange,
        "series": [
          {
            "kind": "EventsNode",
            "event": "llm_api_success",
            "name": "LLM Cost Analysis",
            "math": "sum",
            "math_property": "estimated_cost_usd"
          }
        ],
        "breakdown": {
          "breakdown_type": "event",
          "breakdown": "model_provider"
        }
      }
    })
  }

  static getResponseTimeAnalysis(): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "TrendsQuery",
        "series": [
          {
            "kind": "EventsNode",
            "event": "llm_api_success",
            "name": "Response Time",
            "math": "avg",
            "math_property": "response_time_ms"
          }
        ],
        "breakdown": {
          "breakdown_type": "event", 
          "breakdown": "model_name"
        }
      }
    })
  }

  // Product Analytics Queries
  static getFeatureUsageFunnel(): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "FunnelsQuery",
        "series": [
          {
            "kind": "EventsNode",
            "event": "$pageview",
            "name": "Landing Page View"
          },
          {
            "kind": "EventsNode",
            "event": "birth_chart_calculated", 
            "name": "Birth Chart Created"
          },
          {
            "kind": "EventsNode",
            "event": "planet_chat_started",
            "name": "Started Chat"
          },
          {
            "kind": "EventsNode",
            "event": "message_sent",
            "name": "Sent Message"
          }
        ]
      }
    })
  }

  static getPlanetPopularity(): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "TrendsQuery",
        "series": [
          {
            "kind": "EventsNode",
            "event": "planet_chat_started",
            "name": "Planet Chat Started"
          }
        ],
        "breakdown": {
          "breakdown_type": "event",
          "breakdown": "planet"
        }
      }
    })
  }

  static getRetentionAnalysis(): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "RetentionQuery",
        "target_entity": {
          "id": "$pageview",
          "name": "Pageview",
          "type": "events"
        },
        "returning_entity": {
          "id": "$pageview", 
          "name": "Pageview",
          "type": "events"
        },
        "retention_type": "retention_first_time"
      }
    })
  }

  // Web Analytics Queries
  static getPagePerformance(): string {
    return JSON.stringify({
      "kind": "InsightVizNode",
      "source": {
        "kind": "TrendsQuery",
        "series": [
          {
            "kind": "EventsNode",
            "event": "page_performance",
            "name": "Page Load Time",
            "math": "avg",
            "math_property": "load_time_ms"
          }
        ],
        "breakdown": {
          "breakdown_type": "event",
          "breakdown": "page_name"
        }
      }
    })
  }

  static getErrorAnalysis(): string {
    return JSON.stringify({
      "kind": "InsightVizNode", 
      "source": {
        "kind": "TrendsQuery",
        "series": [
          {
            "kind": "EventsNode",
            "event": "frontend_error",
            "name": "Frontend Errors"
          },
          {
            "kind": "EventsNode",
            "event": "llm_api_error", 
            "name": "API Errors"
          }
        ],
        "breakdown": {
          "breakdown_type": "event",
          "breakdown": "error_type"
        }
      }
    })
  }
}

// Data Processing Utilities
export class AnalyticsProcessor {
  
  static calculateSuccessRate(successful: number, failed: number): number {
    const total = successful + failed
    return total > 0 ? (successful / total) * 100 : 0
  }

  static calculateCostPerRequest(totalCost: number, totalRequests: number): number {
    return totalRequests > 0 ? totalCost / totalRequests : 0
  }

  static calculateCostPerToken(totalCost: number, totalTokens: number): number {
    return totalTokens > 0 ? totalCost / totalTokens : 0
  }

  static groupByTimeInterval(
    data: Array<{timestamp: string; value: number}>, 
    interval: 'hour' | 'day' | 'week'
  ): Array<{period: string; total: number; average: number}> {
    const grouped: Record<string, number[]> = {}
    
    data.forEach(item => {
      const date = new Date(item.timestamp)
      let key: string
      
      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
          break
        case 'day':
          key = date.toISOString().slice(0, 10) // YYYY-MM-DD
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().slice(0, 10)
          break
        default:
          key = date.toISOString().slice(0, 10)
      }
      
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item.value)
    })

    return Object.entries(grouped).map(([period, values]) => ({
      period,
      total: values.reduce((sum, val) => sum + val, 0),
      average: values.reduce((sum, val) => sum + val, 0) / values.length
    })).sort((a, b) => a.period.localeCompare(b.period))
  }

  static calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  static identifyOutliers(values: number[]): {outliers: number[]; threshold: number} {
    const sorted = values.sort((a, b) => a - b)
    const q1 = this.calculatePercentile(sorted, 25)
    const q3 = this.calculatePercentile(sorted, 75)
    const iqr = q3 - q1
    const threshold = q3 + (1.5 * iqr)
    
    const outliers = values.filter(val => val > threshold)
    
    return { outliers, threshold }
  }
}

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  defaultDateRange: {
    start: '-7d', // Last 7 days
    end: 'now'
  },
  alerts: {
    highErrorRate: 5, // Alert if error rate > 5%
    slowResponseTime: 5000, // Alert if avg response time > 5s
    highDailyCost: 10, // Alert if daily cost > $10
    lowSuccessRate: 95 // Alert if success rate < 95%
  },
  costTargets: {
    dailyBudget: 5, // $5 per day
    monthlyBudget: 150, // $150 per month
    costPerUser: 0.10 // $0.10 per user per day
  }
}

// Real-time Dashboard Helpers
export class RealTimeAnalytics {
  
  static async getCurrentMetrics(): Promise<{
    activeUsers: number
    requestsPerMinute: number
    currentErrorRate: number
    avgResponseTime: number
  }> {
    // This would integrate with PostHog's real-time API
    // For now, return mock data structure
    return {
      activeUsers: 0,
      requestsPerMinute: 0, 
      currentErrorRate: 0,
      avgResponseTime: 0
    }
  }

  static generateAlert(metric: string, value: number, threshold: number): {
    type: 'warning' | 'critical'
    message: string
    timestamp: string
  } {
    const type = value > threshold * 1.5 ? 'critical' : 'warning'
    return {
      type,
      message: `${metric} is ${value}, exceeding threshold of ${threshold}`,
      timestamp: new Date().toISOString()
    }
  }
}