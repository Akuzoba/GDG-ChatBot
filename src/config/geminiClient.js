const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function definitions for Gemini to call (Calendar only)
const functionDefinitions = [
  {
    name: "get_upcoming_events",
    description: "Get upcoming GDG events from Google Calendar",
    parameters: {
      type: "object",
      properties: {
        maxResults: {
          type: "integer",
          description: "Maximum number of events to return (default: 5)",
        },
        daysAhead: {
          type: "integer",
          description: "Number of days ahead to look for events (default: 30)",
        },
      },
    },
  },
  {
    name: "get_event_details",
    description: "Get detailed information about a specific event",
    parameters: {
      type: "object",
      properties: {
        eventId: {
          type: "string",
          description: "The ID of the specific event",
        },
        eventTitle: {
          type: "string",
          description: "The title or name of the event to search for",
        },
      },
    },
  },
  {
    name: "get_past_events",
    description: "Get information about past GDG events",
    parameters: {
      type: "object",
      properties: {
        maxResults: {
          type: "integer",
          description: "Maximum number of events to return (default: 5)",
        },
        daysBack: {
          type: "integer",
          description: "Number of days back to look for events (default: 90)",
        },
      },
    },
  },
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

// Create model instance with Gemini 2.5 Flash
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  tools: [{ functionDeclarations: functionDefinitions }], // Configure tools at model level like in Python
});

// Create chat session with function calling
const createChatSession = () => {
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Hello! I'm GDG Event Assistant, your friendly guide to all things GDG! 🚀 I'm here to help you with event information, speaker details, and community insights. What would you like to know about our upcoming events or community activities?",
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    // Tools are already configured at model level, no need to duplicate here
  });
};

// Function to handle function calls
const handleFunctionCall = async (functionCall) => {
  const { name, args } = functionCall;
  logger.info(`Function called: ${name} with args:`, args);

  try {
    let result;
    switch (name) {
      case "get_upcoming_events":
        const calendarService = require("../services/googleCalendarService");
        result = await calendarService.getUpcomingEvents(
          args.maxResults || 5,
          args.daysAhead || 30
        );
        break;

      case "get_event_details":
        const eventService = require("../services/googleCalendarService");
        result = await eventService.getEventDetails(
          args.eventId,
          args.eventTitle
        );
        break;

      case "get_past_events":
        const pastEventsService = require("../services/googleCalendarService");
        result = await pastEventsService.getPastEvents(
          args.maxResults || 5,
          args.daysBack || 90
        );
        break;

      default:
        throw new Error(`Unknown function: ${name}`);
    }

    // Format the result for better readability
    return formatFunctionResult(name, result);
  } catch (error) {
    logger.error(`Error executing function ${name}:`, error);
    return {
      success: false,
      error: error.message,
      message: `Failed to execute ${name}: ${error.message}`,
    };
  }
};

// Helper function to format function results
const formatFunctionResult = (functionName, result) => {
  switch (functionName) {
    case "get_upcoming_events":
    case "get_past_events":
      if (result.success && result.events) {
        return {
          success: true,
          message: result.message,
          events: result.events.map((event) => ({
            title: event.title,
            description: event.description,
            start: event.start,
            end: event.end,
            location: event.location,
            attendees: event.attendees,
          })),
        };
      }
      break;

    case "get_event_details":
      if (result.success && result.event) {
        return {
          success: true,
          message: result.message,
          event: {
            title: result.event.title,
            description: result.event.description,
            start: result.event.start,
            end: result.event.end,
            location: result.event.location,
            attendees: result.event.attendees,
            speakers: result.event.speakers,
          },
        };
      }
      break;
  }

  // Default formatting
  return result;
};

module.exports = {
  model,
  createChatSession,
  handleFunctionCall,
  formatFunctionResult,
  functionDefinitions,
};
