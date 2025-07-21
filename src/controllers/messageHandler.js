const geminiService = require('../services/geminiService');
const twilioService = require('../services/twilioService');
const logger = require('../utils/logger');

// Handle incoming WhatsApp message
const handleIncomingMessage = async (req, res) => {
  try {
    logger.info('Processing incoming WhatsApp message');
    
    // Parse the incoming message
    const { message, from, messageSid } = twilioService.parseIncomingMessage(req);
    
    if (!message) {
      logger.warn('Empty message received');
      return res.status(200).send('OK');
    }
    
    logger.info(`Message from ${from}: ${message}`);
    
    // Check for special commands
    const response = await handleSpecialCommands(message, from);
    if (response) {
      return res.status(200).send('OK');
    }
    
    // Process message with Gemini AI
    const aiResponse = await geminiService.processMessage(from, message);
    
    // Send response back via WhatsApp
    const sendResult = await twilioService.sendMessage(from, aiResponse);
    
    if (sendResult.success) {
      logger.info(`Response sent successfully to ${from}`);
    } else {
      logger.error(`Failed to send response to ${from}:`, sendResult.error);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling incoming message:', error);
    
    // Try to send error message to user
    try {
      const { from } = twilioService.parseIncomingMessage(req);
      await twilioService.sendErrorMessage(from, 'api_error');
    } catch (sendError) {
      logger.error('Failed to send error message:', sendError);
    }
    
    res.status(500).send('Error');
  }
};

// Handle special commands
const handleSpecialCommands = async (message, from) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Welcome/start command
  if (lowerMessage === 'start' || lowerMessage === 'hello' || lowerMessage === 'hi') {
    await twilioService.sendWelcomeMessage(from);
    return true;
  }
  
  // Help command
  if (lowerMessage === 'help' || lowerMessage === 'menu' || lowerMessage === 'commands') {
    await twilioService.sendHelpMessage(from);
    return true;
  }
  
  // Reset conversation
  if (lowerMessage === 'reset' || lowerMessage === 'clear' || lowerMessage === 'restart') {
    geminiService.clearChatSession(from);
    await twilioService.sendMessage(from, "Conversation reset! How can I help you today? 🔄");
    return true;
  }
  
  // Status/health check
  if (lowerMessage === 'status' || lowerMessage === 'health') {
    const stats = geminiService.getConversationStats();
    const statusMessage = `🤖 GDG Bot Status:\n\n✅ Bot is running\n📊 Active sessions: ${stats.activeSessions}\n🕐 Server time: ${new Date().toLocaleString()}`;
    await twilioService.sendMessage(from, statusMessage);
    return true;
  }
  
  return false;
};

// Handle webhook verification (for Twilio)
const handleWebhookVerification = async (req, res) => {
  try {
    // Validate webhook signature
    const isValid = twilioService.validateIncomingWebhook(req);
    
    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return res.status(403).send('Forbidden');
    }
    
    // Process the message
    await handleIncomingMessage(req, res);
  } catch (error) {
    logger.error('Error in webhook verification:', error);
    res.status(500).send('Error');
  }
};

// Handle direct message processing (for testing)
const processMessageDirectly = async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required'
      });
    }
    
    logger.info(`Processing direct message for user ${userId}: ${message}`);
    
    const response = await geminiService.processMessage(userId, message);
    
    res.json({
      success: true,
      response,
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing direct message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get conversation statistics
const getConversationStats = async (req, res) => {
  try {
    const stats = geminiService.getConversationStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting conversation stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Clear conversation for a user
const clearConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    geminiService.clearChatSession(userId);
    
    res.json({
      success: true,
      message: `Conversation cleared for user ${userId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const history = geminiService.getChatHistory(userId);
    
    res.json({
      success: true,
      userId,
      history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  handleIncomingMessage,
  handleWebhookVerification,
  processMessageDirectly,
  getConversationStats,
  clearConversation,
  getChatHistory
}; 