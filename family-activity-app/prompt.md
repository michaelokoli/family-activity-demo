# Activity Search Prompt Template

## Main Prompt Template

Find 5 family-friendly activities in {{city}}, {{state}} for children aged {{ages}}.
Available: {{availability}}.
Maximum distance: {{distance}} miles from city center.{{preferences}}

Please search the web for current, accurate information about activities, events, venues, and their details. Include real locations with current operating hours, contact information, and recent reviews when possible.

Return EXACTLY 5 activities in this JSON format:
{
  "activities": [
    {
      "title": "Activity Name",
      "emoji": "🎯",
      "description": "Detailed description of the activity, what makes it special, and why it's good for the specified age group.",
      "location": "Specific address or venue name",
      "distance": "X.X miles",
      "ageAppropriate": true,
      "currentInfo": "Any current information like hours, prices, or special events"
    }
  ]
}

## Requirements Template

Requirements:
- All activities must be age-appropriate for {{ages}}
- Include diverse activity types (indoor/outdoor, educational/recreational)
- Provide accurate, current information from web search
- Include specific locations with addresses when possible
- Distance should be calculated from {{city}}, {{state}} city center
- Descriptions should be engaging and informative

## Variable Definitions

- `{{city}}`: The target city for activity search
- `{{state}}`: The state (case insensitive, accepts initials like "CA" or full names like "California")
- `{{ages}}`: Age range or specific ages of children
- `{{availability}}`: When the family is available (day/time)
- `{{distance}}`: Maximum distance in miles from city center
- `{{preferences}}`: Optional additional preferences (empty string if none)

## State Handling

The system should accept state input in various formats:
- Two-letter abbreviations (case insensitive): "ca", "CA", "Ca"
- Full state names (case insensitive): "california", "California", "CALIFORNIA"
- Mixed formats should be normalized for display

## Template Processing Rules

1. Variables are enclosed in double curly braces: `{{variable}}`
2. Preferences should include a leading space and "Additional preferences: " prefix when present
3. State should be properly formatted in the location context
4. All variables must be replaced before sending to Claude API
5. Missing required variables should trigger validation errors