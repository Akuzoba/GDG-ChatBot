const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create model instance with Gemini 2.5 Flash
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

// Function definitions for Gemini to call
const functionDefinitions = [
  {
    name: "get_upcoming_events",
    description: "Get upcoming GDG events from Google Calendar",
    parameters: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description: "Maximum number of events to return (default: 5)"
        },
        daysAhead: {
          type: "number", 
          description: "Number of days ahead to look for events (default: 30)"
        }
      },
      required: []
    }
  },
  {
    name: "get_event_details",
    description: "Get detailed information about a specific event",
    parameters: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the specific event"
        },
        eventTitle: {
          type: "string",
          description: "The title or name of the event to search for"
        }
      },
      required: []
    }
  },
  {
    name: "get_past_events",
    description: "Get information about past GDG events",
    parameters: {
      type: "object",
      properties: {
        maxResults: {
          type: "number",
          description: "Maximum number of events to return (default: 5)"
        },
        daysBack: {
          type: "number",
          description: "Number of days back to look for events (default: 90)"
        }
      },
      required: []
    }
  },
  {
    name: "get_faqs",
    description: "Get frequently asked questions and their answers",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Category of FAQs to retrieve (e.g., 'events', 'membership', 'general')"
        },
        searchTerm: {
          type: "string",
          description: "Search term to find relevant FAQs"
        }
      },
      required: []
    }
  },
  {
    name: "get_speaker_info",
    description: "Get information about event speakers",
    parameters: {
      type: "object",
      properties: {
        speakerName: {
          type: "string",
          description: "Name of the speaker to search for"
        },
        eventId: {
          type: "string",
          description: "Event ID to get speakers for"
        }
      },
      required: []
    }
  }
];

// System prompt for the bot
const systemPrompt = `You are GDG Event Assistant, a helpful and friendly WhatsApp chatbot for Google Developer Groups (GDG) communities. 

Your role is to:
- Provide accurate information about upcoming and past GDG events
- Answer questions about speakers, schedules, and event details
- Help users find relevant information from the community's knowledge base
- Maintain a conversational, helpful tone while being informative
- Use the available functions to fetch real-time data when needed

Key guidelines:
- Always be friendly and welcoming to GDG community members
- Provide specific, actionable information when possible
- If you don't have information about something, be honest about it
- Encourage community participation and engagement
- Use emojis sparingly but appropriately to keep the conversation engaging
- Keep responses concise but informative for WhatsApp messaging

Remember: You're helping to build and support a vibrant developer community!`;

// Create chat session with function calling
const createChatSession = () => {
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Hello! I'm GDG Event Assistant, your friendly guide to all things GDG! 🚀 I'm here to help you with event information, speaker details, and community insights. What would you like to know about our upcoming events or community activities?" }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    tools: functionDefinitions
  });
};

// Function to handle function calls
const handleFunctionCall = async (functionCall) => {
  const { name, args } = functionCall;
  logger.info(`Function called: ${name} with args:`, args);
  
  try {
    switch (name) {
      case 'get_upcoming_events':
        const calendarService = require('../services/googleCalendarService');
        return await calendarService.getUpcomingEvents(args.maxResults || 5, args.daysAhead || 30);
        
      case 'get_event_details':
        const eventService = require('../services/googleCalendarService');
        return await eventService.getEventDetails(args.eventId, args.eventTitle);
        
      case 'get_past_events':
        const pastEventsService = require('../services/googleCalendarService');
        return await pastEventsService.getPastEvents(args.maxResults || 5, args.daysBack || 90);
        
      case 'get_faqs':
        const sheetsService = require('../services/googleSheetsService');
        return await sheetsService.getFAQs(args.category, args.searchTerm);
        
      case 'get_speaker_info':
        const speakerService = require('../services/googleSheetsService');
        return await speakerService.getSpeakerInfo(args.speakerName, args.eventId);
        
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  } catch (error) {
    logger.error(`Error executing function ${name}:`, error);
    throw error;
  }
};

module.exports = {
  model,
  createChatSession,
  handleFunctionCall,
  functionDefinitions
}; 