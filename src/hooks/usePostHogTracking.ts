'use client'

import { usePostHog } from 'posthog-js/react'

export function usePostHogTracking() {
  const posthog = usePostHog()

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }

  // ======================
  // LLM ANALYTICS
  // ======================
  
  const trackLLMRequest = (modelProvider: 'openai' | 'anthropic', model: string, chatType: 'individual' | 'group', planet?: string) => {
    trackEvent('llm_request_started', {
      model_provider: modelProvider,
      model_name: model,
      chat_type: chatType,
      planet: planet || null,
      timestamp: new Date().toISOString()
    })
  }

  const trackLLMResponse = (modelProvider: 'openai' | 'anthropic', model: string, responseTime: number, tokenCount?: number, cost?: number, success: boolean = true) => {
    trackEvent('llm_response_completed', {
      model_provider: modelProvider,
      model_name: model,
      response_time_ms: responseTime,
      token_count: tokenCount,
      estimated_cost: cost,
      success,
      timestamp: new Date().toISOString()
    })
  }

  const trackLLMError = (modelProvider: 'openai' | 'anthropic', model: string, errorType: string, errorMessage?: string) => {
    trackEvent('llm_error', {
      model_provider: modelProvider,
      model_name: model,
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString()
    })
  }

  const trackLLMUsage = (dailyRequests: number, totalCost: number) => {
    trackEvent('llm_daily_usage', {
      daily_requests: dailyRequests,
      total_cost: totalCost,
      date: new Date().toISOString().split('T')[0]
    })
  }

  // ======================
  // PRODUCT ANALYTICS
  // ======================

  const trackBirthChartCalculated = (planetData: any) => {
    trackEvent('birth_chart_calculated', {
      planets: Object.keys(planetData),
      planet_count: Object.keys(planetData).length,
      user_type: 'returning_user' // You can make this dynamic
    })
  }

  const trackPlanetChatStarted = (planet: string, sign: string, house?: number, retrograde?: boolean) => {
    trackEvent('planet_chat_started', {
      planet,
      sign,
      house,
      retrograde,
      chat_type: 'individual',
      session_id: posthog?.get_session_id()
    })
  }

  const trackGroupChatStarted = (planetCount: number) => {
    trackEvent('group_chat_started', {
      chat_type: 'group',
      available_planets: planetCount,
      session_id: posthog?.get_session_id()
    })
  }

  const trackMessageSent = (chatType: 'individual' | 'group', messageLength: number, planet?: string) => {
    trackEvent('message_sent', {
      chat_type: chatType,
      planet: planet || null,
      message_length: messageLength,
      session_id: posthog?.get_session_id()
    })
  }

  const trackOnboardingCompleted = (step: string, timeSpent?: number) => {
    trackEvent('onboarding_completed', {
      step,
      time_spent_seconds: timeSpent,
      completion_rate: 100 // You can calculate actual rate
    })
  }

  const trackFeatureUsage = (featureName: string, context?: Record<string, any>) => {
    trackEvent('feature_used', {
      feature_name: featureName,
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  const trackUserRetention = (daysActive: number, sessionsThisWeek: number) => {
    trackEvent('user_retention_check', {
      days_active: daysActive,
      sessions_this_week: sessionsThisWeek,
      user_segment: daysActive > 7 ? 'engaged' : 'new'
    })
  }

  const trackConversion = (conversionType: string, value?: number) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      timestamp: new Date().toISOString()
    })
  }

  // ======================
  // WEB ANALYTICS
  // ======================

  const trackPagePerformance = (pageName: string, loadTime: number, interactionTime?: number) => {
    trackEvent('page_performance', {
      page_name: pageName,
      load_time_ms: loadTime,
      time_to_interaction_ms: interactionTime,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }

  const trackUserBehavior = (action: string, element?: string, context?: Record<string, any>) => {
    trackEvent('user_behavior', {
      action,
      element,
      page_url: window.location.href,
      referrer: document.referrer,
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  const trackError = (errorType: 'javascript' | 'network' | 'ui', errorMessage: string, stack?: string) => {
    trackEvent('frontend_error', {
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stack,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }

  const trackEngagement = (sessionDuration: number, pagesViewed: number, interactions: number) => {
    trackEvent('session_engagement', {
      session_duration_seconds: sessionDuration,
      pages_viewed: pagesViewed,
      total_interactions: interactions,
      engagement_score: (interactions / sessionDuration) * 100,
      timestamp: new Date().toISOString()
    })
  }

  const trackSearch = (query: string, resultsCount: number, selectedResult?: string) => {
    trackEvent('search_performed', {
      search_query: query,
      results_count: resultsCount,
      selected_result: selectedResult,
      timestamp: new Date().toISOString()
    })
  }

  const trackSocialShare = (platform: string, content: string) => {
    trackEvent('content_shared', {
      platform,
      content_type: content,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    })
  }

  // ======================
  // COMBINED ANALYTICS
  // ======================

  const trackChatSession = (sessionData: {
    chatType: 'individual' | 'group'
    duration: number
    messageCount: number
    planetsInvolved: string[]
    llmCalls: number
    errors: number
  }) => {
    trackEvent('chat_session_completed', {
      ...sessionData,
      session_id: posthog?.get_session_id(),
      timestamp: new Date().toISOString()
    })
  }

  return {
    // Base tracking
    trackEvent,
    
    // LLM Analytics
    trackLLMRequest,
    trackLLMResponse,
    trackLLMError,
    trackLLMUsage,
    
    // Product Analytics  
    trackBirthChartCalculated,
    trackPlanetChatStarted,
    trackGroupChatStarted,
    trackMessageSent,
    trackOnboardingCompleted,
    trackFeatureUsage,
    trackUserRetention,
    trackConversion,
    
    // Web Analytics
    trackPagePerformance,
    trackUserBehavior,
    trackError,
    trackEngagement,
    trackSearch,
    trackSocialShare,
    
    // Combined Analytics
    trackChatSession
  }
}