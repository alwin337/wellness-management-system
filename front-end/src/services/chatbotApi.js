import API from "../api/axios";

// Create a new chatbot conversation
export const createConversation = (title) => {
  return API.post("/chatbot/conversations", { title });
};

// Get all active chatbot conversations for the current student
export const getConversations = () => {
  return API.get("/chatbot/conversations");
};

// Get message history of a specific conversation
export const getConversationMessages = (conversationId) => {
  return API.get(`/chatbot/conversations/${conversationId}/messages`);
};

// Send a student message and receive the AI chatbot reply
export const sendMessage = (conversationId, message) => {
  return API.post(`/chatbot/conversations/${conversationId}/messages`, { message });
};

// Delete/deactivate a conversation by ID
export const deleteConversation = (conversationId) => {
  return API.delete(`/chatbot/conversations/${conversationId}`);
};
