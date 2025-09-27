# Claude API Prompt for Family Activity Finder

## Prompt Template

```
You are a family activity expert helping parents find weekend activities. Use your web search capabilities to find current, real activities happening in the specified location.

**Family Details:**
- Location: {city}
- Kids Ages: {ages}
- Available: {availability}
- Maximum Distance: {miles} miles from {city}
- Additional Preferences: {preferences}

**Instructions:**
1. Search the web for current weekend activities, events, and attractions in and around {city}
2. Focus on family-friendly activities appropriate for children ages {ages}
3. Only include activities available during: {availability}
4. Filter results within {miles} miles of {city}
5. Consider these preferences: {preferences}

**Response Format:**
Return exactly 5 recommendations in this format:

**#1 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages {ages}, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

**#2 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages {ages}, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

[Continue for all 5 recommendations]

**Requirements:**
- Each activity must be real and currently available
- Include specific times/dates when possible
- Use relevant emojis (🎨 for art, 🏛️ for museums, 🎪 for entertainment, etc.)
- Vary activity types (indoor/outdoor, educational/recreational, etc.)
- Prioritize activities with good reviews or popularity
- Include accurate venue names and distances
```

## Example API Call

```javascript
const prompt = `You are a family activity expert helping parents find weekend activities. Use your web search capabilities to find current, real activities happening in the specified location.

**Family Details:**
- Location: San Francisco
- Kids Ages: 7
- Available: Sunday afternoon
- Maximum Distance: 10 miles from San Francisco
- Additional Preferences: educational, indoor activities preferred

**Instructions:**
1. Search the web for current weekend activities, events, and attractions in and around San Francisco
2. Focus on family-friendly activities appropriate for children ages 7
3. Only include activities available during: Sunday afternoon
4. Filter results within 10 miles of San Francisco
5. Consider these preferences: educational, indoor activities preferred

**Response Format:**
Return exactly 5 recommendations in this format:

**#1 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages 7, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

**#2 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages 7, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

[Continue for all 5 recommendations]

**Requirements:**
- Each activity must be real and currently available
- Include specific times/dates when possible
- Use relevant emojis (🎨 for art, 🏛️ for museums, 🎪 for entertainment, etc.)
- Vary activity types (indoor/outdoor, educational/recreational, etc.)
- Prioritize activities with good reviews or popularity
- Include accurate venue names and distances`;
```

## Input Field Mapping

```javascript
const generatePrompt = (formData) => {
  const {
    city,
    kidsAges,
    availability,
    maxDistance,
    preferences
  } = formData;

  return `You are a family activity expert helping parents find weekend activities. Use your web search capabilities to find current, real activities happening in the specified location.

**Family Details:**
- Location: ${city}
- Kids Ages: ${kidsAges}
- Available: ${availability}
- Maximum Distance: ${maxDistance} miles from ${city}
- Additional Preferences: ${preferences || 'No specific preferences'}

**Instructions:**
1. Search the web for current weekend activities, events, and attractions in and around ${city}
2. Focus on family-friendly activities appropriate for children ages ${kidsAges}
3. Only include activities available during: ${availability}
4. Filter results within ${maxDistance} miles of ${city}
5. Consider these preferences: ${preferences || 'No specific preferences'}

**Response Format:**
Return exactly 5 recommendations in this format:

**#1 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages ${kidsAges}, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

**#2 [Activity Name] - [Day/Time]**
[Emoji] [2-4 sentence description explaining what the activity involves, why it's great for kids ages ${kidsAges}, and what families can expect]
📍 [Venue Name] 🚗 [Distance] miles

[Continue for all 5 recommendations]

**Requirements:**
- Each activity must be real and currently available
- Include specific times/dates when possible
- Use relevant emojis (🎨 for art, 🏛️ for museums, 🎪 for entertainment, etc.)
- Vary activity types (indoor/outdoor, educational/recreational, etc.)
- Prioritize activities with good reviews or popularity
- Include accurate venue names and distances`;
};
```

## Claude API Configuration

```javascript
const claudeApiCall = async (prompt) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      tools: [
        {
          type: 'web_search_20250305',
          max_uses: 5
        }
      ],
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  return response.json();
};
```