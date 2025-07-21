const twilio = require('twilio');
const logger = require('../utils/logger');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// WhatsApp phone number
const whatsappNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate configuration
const validateConfig = () => {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    throw new Error('TWILIO_ACCOUNT_SID is required');
  }
  if (!process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_AUTH_TOKEN is required');
  }
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER is required');
  }
  
  logger.info('Twilio configuration validated successfully');
};

// Send WhatsApp message
const sendWhatsAppMessage = async (to, message) => {
  try {
    // Ensure the 'to' number has the whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: whatsappNumber,
      to: formattedTo
    });
    
    logger.info(`WhatsApp message sent successfully. SID: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Send media message (for future use - images, documents, etc.)
const sendMediaMessage = async (to, mediaUrl, caption = '') => {
  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const result = await client.messages.create({
      body: caption,
      mediaUrl: [mediaUrl],
      from: whatsappNumber,
      to: formattedTo
    });
    
    logger.info(`Media message sent successfully. SID: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error('Error sending media message:', error);
    throw error;
  }
};

// Get message status
const getMessageStatus = async (messageSid) => {
  try {
    const message = await client.messages(messageSid).fetch();
    return message.status;
  } catch (error) {
    logger.error('Error getting message status:', error);
    throw error;
  }
};

// Validate webhook signature (for security)
const validateWebhookSignature = (url, params, signature) => {
  try {
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      params
    );
  } catch (error) {
    logger.error('Error validating webhook signature:', error);
    return false;
  }
};

module.exports = {
  client,
  whatsappNumber,
  validateConfig,
  sendWhatsAppMessage,
  sendMediaMessage,
  getMessageStatus,
  validateWebhookSignature
}; 