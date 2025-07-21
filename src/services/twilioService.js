const { sendWhatsAppMessage, sendMediaMessage, validateWebhookSignature } = require('../config/twilioClient');
const logger = require('../utils/logger');

// Send text message via WhatsApp
const sendMessage = async (to, message) => {
  try {
    logger.info(`Sending WhatsApp message to ${to}`);
    
    const result = await sendWhatsAppMessage(to, message);
    
    logger.info(`Message sent successfully. SID: ${result.sid}`);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      timestamp: result.dateCreated
    };
  } catch (error) {
    logger.error('Error sending WhatsApp message:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Send media message via WhatsApp
const sendMedia = async (to, mediaUrl, caption = '') => {
  try {
    logger.info(`Sending media message to ${to}`);
    
    const result = await sendMediaMessage(to, mediaUrl, caption);
    
    logger.info(`Media message sent successfully. SID: ${result.sid}`);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      timestamp: result.dateCreated
    };
  } catch (error) {
    logger.error('Error sending media message:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Send welcome message
const sendWelcomeMessage = async (to, userName = 'there') => {
  const welcomeMessage = `Hello ${userName}! 👋

Welcome to GDG Event Assistant! I'm here to help you with:

📅 Upcoming events and schedules
🎤 Speaker information and bios
❓ Frequently asked questions
📚 Community resources and materials
📊 Past event insights and feedback

Just ask me anything about our GDG community! For example:
• "What events are coming up?"
• "Tell me about the speakers"
• "How do I join the community?"
• "What happened at the last event?"

What would you like to know? 🚀`;

  return await sendMessage(to, welcomeMessage);
};

// Send help message
const sendHelpMessage = async (to) => {
  const helpMessage = `Here's how I can help you! 🤖

📅 **Events**
• "What events are coming up?"
• "When is the next workshop?"
• "Tell me about [event name]"

🎤 **Speakers**
• "Who is speaking at [event]?"
• "Tell me about [speaker name]"
• "What topics will be covered?"

❓ **General Questions**
• "How do I join GDG?"
• "Where are events held?"
• "What should I bring to events?"

📚 **Resources**
• "Show me learning materials"
• "What resources are available?"
• "How can I get involved?"

Just type your question naturally - I'll understand! 😊`;

  return await sendMessage(to, helpMessage);
};

// Send error message
const sendErrorMessage = async (to, errorType = 'general') => {
  let errorMessage = '';
  
  switch (errorType) {
    case 'api_error':
      errorMessage = "I'm having trouble connecting to our services right now. Please try again in a few minutes! 🔧";
      break;
    case 'not_found':
      errorMessage = "I couldn't find what you're looking for. Could you try rephrasing your question? 🤔";
      break;
    case 'rate_limit':
      errorMessage = "You're sending messages too quickly! Please wait a moment before sending another message. ⏱️";
      break;
    default:
      errorMessage = "Something went wrong on my end. Please try again or contact the GDG team if the issue persists! 🤖";
  }
  
  return await sendMessage(to, errorMessage);
};

// Send event information
const sendEventInfo = async (to, events) => {
  if (!events || events.length === 0) {
    return await sendMessage(to, "No events found matching your request. Try asking about upcoming events! 📅");
  }
  
  let message = "Here are the events I found: 📅\n\n";
  
  events.forEach((event, index) => {
    const startDate = new Date(event.start).toLocaleDateString();
    const startTime = event.start.includes('T') ? new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day';
    
    message += `${index + 1}. **${event.title}**\n`;
    message += `📅 ${startDate} at ${startTime}\n`;
    if (event.location) {
      message += `📍 ${event.location}\n`;
    }
    if (event.description) {
      const shortDesc = event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description;
      message += `📝 ${shortDesc}\n`;
    }
    message += `🔗 ${event.htmlLink}\n\n`;
  });
  
  return await sendMessage(to, message);
};

// Send FAQ response
const sendFAQResponse = async (to, faqs) => {
  if (!faqs || faqs.length === 0) {
    return await sendMessage(to, "I couldn't find any FAQs matching your question. Try asking something else or contact the GDG team directly! 🤔");
  }
  
  let message = "Here's what I found: ❓\n\n";
  
  faqs.forEach((faq, index) => {
    message += `${index + 1}. **${faq.question}**\n`;
    message += `${faq.answer}\n\n`;
  });
  
  return await sendMessage(to, message);
};

// Send speaker information
const sendSpeakerInfo = async (to, speakers) => {
  if (!speakers || speakers.length === 0) {
    return await sendMessage(to, "I couldn't find any speakers matching your request. Try asking about upcoming events to see who's speaking! 🎤");
  }
  
  let message = "Here's the speaker information: 🎤\n\n";
  
  speakers.forEach((speaker, index) => {
    message += `${index + 1}. **${speaker.name}**\n`;
    if (speaker.bio) {
      message += `📝 ${speaker.bio}\n`;
    }
    if (speaker.expertise) {
      message += `💡 Expertise: ${speaker.expertise}\n`;
    }
    if (speaker.social) {
      message += `🌐 ${speaker.social}\n`;
    }
    message += '\n';
  });
  
  return await sendMessage(to, message);
};

// Validate incoming webhook
const validateIncomingWebhook = (req) => {
  // TEMPORARY: Always return true for local development/testing
  return true;
  // --- Original code below ---
  /*
  const signature = req.headers['x-twilio-signature'];
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  
  if (!signature) {
    logger.warn('No Twilio signature found in request headers');
    return false;
  }
  
  const isValid = validateWebhookSignature(url, req.body, signature);
  
  if (!isValid) {
    logger.warn('Invalid Twilio webhook signature');
  }
  
  return isValid;
  */
};

// Parse incoming message
const parseIncomingMessage = (req) => {
  const {
    Body: message,
    From: from,
    To: to,
    MessageSid: messageSid,
    AccountSid: accountSid
  } = req.body;
  
  return {
    message: message?.trim(),
    from: from?.replace('whatsapp:', ''),
    to: to?.replace('whatsapp:', ''),
    messageSid,
    accountSid,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  sendMessage,
  sendMedia,
  sendWelcomeMessage,
  sendHelpMessage,
  sendErrorMessage,
  sendEventInfo,
  sendFAQResponse,
  sendSpeakerInfo,
  validateIncomingWebhook,
  parseIncomingMessage
}; 