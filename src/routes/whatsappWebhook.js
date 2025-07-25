const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");
const messageHandler = require("../controllers/messageHandler");

// POST /webhook/whatsapp - Main webhook endpoint for Twilio WhatsApp messages
router.post(
  "/whatsapp",
  asyncHandler(async (req, res) => {
    console.log("🔥 Webhook received!");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Query:", JSON.stringify(req.query, null, 2));

    await messageHandler.handleWebhookVerification(req, res);
  })
);

// POST /webhook/test - Test endpoint for direct message processing
router.post(
  "/test",
  asyncHandler(async (req, res) => {
    await messageHandler.processMessageDirectly(req, res);
  })
);

// GET /webhook/stats - Get conversation statistics
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    await messageHandler.getConversationStats(req, res);
  })
);

// DELETE /webhook/conversation/:userId - Clear conversation for a user
router.delete(
  "/conversation/:userId",
  asyncHandler(async (req, res) => {
    await messageHandler.clearConversation(req, res);
  })
);

// GET /webhook/history/:userId - Get chat history for a user
router.get(
  "/history/:userId",
  asyncHandler(async (req, res) => {
    await messageHandler.getChatHistory(req, res);
  })
);

// GET /webhook/status - Simple status check
router.get("/status", (req, res) => {
  res.json({
    status: "OK",
    service: "GDG WhatsApp Bot",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: "POST /webhook/whatsapp",
      test: "POST /webhook/test",
      stats: "GET /webhook/stats",
      clearConversation: "DELETE /webhook/conversation/:userId",
      history: "GET /webhook/history/:userId",
    },
  });
});

module.exports = router;
