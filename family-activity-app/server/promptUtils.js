import fs from 'fs';
import path from 'path';

/**
 * Template engine for replacing variables in prompt templates
 */
class PromptTemplate {
  constructor(template) {
    this.template = template;
  }

  /**
   * Replace template variables with actual values
   * @param {Object} variables - Key-value pairs for variable replacement
   * @returns {string} - Template with variables replaced
   */
  render(variables) {
    let result = this.template;

    // Replace each variable in the template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      result = result.replace(regex, value || '');
    }

    // Check for unreplaced variables
    const unreplacedVars = result.match(/\{\{[^}]+\}\}/g);
    if (unreplacedVars) {
      console.warn('Unreplaced template variables found:', unreplacedVars);
    }

    return result;
  }

  /**
   * Get all variable names from the template
   * @returns {string[]} - Array of variable names
   */
  getVariables() {
    const matches = this.template.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  }

  /**
   * Validate that all required variables are provided
   * @param {Object} variables - Variables to validate
   * @returns {string[]} - Array of missing variable names
   */
  validateVariables(variables) {
    const templateVars = this.getVariables();
    const providedVars = Object.keys(variables);
    return templateVars.filter(varName => !providedVars.includes(varName));
  }
}

/**
 * State normalization utilities
 */
class StateNormalizer {
  // US State mapping for common abbreviations and names
  static stateMap = {
    // Abbreviations to full names
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
  };

  /**
   * Normalize state input to a consistent format
   * @param {string} stateInput - User input for state (abbreviation or full name)
   * @returns {Object} - {abbreviation, fullName, isValid}
   */
  static normalize(stateInput) {
    if (!stateInput) {
      return { abbreviation: '', fullName: '', isValid: false };
    }

    const input = stateInput.trim().toUpperCase();

    // Check if it's a known abbreviation
    if (this.stateMap[input]) {
      return {
        abbreviation: input,
        fullName: this.stateMap[input],
        isValid: true
      };
    }

    // Check if it's a full state name
    const inputLower = stateInput.trim().toLowerCase();
    for (const [abbrev, fullName] of Object.entries(this.stateMap)) {
      if (fullName.toLowerCase() === inputLower) {
        return {
          abbreviation: abbrev,
          fullName: fullName,
          isValid: true
        };
      }
    }

    // Invalid state
    return {
      abbreviation: stateInput.trim(),
      fullName: stateInput.trim(),
      isValid: false
    };
  }
}

/**
 * Prompt loader and manager
 */
class PromptManager {
  constructor(promptFilePath) {
    this.promptFilePath = promptFilePath;
    this.template = null;
    this.lastModified = null;
    this.loadTemplate();
  }

  /**
   * Load the prompt template from markdown file
   */
  loadTemplate() {
    try {
      const absolutePath = path.resolve(this.promptFilePath);
      const stats = fs.statSync(absolutePath);

      // Only reload if file was modified
      if (this.lastModified && stats.mtime <= this.lastModified) {
        return;
      }

      const content = fs.readFileSync(absolutePath, 'utf8');
      this.template = this.parseMarkdownTemplate(content);
      this.lastModified = stats.mtime;

      console.log('✅ Prompt template loaded from:', absolutePath);
    } catch (error) {
      console.error('❌ Error loading prompt template:', error.message);
      // Fallback to basic template
      this.template = this.getBasicTemplate();
    }
  }

  /**
   * Parse markdown content to extract template
   * @param {string} content - Markdown file content
   * @returns {string} - Extracted template
   */
  parseMarkdownTemplate(content) {
    // Find the main prompt template section
    const lines = content.split('\n');
    let templateStart = -1;
    let templateEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '## Main Prompt Template') {
        templateStart = i + 1;
      } else if (templateStart > -1 && line.startsWith('## ') && line !== '## Main Prompt Template') {
        templateEnd = i;
        break;
      }
    }

    if (templateStart === -1) {
      throw new Error('Main Prompt Template section not found in markdown file');
    }

    if (templateEnd === -1) {
      templateEnd = lines.length;
    }

    // Extract template content, skipping empty lines at the start
    const templateLines = lines.slice(templateStart, templateEnd);
    while (templateLines.length > 0 && templateLines[0].trim() === '') {
      templateLines.shift();
    }

    return templateLines.join('\n').trim();
  }

  /**
   * Get basic fallback template
   * @returns {string} - Basic template string
   */
  getBasicTemplate() {
    return `Find 5 family-friendly activities in {{city}}, {{state}} for children aged {{ages}}.
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

Requirements:
- All activities must be age-appropriate for {{ages}}
- Include diverse activity types (indoor/outdoor, educational/recreational)
- Provide accurate, current information from web search
- Include specific locations with addresses when possible
- Distance should be calculated from {{city}}, {{state}} city center
- Descriptions should be engaging and informative`;
  }

  /**
   * Generate prompt from form data
   * @param {Object} formData - Form data with user inputs
   * @returns {string} - Generated prompt
   */
  generatePrompt(formData) {
    // Reload template if file was modified
    this.loadTemplate();

    // Normalize state input
    const stateInfo = StateNormalizer.normalize(formData.state);

    // Prepare variables for template
    const ageStr = Array.isArray(formData.ages) ? formData.ages.join(', ') : formData.ages;
    const preferencesStr = formData.preferences ? ` Additional preferences: ${formData.preferences}` : '';

    const variables = {
      city: formData.city || '',
      state: stateInfo.isValid ? stateInfo.fullName : (formData.state || ''),
      ages: ageStr || '',
      availability: formData.availability || '',
      distance: formData.distance || '10',
      preferences: preferencesStr
    };

    // Create template instance and generate prompt
    const promptTemplate = new PromptTemplate(this.template);

    // Validate required variables
    const requiredVars = ['city', 'ages', 'availability', 'distance'];
    const missingVars = requiredVars.filter(varName => {
      const value = variables[varName];
      if (typeof value === 'string') {
        return !value || value.trim() === '';
      }
      return !value || value === '';
    });

    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }

    // Validate state if provided
    if (formData.state && !stateInfo.isValid) {
      console.warn(`⚠️ Unrecognized state: "${formData.state}". Using as-is.`);
    }

    return promptTemplate.render(variables);
  }

  /**
   * Get template variables
   * @returns {string[]} - Array of variable names in template
   */
  getTemplateVariables() {
    if (!this.template) {
      this.loadTemplate();
    }
    const promptTemplate = new PromptTemplate(this.template);
    return promptTemplate.getVariables();
  }
}

export { PromptTemplate, StateNormalizer, PromptManager };