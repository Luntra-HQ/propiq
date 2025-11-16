import { useState, useEffect, useRef } from 'react';
import { sendSupportMessage, ChatMessage } from '../utils/supportChat';
import './SupportChat.css';

export const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage }
    ]);

    try {
      // Send to backend
      const response = await sendSupportMessage(userMessage, conversationId || undefined);

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add AI response
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.response }
      ]);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or contact support@propiq.com'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        data-tour="support-button"
        className="support-chat-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI-powered support chat"
        title="Chat with our AI support assistant"
      >
        <ChatIcon />
        <span>Need Help? (AI)</span>
      </button>
    );
  }

  return (
    <div className="support-chat-widget">
      <div className="support-chat-header">
        <h3>PropIQ AI Support</h3>
        <button onClick={() => setIsOpen(false)} aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="support-chat-messages">
        {messages.length === 0 && (
          <div className="support-chat-welcome">
            <p>Hi! I'm the PropIQ support assistant. How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`support-chat-message ${msg.role}`}
          >
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="support-chat-message assistant">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="support-chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10z"
      fill="currentColor"
    />
  </svg>
);
