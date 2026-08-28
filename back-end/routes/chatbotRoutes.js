const express = require("express");

const router =
  express.Router();

const {
  createConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  deleteConversation,
} = require(
  "../controllers/chatbotController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const {
  studentOnly,
} = require(
  "../middleware/studentMiddleware"
);


// Create conversation
router.post(
  "/conversations",
  protect,
  studentOnly,
  createConversation
);


// Get my conversations
router.get(
  "/conversations",
  protect,
  studentOnly,
  getMyConversations
);


// Get conversation messages
router.get(
  "/conversations/:id/messages",
  protect,
  studentOnly,
  getConversationMessages
);


// Send message
router.post(
  "/conversations/:conversationId/messages",
  protect,
  studentOnly,
  sendMessage
);


// Delete conversation
router.delete(
  "/conversations/:id",
  protect,
  studentOnly,
  deleteConversation
);


module.exports = router;