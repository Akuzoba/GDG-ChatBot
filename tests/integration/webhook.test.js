const request = require('supertest');
const app = require('../../src/index');

// Mock external services
jest.mock('../../src/services/geminiService');
jest.mock('../../src/services/twilioService');

const geminiService = require('../../src/services/geminiService');
const twilioService = require('../../src/services/twilioService');

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses
    geminiService.processMessage.mockResolvedValue('Mock AI response');
    twilioService.sendMessage.mockResolvedValue({
      success: true,
      messageId: 'mock-message-id'
    });
    twilioService.parseIncomingMessage.mockReturnValue({
      message: 'Test message',
      from: '+1234567890',
      messageSid: 'mock-message-sid'
    });
  });

  describe('POST /webhook/whatsapp', () => {
    it('should handle incoming WhatsApp messages', async () => {
      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({
          Body: 'What events are coming up?',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+0987654321',
          MessageSid: 'test-message-sid'
        })
        .expect(200);

      expect(response.text).toBe('OK');
      expect(geminiService.processMessage).toHaveBeenCalledWith('+1234567890', 'What events are coming up?');
      expect(twilioService.sendMessage).toHaveBeenCalledWith('+1234567890', 'Mock AI response');
    });

    it('should handle special commands', async () => {
      twilioService.sendWelcomeMessage.mockResolvedValue({
        success: true,
        messageId: 'welcome-message-id'
      });

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({
          Body: 'start',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+0987654321',
          MessageSid: 'test-message-sid'
        })
        .expect(200);

      expect(response.text).toBe('OK');
      expect(twilioService.sendWelcomeMessage).toHaveBeenCalledWith('+1234567890', 'there');
    });

    it('should handle empty messages', async () => {
      twilioService.parseIncomingMessage.mockReturnValue({
        message: '',
        from: '+1234567890',
        messageSid: 'mock-message-sid'
      });

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({
          Body: '',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+0987654321',
          MessageSid: 'test-message-sid'
        })
        .expect(200);

      expect(response.text).toBe('OK');
      expect(geminiService.processMessage).not.toHaveBeenCalled();
    });
  });

  describe('POST /webhook/test', () => {
    it('should process direct messages for testing', async () => {
      const testData = {
        userId: 'test-user-123',
        message: 'What events are coming up?'
      };

      const response = await request(app)
        .post('/webhook/test')
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.response).toBe('Mock AI response');
      expect(response.body.userId).toBe('test-user-123');
      expect(geminiService.processMessage).toHaveBeenCalledWith('test-user-123', 'What events are coming up?');
    });

    it('should return error for missing userId', async () => {
      const response = await request(app)
        .post('/webhook/test')
        .send({ message: 'Test message' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('userId');
    });

    it('should return error for missing message', async () => {
      const response = await request(app)
        .post('/webhook/test')
        .send({ userId: 'test-user-123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('message');
    });
  });

  describe('GET /webhook/stats', () => {
    it('should return conversation statistics', async () => {
      geminiService.getConversationStats.mockReturnValue({
        activeSessions: 5,
        totalSessions: 10
      });

      const response = await request(app)
        .get('/webhook/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.activeSessions).toBe(5);
      expect(response.body.stats.totalSessions).toBe(10);
    });
  });

  describe('DELETE /webhook/conversation/:userId', () => {
    it('should clear conversation for a user', async () => {
      const userId = 'test-user-123';

      const response = await request(app)
        .delete(`/webhook/conversation/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain(userId);
      expect(geminiService.clearChatSession).toHaveBeenCalledWith(userId);
    });

    it('should return error for missing userId', async () => {
      const response = await request(app)
        .delete('/webhook/conversation/')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('GET /webhook/history/:userId', () => {
    it('should return chat history for a user', async () => {
      const userId = 'test-user-123';
      const mockHistory = [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] }
      ];

      geminiService.getChatHistory.mockReturnValue(mockHistory);

      const response = await request(app)
        .get(`/webhook/history/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.history).toEqual(mockHistory);
    });
  });

  describe('GET /webhook/status', () => {
    it('should return webhook status information', async () => {
      const response = await request(app)
        .get('/webhook/status')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('GDG WhatsApp Bot');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.webhook).toBe('POST /webhook/whatsapp');
    });
  });

  describe('Error Handling', () => {
    it('should handle Gemini service errors gracefully', async () => {
      geminiService.processMessage.mockRejectedValue(new Error('Gemini API Error'));
      twilioService.sendErrorMessage.mockResolvedValue({
        success: true,
        messageId: 'error-message-id'
      });

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({
          Body: 'Test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+0987654321',
          MessageSid: 'test-message-sid'
        })
        .expect(500);

      expect(response.text).toBe('Error');
      expect(twilioService.sendErrorMessage).toHaveBeenCalledWith('+1234567890', 'api_error');
    });

    it('should handle Twilio service errors gracefully', async () => {
      twilioService.sendMessage.mockResolvedValue({
        success: false,
        error: 'Twilio API Error'
      });

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({
          Body: 'Test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+0987654321',
          MessageSid: 'test-message-sid'
        })
        .expect(200);

      expect(response.text).toBe('OK');
    });
  });
}); 