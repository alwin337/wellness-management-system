const ChatConversation =
  require("../models/ChatConversation");

const ChatMessage =
  require("../models/ChatMessage");

const {
  generateAIResponse,
} = require("../services/chatbotService");

const {
  checkMessageSafety,
} = require("../services/chatSafetyService");

// Create conversation
const createConversation = async (req, res) => {
  try {
    const conversation =
      await ChatConversation.create({
        userId: req.user._id,

        title:
          req.body.title ||
          "New Conversation",

        lastMessageAt: new Date(),
      });

    res.status(201).json({
      message:
        "Conversation created successfully",

      conversation,
    });
  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error creating conversation",

      error: error.message,
    });
  }
};

// Get student's conversations
const getMyConversations = async (req, res) => {
  try {
    const conversations =
      await ChatConversation.find({
        userId: req.user._id,
        isActive: true,
      }).sort({
        lastMessageAt: -1,
      });

    res.status(200).json({
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATIONS ERROR:",
      error.message
    );

    res.status(500).json({
      message:
        "Error fetching conversations",

      error: error.message,
    });
  }
};

// Get conversation messages
const getConversationMessages =
  async (req, res) => {
    try {
      const conversation =
        await ChatConversation.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          message:
            "Conversation not found",
        });
      }

      const messages =
        await ChatMessage.find({
          conversationId:
            conversation._id,
        }).sort({
          createdAt: 1,
        });

      res.status(200).json({
        conversation,
        messages,
      });
    } catch (error) {
      console.error(
        "GET MESSAGES ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error fetching messages",

        error: error.message,
      });
    }
  };

// Send message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const { conversationId } =
      req.params;

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message:
          "Message is required",
      });
    }

    // Validate conversation ID
    if (!conversationId) {
      return res.status(400).json({
        message:
          "Conversation ID is required",
      });
    }

    // Validate conversation ownership
    const conversation =
      await ChatConversation.findOne({
        _id: conversationId,

        userId: req.user._id,

        isActive: true,
      });

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    // Safety check
    const safety =
      checkMessageSafety(
        message.trim()
      );

    // Save student message
    await ChatMessage.create({
      conversationId:
        conversation._id,

      sender: "student",

      message:
        message.trim(),

      safetyLevel:
        safety.level,
    });

    // Handle urgent safety situation
    if (safety.requiresEscalation) {
      const emergencyResponse =
        "I'm sorry you're going through this. This sounds like something that needs immediate human support. Please contact your local emergency service or a trusted person who can stay with you, and use an appropriate crisis service available in your location.";

      const assistantMessage =
        await ChatMessage.create({
          conversationId:
            conversation._id,

          sender: "assistant",

          message:
            emergencyResponse,

          safetyLevel: "urgent",
        });

      conversation.lastMessageAt =
        new Date();

      await conversation.save();

      return res.status(200).json({
        message:
          "Message processed",

        safetyLevel:
          "urgent",

        requiresEscalation:
          true,

        response:
          emergencyResponse,

        messageId:
          assistantMessage._id,
      });
    }

    // Get previous messages
    const previousMessages =
      await ChatMessage.find({
        conversationId:
          conversation._id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20);

    // Convert database messages
    // to a simple AI conversation format
    const aiMessages =
      previousMessages
        .reverse()
        .map((item) => ({
          role:
            item.sender === "student"
              ? "user"
              : "assistant",

          content:
            item.message,
        }));

    console.log(
      "AI messages from controller:",
      JSON.stringify(
        aiMessages,
        null,
        2
      )
    );

    // Generate AI response
    const aiResponse =
      await generateAIResponse(
        aiMessages
      );

    // Save AI response
    const assistantMessage =
      await ChatMessage.create({
        conversationId:
          conversation._id,

        sender: "assistant",

        message:
          aiResponse.message,

        safetyLevel:
          "normal",
      });

    // Update conversation
    conversation.lastMessageAt =
      new Date();

    await conversation.save();

    res.status(200).json({
      message:
        "Response generated successfully",

      safetyLevel:
        safety.level,

      requiresEscalation:
        false,

      response:
        assistantMessage.message,

      messageId:
        assistantMessage._id,
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Error processing message",

      error:
        error.message,
    });
  }
};

// Delete/deactivate conversation
const deleteConversation =
  async (req, res) => {
    try {
      const conversation =
        await ChatConversation.findOne({
          _id: req.params.id,

          userId: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          message:
            "Conversation not found",
        });
      }

      conversation.isActive =
        false;

      await conversation.save();

      res.status(200).json({
        message:
          "Conversation deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE CONVERSATION ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error deleting conversation",

        error:
          error.message,
      });
    }
  };

module.exports = {
  createConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  deleteConversation,
};