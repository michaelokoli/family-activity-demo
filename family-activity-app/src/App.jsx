import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    city: '',
    kidAges: '',
    dateTime: '',
    maxDistance: 10,
    preferences: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  // Generate dynamic dummy data based on search criteria
  const generateDummyResults = (searchData) => {
    const activities = [
      {
        id: 1,
        title: `${searchData.city || 'Local'} Heritage Weekend - ${searchData.dateTime || 'Sunday 10am-4pm'}`,
        emoji: '🚋',
        description: `A special event where families can ride vintage transit vehicles that are rarely seen on ${searchData.city || 'city'} streets, including vintage buses and the Blackpool Boat Tram. All rides on these special streetcars are FREE all weekend.`,
        location: `${searchData.city || 'Local'} Railway Museum`,
        distance: '0.5 miles'
      },
      {
        id: 2,
        title: `${searchData.preferences?.includes('food') || searchData.preferences?.includes('cultural') ? 'International Food Festival' : 'Greek Food Festival'} - ${searchData.dateTime || 'Sunday 11am-8pm'}`,
        emoji: '🇬🇷',
        description: `The annual festival features delicious traditional food like Spanakopita and Moussaka, plus desserts and wine. Visitors can enjoy classic music, watch award-winning folk dance groups perform, and browse unique gifts from local vendors.`,
        location: 'Mission District',
        distance: '1.2 miles'
      },
      {
        id: 3,
        title: `${searchData.preferences?.includes('educational') || searchData.preferences?.includes('indoor') ? 'Interactive Science Museum' : 'Sunday Funnies Exhibit'} - ${searchData.dateTime || 'Sunday 10am-5pm'}`,
        emoji: searchData.preferences?.includes('educational') ? '🔬' : '🎨',
        description: searchData.preferences?.includes('educational') ?
          `Interactive hands-on science experiments designed for kids ages ${searchData.kidAges || '6-12'}. Learn about chemistry, physics, and biology through fun activities like making slime, building simple circuits, and exploring the microscopic world.` :
          `The Cartoon Art Museum's 40th anniversary showcase features classic comic strips from the dawn of the comics medium to the present day, including works from legendary cartoonists like Charles M. Schulz (Peanuts) and contemporary classics.`,
        location: searchData.preferences?.includes('educational') ? 'Exploratorium' : 'Cartoon Art Museum',
        distance: '2 miles'
      },
      {
        id: 4,
        title: `${searchData.preferences?.includes('outdoor') ? 'Park Adventure Day' : 'Lindy in the Park Dance Party'} - ${searchData.dateTime || 'Sunday 11am-2pm'}`,
        emoji: searchData.preferences?.includes('outdoor') ? '🌲' : '🕺',
        description: searchData.preferences?.includes('outdoor') ?
          `A weekly outdoor adventure event featuring hiking trails, nature walks, and family-friendly activities in the great outdoors. Perfect for families looking to explore nature together.` :
          `A weekly free swing dance event near the de Young Museum when the streets of Golden Gate Park are closed to traffic. Get ready to swing in Golden Gate Park every sunny Sunday at this family-friendly dance gathering.`,
        location: 'Golden Gate Park',
        distance: '3 miles'
      },
      {
        id: 5,
        title: `${searchData.preferences?.includes('budget') || searchData.preferences?.includes('free') ? 'Free Community Festival' : 'Premium Family Experience'} - ${searchData.dateTime || 'Sunday 1pm-4pm'}`,
        emoji: searchData.preferences?.includes('budget') ? '🎪' : '🎭',
        description: searchData.preferences?.includes('budget') ?
          `A completely free community festival with live music, food trucks, face painting, and activities for kids of all ages. Local vendors showcase their crafts and the whole community comes together for a fun day.` :
          `A premium family experience featuring guided tours, interactive workshops, and exclusive access to special exhibits. Includes refreshments and take-home activities for the kids.`,
        location: searchData.preferences?.includes('budget') ? 'Community Center' : 'Premium Cultural Center',
        distance: '2.5 miles'
      }
    ]

    return activities
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.city || !formData.kidAges || !formData.dateTime) {
      alert('Please fill in all required fields (City, Kid Ages, and Date & Time)')
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    console.log('Searching for activities:', formData)

    // Simulate API call delay
    setTimeout(() => {
      const results = generateDummyResults(formData)
      setSearchResults(results)
      setIsLoading(false)
    }, 1500) // 1.5 second delay to show loading
  }

  const handleClear = () => {
    setFormData({
      city: '',
      kidAges: '',
      dateTime: '',
      maxDistance: 10,
      preferences: ''
    })
    setSearchResults([])
    setHasSearched(false)
    setIsLoading(false)
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
                <label htmlFor="kidAges">😊 Kid Ages</label>
                <input
                  type="text"
                  id="kidAges"
                  placeholder="7"
                  value={formData.kidAges}
                  onChange={(e) => setFormData({...formData, kidAges: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateTime">🗓️ Date & Time Availability</label>
                <input
                  type="text"
                  id="dateTime"
                  placeholder="sunday (tomorrow)"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="distance">🚗 Maximum Distance: <span className="distance-value">{formData.maxDistance} miles</span></label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="distance"
                    min="1"
                    max="50"
                    value={formData.maxDistance}
                    onChange={(e) => setFormData({...formData, maxDistance: e.target.value})}
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
              </div>
            )}

            {!isLoading && searchResults.length > 0 && searchResults.map((activity, index) => (
              <div key={activity.id} className="activity-card">
                <div className="card-number">#{index + 1}</div>
                <div className="card-content">
                  <h3>{activity.title}</h3>
                  <div className="activity-description">
                    {activity.emoji} {activity.description}
                  </div>
                  <div className="activity-location">
                    📍 {activity.location} 🚗 {activity.distance}
                  </div>
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
