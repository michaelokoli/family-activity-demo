import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { PromptManager } from './promptUtils.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize prompt manager
const promptManager = new PromptManager('./prompt.md');

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Vite dev server and potential production ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Family Activity Finder API'
  });
});

// Activity search endpoint
app.post('/api/activities', async (req, res) => {
  try {
    // Validate required fields
    const { city, state, ages, availability, distance, preferences } = req.body;

    if (!city || !state || !ages || !availability || distance === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['city', 'state', 'ages', 'availability', 'distance']
      });
    }

    // Generate prompt for Claude with web search using dynamic template
    let prompt;
    try {
      prompt = promptManager.generatePrompt(req.body);
    } catch (promptError) {
      console.error('❌ Prompt generation failed:', promptError.message);
      return res.status(400).json({
        error: 'Invalid search criteria',
        message: promptError.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('Sending request to Claude API...');

    // Create a timeout promise for Claude API call
    const timeoutMs = 45000; // 45 seconds timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Claude API request timed out after 45 seconds')), timeoutMs);
    });

    let response;
    try {
      // Try with web search first
      console.log('🌐 Attempting search with web tools...');
      const claudePromise = anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      });

      // Race the Claude API call against the timeout
      response = await Promise.race([claudePromise, timeoutPromise]);

    } catch (webSearchError) {
      // Check if it's a rate limit error
      if (webSearchError.status === 429 ||
          (webSearchError.message && webSearchError.message.includes('rate_limit_error'))) {

        console.log('⚠️ Rate limit hit, falling back to knowledge-based search...');

        // Fallback: Use Claude without web search (much lower token usage)
        const fallbackPrompt = `Based on your knowledge, suggest 5 family-friendly activities in ${req.body.city}, ${req.body.state} for children aged ${req.body.ages}.

Available: ${req.body.availability}
Maximum distance: ${req.body.distance} miles from city center
${req.body.preferences ? `Preferences: ${req.body.preferences}` : ''}

Return EXACTLY 5 activities in this JSON format:
{
  "activities": [
    {
      "title": "Activity Name",
      "emoji": "🎯",
      "description": "Detailed description of the activity and why it's good for the specified age group.",
      "location": "General area or type of venue (e.g., 'Downtown area', 'Local parks')",
      "distance": "Varies",
      "ageAppropriate": true,
      "currentInfo": "Note: Based on general knowledge - please verify current hours and availability"
    }
  ]
}

Focus on popular, well-established venues and activities that are likely to be available.`;

        const fallbackPromise = anthropic.messages.create({
          model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: fallbackPrompt
          }]
        });

        response = await Promise.race([fallbackPromise, timeoutPromise]);

      } else {
        // Re-throw other errors
        throw webSearchError;
      }
    }

    // Parse the response and extract activities
    console.log('Claude API response:', JSON.stringify(response, null, 2));

    let responseText = '';
    if (response.content && response.content.length > 0) {
      // Handle web search tool responses - look for text content type
      for (const content of response.content) {
        if (content.type === 'text' && content.text) {
          responseText = content.text;
          break;
        }
      }

      // Fallback: if no text type found, try the old logic
      if (!responseText) {
        if (response.content[0].text) {
          responseText = response.content[0].text;
        } else if (typeof response.content[0] === 'string') {
          responseText = response.content[0];
        } else {
          responseText = JSON.stringify(response.content[0]);
        }
      }
    } else {
      responseText = JSON.stringify(response);
    }

    console.log('📝 Extracted response text for parsing:', responseText.substring(0, 500) + '...');

    const activities = parseActivitiesFromResponse(responseText);

    console.log(`✅ Successfully generated ${activities.length} activities`);

    res.json({
      success: true,
      activities: activities,
      searchCriteria: req.body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating activities:', error);

    // Return appropriate error response
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Internal server error';

    res.status(statusCode).json({
      error: 'Failed to generate activities',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});


// Parse activities from Claude's response
function parseActivitiesFromResponse(responseText) {
  try {
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.activities && Array.isArray(parsed.activities)) {
        return parsed.activities.slice(0, 5); // Ensure we only return 5 activities
      }
    }

    // Fallback: create structured response from text
    console.log('Using fallback parsing for Claude response');
    return createFallbackActivities(responseText);

  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return createFallbackActivities(responseText);
  }
}

// Create fallback activities if JSON parsing fails
function createFallbackActivities(responseText) {
  return [
    {
      title: "Activity Search Results",
      emoji: "🔍",
      description: "Please try your search again. We're working to improve our activity recommendations.",
      location: "Various locations",
      distance: "Varies",
      ageAppropriate: true,
      currentInfo: "Please refine your search criteria"
    }
  ];
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong processing your request',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Family Activity Finder API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Activities endpoint: http://localhost:${PORT}/api/activities`);
});

export default app;