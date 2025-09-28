import { useState } from 'react'
import './App.css'
import { searchActivities, validateSearchCriteria, formatActivity, APIError } from './services/activityService'

function App() {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    ages: '',
    availability: '',
    distance: 10,
    preferences: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])


  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setValidationErrors([])

    // Validate form data
    const errors = validateSearchCriteria(formData)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsLoading(true)
    setLoadingProgress('Preparing your search...')
    setHasSearched(true)
    console.log('🔍 Searching for activities with real API:', formData)

    try {
      // Show progress updates
      setLoadingProgress('Connecting to AI assistant...')

      // Simulate progress updates during the search
      const progressTimer = setTimeout(() => {
        setLoadingProgress('Searching the web for current activities...')
        setTimeout(() => {
          setLoadingProgress('Analyzing results and matching preferences...')
          setTimeout(() => {
            setLoadingProgress('May switch to knowledge-based mode if rate limited...')
          }, 20000)
        }, 15000)
      }, 3000)

      // Call real API
      const response = await searchActivities(formData)

      // Clear the progress timer
      clearTimeout(progressTimer)

      // Format activities for display
      const formattedActivities = response.activities.map(formatActivity)

      setSearchResults(formattedActivities)
      console.log('✅ Successfully received activities:', formattedActivities)

    } catch (apiError) {
      console.error('❌ Search failed:', apiError)

      if (apiError instanceof APIError) {
        setError({
          message: apiError.getUserMessage(),
          technical: apiError.message,
          status: apiError.status,
          details: apiError.details
        })
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          technical: apiError.message,
          status: 500
        })
      }

      // Clear search results on error
      setSearchResults([])
    } finally {
      setIsLoading(false)
      setLoadingProgress('')
    }
  }

  const handleClear = () => {
    setFormData({
      city: '',
      state: '',
      ages: '',
      availability: '',
      distance: 10,
      preferences: ''
    })
    setSearchResults([])
    setHasSearched(false)
    setIsLoading(false)
    setLoadingProgress('')
    setError(null)
    setValidationErrors([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🎯</div>
          <div className="logo-text">
            <h1>Family Activity Finder</h1>
            <p>Discover perfect activities for your family</p>
          </div>
        </div>
        <button className="new-search-btn">New Search</button>
      </header>

      <main className="app-main">
        <div className="form-section">
          <div className="form-container">
            <h2>Find Activities</h2>
            <p className="form-subtitle">Tell us about your family's preferences</p>

            {validationErrors.length > 0 && (
              <div className="validation-errors">
                <h4>Please fix the following:</h4>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form className="activity-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="city">📍 City</label>
                <input
                  type="text"
                  id="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">🗺️ State</label>
                <input
                  type="text"
                  id="state"
                  placeholder="CA or California"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ages">😊 Kid Ages</label>
                <input
                  type="text"
                  id="ages"
                  placeholder="7"
                  value={formData.ages}
                  onChange={(e) => setFormData({...formData, ages: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="availability">🗓️ Date & Time Availability</label>
                <input
                  type="text"
                  id="availability"
                  placeholder="sunday (tomorrow)"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="distance">🚗 Maximum Distance: <span className="distance-value">{formData.distance} miles</span></label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="distance"
                    min="1"
                    max="50"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    className="distance-slider"
                  />
                  <div className="slider-labels">
                    <span>1 mile</span>
                    <span>25 miles</span>
                    <span>50 miles</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferences">💡 Optional Preferences</label>
                <input
                  type="text"
                  id="preferences"
                  placeholder="e.g., indoor activities, educational, budget-friendly"
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="search-btn" disabled={isLoading}>
                  {isLoading ? '🔄 Searching...' : '🔍 Search Activities'}
                </button>
                <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2>Top 5 Recommendations</h2>
            <p className="results-subtitle">Perfect matches for your family</p>
            <div className="sort-indicator">SORTED BY RELEVANCE</div>
          </div>

          <div className="activity-cards">
            {!hasSearched && !isLoading && (
              <div className="search-prompt">
                <div className="search-prompt-content">
                  <h3>🔍 Ready to find activities?</h3>
                  <p>Fill out the form on the left and click "Search Activities" to discover personalized recommendations for your family!</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <h3>Searching for activities...</h3>
                <p>Finding the perfect matches for your family in {formData.city}...</p>
                {loadingProgress && (
                  <div className="loading-progress">
                    <div className="progress-bar">
                      <div className="progress-indicator"></div>
                    </div>
                    <p className="progress-text">🤖 {loadingProgress}</p>
                    <p className="progress-note">This may take 30-45 seconds as we search the web for current information</p>
                  </div>
                )}
              </div>
            )}

            {error && !isLoading && (
              <div className="error-state">
                <div className="error-content">
                  <h3>❌ Search Error</h3>
                  <p>{error.message}</p>
                  <button className="retry-btn" onClick={() => setError(null)}>
                    Try Again
                  </button>
                  {error.technical && (
                    <details className="error-details">
                      <summary>Technical Details</summary>
                      <p>Status: {error.status}</p>
                      <p>Error: {error.technical}</p>
                    </details>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && searchResults.length > 0 && searchResults.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="card-number">#{index + 1}</div>
                <div className="card-content">
                  <h3>{activity.emoji} {activity.title}</h3>
                  <div className="activity-description">
                    {activity.description}
                  </div>
                  <div className="activity-location">
                    📍 {activity.location} 🚗 {activity.distance}
                  </div>
                  {activity.currentInfo && (
                    <div className="activity-current-info">
                      ℹ️ {activity.currentInfo}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
