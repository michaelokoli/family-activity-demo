# Family Activity Finder - Specification

## Overview

A web application that helps parents find weekend activities for their families based on location, children's ages, time availability, and preferences, and a relevant emoji icon.

## Requirements

### Core Features

- Location-based activity search (city input)
- Age-appropriate filtering for children
- Time/date availability matching
- Distance radius selection (1-50 miles)
- Optional preference filtering (indoor, educational, budget-friendly)
- Display 5 personalized recommendations with emojis and descriptions

### User Inputs

1. **City** (required) - Text input for location
2. **Kids Ages** (required)  - Text inputs for age ranges
3. **Date & Time** - (requried) - Text input day and time preference  (e.g. "Saturday afternoon")
4. **Maximum Distance** (required) - Slider for travel radius in miles (1-50 miles)
5. **Optional Preferences** - Text input for additional criteria (e.g., "education", "bugdget-friendly")

### Output Format

Each recommendation includes:

- **Bold title** with activity name and time
- **Emoji** representing the activity type
- **2-4 sentence description**
- **Location** and **distance** from user's city

## Tech Stack

### Frontend

- **React** - UI framework
- **CSS/SCSS** - Styling (mobile-first responsive design)
- **React Router** - Navigation

### Backend

- **Express.js** - Web server
- **Node.js** - Runtime environment

### APIs & Services

- **Claude Messages API** - Activity recommendations and formatting
- **Claude Web Search Tool** - Real-time activity discovery
- **Basic Geocoding** - Location validation (OpenCage or similar)

### Development Tools

- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Design Guidelines

### Visual Design

- Clean, family-friendly interface
- Blue primary color (#4285F4) matching mockup
- Card-based layout for recommendations
- Mobile-responsive design
- Clear typography and spacing

### UX Principles

- Simple 5-field form on the left
- Real-time results on the right
- Loading states during API calls
- Error handling for invalid inputs
- Clear visual hierarchy with numbered recommendations

## Development Milestones

### Milestone 1: UI Foundation (Week 1)

**Goal:** Complete frontend with dummy data

**Deliverables:**

- React app setup with Vite
- Main layout with form and results sections
- Form components (city, age, time, distance slider, preferences)
- Results display with 5 dummy activity cards
- Mobile-responsive styling
- Basic form validation

**Acceptance Criteria:**

- Form captures all required inputs
- Results display matches design mockup
- Responsive on mobile and desktop
- Dummy data shows proper formatting (emoji, bold titles, descriptions)

### Milestone 2: Claude API Integration (Week 2)

**Goal:** Connect to Claude API with web search capabilities

**Deliverables:**

- Express.js backend server
- Claude Messages API integration with web search tool
- API endpoint for activity recommendations
- Frontend-backend communication
- Real activity data retrieval
- Use https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-search-tool for implementing messages API and web search

 **Acceptance Criteria:**

- API returns 5 real activity recommendations
- Recommendations are location and age-appropriate
- Proper error handling for API failures
- Activity data includes current/accurate information via web search

### Milestone 3: Polish & Deploy (Week 3)

**Goal:** Production-ready application

**Deliverables:**

- Enhanced search with preference filtering
- Loading states and improved UX
- Error handling and validation
- Basic caching for API efficiency
- Deployment setup

**Acceptance Criteria:**

- Smooth user experience with loading indicators
- Graceful handling of no results or API errors
- Preferences effectively filter recommendations
- Application deployed and accessible
- Basic performance optimization
