const { createChatSession, handleFunctionCall } = require('../config/geminiClient');
const logger = require('../utils/logger');

// Store chat sessions for each user
const chatSessions = new Map();

// Get or create chat session for a user
const getChatSession = (userId) => {
  if (!chatSessions.has(userId)) {
    chatSessions.set(userId, createChatSession());
  }
  return chatSessions.get(userId);
};

// Process user message with Gemini
const processMessage = async (userId, message) => {
  try {
    logger.info(`Processing message for user ${userId}: ${message}`);
    
    const chat = getChatSession(userId);
    
    // Send message to Gemini
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Check if function calling is needed
    if (response.candidates && response.candidates[0].content.parts[0].functionCall) {
      const functionCall = response.candidates[0].content.parts[0].functionCall;
      
      logger.info(`Function call detected: ${functionCall.name}`);
      
      // Execute the function
      const functionResult = await handleFunctionCall(functionCall);
      
      // Send function result back to Gemini
      const finalResult = await chat.sendMessage([
        {
          role: "function",
          parts: [{ text: JSON.stringify(functionResult) }]
        }
      ]);
      
      const finalResponse = await finalResult.response;
      const botMessage = finalResponse.text();
      
      logger.info(`Bot response with function call: ${botMessage}`);
      return botMessage;
    } else {
      // No function call needed
      const botMessage = response.text();
      logger.info(`Bot response: ${botMessage}`);
      return botMessage;
    }
  } catch (error) {
    logger.error('Error processing message with Gemini:', error);
    
    // Return a friendly error message
    return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or contact the GDG team if the issue persists. 🤖";
  }
};

// Clear chat session for a user (useful for resetting conversation)
const clearChatSession = (userId) => {
  if (chatSessions.has(userId)) {
    chatSessions.delete(userId);
    logger.info(`Chat session cleared for user ${userId}`);
  }
};

// Get chat history for a user (for debugging)
const getChatHistory = (userId) => {
  const chat = chatSessions.get(userId);
  if (chat) {
    return chat.getHistory();
  }
  return [];
};

// Process message with context (for multi-turn conversations)
const processMessageWithContext = async (userId, message, context = {}) => {
  try {
    logger.info(`Processing message with context for user ${userId}`);
    
    // Add context to the message if provided
    let enhancedMessage = message;
    if (context.previousMessage) {
      enhancedMessage = `Previous context: ${context.previousMessage}\n\nCurrent message: ${message}`;
    }
    
    return await processMessage(userId, enhancedMessage);
  } catch (error) {
    logger.error('Error processing message with context:', error);
    throw error;
  }
};

// Handle specific types of queries
const handleEventQuery = async (userId, query) => {
  try {
    const enhancedQuery = `This is a query about GDG events: ${query}. Please use the appropriate function to get the most up-to-date information.`;
    return await processMessage(userId, enhancedQuery);
  } catch (error) {
    logger.error('Error handling event query:', error);
    throw error;
  }
};

const handleFAQQuery = async (userId, query) => {
  try {
    const enhancedQuery = `This is a frequently asked question: ${query}. Please search the FAQ database for relevant information.`;
    return await processMessage(userId, enhancedQuery);
  } catch (error) {
    logger.error('Error handling FAQ query:', error);
    throw error;
  }
};

const handleSpeakerQuery = async (userId, query) => {
  try {
    const enhancedQuery = `This is a query about event speakers: ${query}. Please search for speaker information.`;
    return await processMessage(userId, enhancedQuery);
  } catch (error) {
    logger.error('Error handling speaker query:', error);
    throw error;
  }
};

// Get conversation statistics
const getConversationStats = () => {
  return {
    activeSessions: chatSessions.size,
    totalSessions: chatSessions.size
  };
};

module.exports = {
  processMessage,
  processMessageWithContext,
  clearChatSession,
  getChatHistory,
  handleEventQuery,
  handleFAQQuery,
  handleSpeakerQuery,
  getConversationStats
}; 