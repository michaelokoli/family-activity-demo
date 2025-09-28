// API service for family activity recommendations

const API_BASE_URL = 'http://localhost:3001/api';

// Configuration for API requests
const defaultRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Search for family activities based on form criteria
 * @param {Object} searchCriteria - Form data including city, ages, availability, distance, preferences
 * @returns {Promise<Object>} Response containing activities and metadata
 */
export async function searchActivities(searchCriteria) {
  try {
    console.log('🔍 Searching for activities with criteria:', searchCriteria);

    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      ...defaultRequestConfig,
      body: JSON.stringify(searchCriteria),
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();

    console.log(`✅ Successfully received ${data.activities?.length || 0} activities`);

    // Validate response structure
    if (!data.activities || !Array.isArray(data.activities)) {
      throw new APIError('Invalid response format: missing activities array', 500, data);
    }

    return {
      success: true,
      activities: data.activities,
      searchCriteria: data.searchCriteria,
      timestamp: data.timestamp,
    };

  } catch (error) {
    console.error('❌ Activity search failed:', error);

    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network and other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(
        'Unable to connect to the activity service. Please check your internet connection.',
        0,
        { originalError: error.message }
      );
    }

    // Generic error fallback
    throw new APIError(
      'An unexpected error occurred while searching for activities.',
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Check API health status
 * @returns {Promise<Object>} Health check response
 */
export async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      ...defaultRequestConfig,
    });

    if (!response.ok) {
      throw new APIError(`Health check failed: ${response.statusText}`, response.status);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error instanceof APIError ? error : new APIError('Health check failed', 500);
  }
}

/**
 * Custom error class for API-related errors
 */
export class APIError extends Error {
  constructor(message, status = 500, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if this is a network error
   */
  isNetworkError() {
    return this.status === 0;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    if (this.isNetworkError()) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }

    if (this.isClientError()) {
      return this.message || 'There was an issue with your request. Please check your input and try again.';
    }

    if (this.isServerError()) {
      return 'Our servers are currently experiencing issues. Please try again in a few moments.';
    }

    return this.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Utility function to validate search criteria before sending to API
 * @param {Object} criteria - Search criteria to validate
 * @returns {Array} Array of validation errors (empty if valid)
 */
export function validateSearchCriteria(criteria) {
  const errors = [];

  if (!criteria.city || typeof criteria.city !== 'string' || criteria.city.trim().length === 0) {
    errors.push('City is required');
  }
  if (!criteria.state || typeof criteria.state !== 'string' || criteria.state.trim().length === 0) {
    errors.push('State is required');
  }

  if (!criteria.ages || typeof criteria.ages !== 'string' || criteria.ages.trim().length === 0) {
    errors.push('Children\'s ages are required');
  }

  if (!criteria.availability || typeof criteria.availability !== 'string' || criteria.availability.trim().length === 0) {
    errors.push('Availability is required');
  }

  if (criteria.distance === undefined || criteria.distance === null || isNaN(criteria.distance)) {
    errors.push('Distance must be a valid number');
  } else {
    const distance = Number(criteria.distance);
    if (distance < 1 || distance > 50) {
      errors.push('Distance must be between 1 and 50 miles');
    }
  }

  return errors;
}

/**
 * Format activity data for display
 * @param {Object} activity - Raw activity data from API
 * @returns {Object} Formatted activity data
 */
export function formatActivity(activity) {
  return {
    ...activity,
    title: activity.title || 'Unknown Activity',
    emoji: activity.emoji || '🎯',
    description: activity.description || 'No description available.',
    location: activity.location || 'Location not specified',
    distance: activity.distance || 'Distance unknown',
    ageAppropriate: activity.ageAppropriate !== false, // Default to true
    currentInfo: activity.currentInfo || null,
  };
}

// Export API configuration for potential use elsewhere
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};