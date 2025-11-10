/**
 * Support Chat Service
 * Sprint 7: Migrated to /api/v1 endpoint prefix
 */

import { apiClient, API_ENDPOINTS } from '../config/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  success: boolean;
  conversation_id: string;
  message: string;
  response: string;
  timestamp: string;
}

/**
 * Send a message to the support chat
 */
export const sendSupportMessage = async (
  message: string,
  conversationId?: string
): Promise<ChatResponse> => {
  const response = await apiClient.post(API_ENDPOINTS.SUPPORT_CHAT, {
    message,
    conversation_id: conversationId
  });

  return response.data;
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const response = await apiClient.get(
    API_ENDPOINTS.SUPPORT_HISTORY(conversationId)
  );

  return response.data.messages;
};

/**
 * List all user conversations
 */
export const listConversations = async () => {
  const response = await apiClient.get(API_ENDPOINTS.SUPPORT_CONVERSATIONS);
  return response.data.conversations;
};
