const geminiService = require('../../src/services/geminiService');

// Mock the Gemini client
jest.mock('../../src/config/geminiClient', () => ({
  createChatSession: jest.fn(() => ({
    sendMessage: jest.fn(() => ({
      response: Promise.resolve({
        text: () => 'Mock response from Gemini'
      })
    }))
  })),
  handleFunctionCall: jest.fn()
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processMessage', () => {
    it('should process a message and return a response', async () => {
      const userId = 'test-user-123';
      const message = 'What events are coming up?';
      
      const response = await geminiService.processMessage(userId, message);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    it('should handle errors gracefully', async () => {
      const userId = 'test-user-123';
      const message = 'Test message';
      
      // Mock an error
      const mockChat = {
        sendMessage: jest.fn(() => {
          throw new Error('API Error');
        })
      };
      
      require('../../src/config/geminiClient').createChatSession.mockReturnValue(mockChat);
      
      const response = await geminiService.processMessage(userId, message);
      
      expect(response).toContain("I'm sorry");
      expect(response).toContain("trouble processing");
    });
  });

  describe('clearChatSession', () => {
    it('should clear a chat session for a user', () => {
      const userId = 'test-user-123';
      
      // First create a session
      geminiService.processMessage(userId, 'Hello');
      
      // Then clear it
      geminiService.clearChatSession(userId);
      
      // Verify the session is cleared by checking stats
      const stats = geminiService.getConversationStats();
      expect(stats.activeSessions).toBe(0);
    });
  });

  describe('getConversationStats', () => {
    it('should return conversation statistics', () => {
      const stats = geminiService.getConversationStats();
      
      expect(stats).toHaveProperty('activeSessions');
      expect(stats).toHaveProperty('totalSessions');
      expect(typeof stats.activeSessions).toBe('number');
      expect(typeof stats.totalSessions).toBe('number');
    });
  });

  describe('handleEventQuery', () => {
    it('should handle event queries', async () => {
      const userId = 'test-user-123';
      const query = 'When is the next workshop?';
      
      const response = await geminiService.handleEventQuery(userId, query);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });

  describe('handleFAQQuery', () => {
    it('should handle FAQ queries', async () => {
      const userId = 'test-user-123';
      const query = 'How do I join GDG?';
      
      const response = await geminiService.handleFAQQuery(userId, query);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });

  describe('handleSpeakerQuery', () => {
    it('should handle speaker queries', async () => {
      const userId = 'test-user-123';
      const query = 'Who is speaking at the next event?';
      
      const response = await geminiService.handleSpeakerQuery(userId, query);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });
}); 