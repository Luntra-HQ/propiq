# Custom AI Support Chat - Integration Guide

## Overview
Simple, AI-powered customer support chat built using your existing Azure OpenAI infrastructure.

**Benefits**:
- ✅ $0/month (vs $74/month for Intercom)
- ✅ No third-party dependencies
- ✅ Uses your existing Azure OpenAI
- ✅ Full control and customization
- ✅ Conversation history in your MongoDB
- ✅ No webhooks or integration headaches

**Backend**: ✅ Complete in `routers/support_chat.py`

---

## How It Works

1. User sends a message → Backend API
2. Backend fetches conversation history from MongoDB
3. Azure OpenAI generates helpful response
4. Response saved to MongoDB and returned to user
5. User can continue conversation with context

Simple REST API - no external services needed!

---

## API Endpoints

### 1. Send Message (Chat)

```bash
POST /support/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "How do I analyze a property?",
  "conversation_id": "optional-for-continuing-chat"
}
```

**Response**:
```json
{
  "success": true,
  "conversation_id": "507f1f77bcf86cd799439011",
  "message": "How do I analyze a property?",
  "response": "To analyze a property in PropIQ:\n\n1. Go to the Analysis page\n2. Enter the property address\n3. Optionally add purchase price, down payment, and interest rate\n4. Click 'Analyze Property'\n\nYou'll get a comprehensive investment analysis including market trends, financial projections, and a buy/hold/avoid recommendation. Need help with anything else?",
  "timestamp": "2025-10-21T18:45:00.000Z"
}
```

### 2. Get Conversation History

```bash
GET /support/history/{conversation_id}
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "conversation_id": "507f1f77bcf86cd799439011",
  "messages": [
    {
      "role": "user",
      "content": "How do I analyze a property?",
      "timestamp": "2025-10-21T18:45:00.000Z"
    },
    {
      "role": "assistant",
      "content": "To analyze a property...",
      "timestamp": "2025-10-21T18:45:02.000Z"
    }
  ],
  "created_at": "2025-10-21T18:45:00.000Z",
  "updated_at": "2025-10-21T18:45:02.000Z"
}
```

### 3. List User Conversations

```bash
GET /support/conversations
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "count": 3,
  "conversations": [
    {
      "conversation_id": "507f1f77bcf86cd799439011",
      "created_at": "2025-10-21T18:45:00.000Z",
      "updated_at": "2025-10-21T18:50:00.000Z",
      "message_count": 6,
      "last_message": "You're welcome! Feel free to reach out anytime."
    }
  ]
}
```

### 4. Health Check

```bash
GET /support/health
```

---

## Frontend Integration (React)

### Step 1: Create Support Chat Utility

```typescript
// src/utils/supportChat.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://luntra-outreach-app.azurewebsites.net';

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
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE}/support/chat`,
    {
      message,
      conversation_id: conversationId
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE}/support/history/${conversationId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data.messages;
};

/**
 * List all user conversations
 */
export const listConversations = async () => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE}/support/conversations`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data.conversations;
};
```

### Step 2: Create Simple Chat Component

```typescript
// src/components/SupportChat.tsx
import { useState, useEffect, useRef } from 'react';
import { sendSupportMessage, ChatMessage } from '@/utils/supportChat';
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
        className="support-chat-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open support chat"
      >
        <ChatIcon />
        <span>Need Help?</span>
      </button>
    );
  }

  return (
    <div className="support-chat-widget">
      <div className="support-chat-header">
        <h3>PropIQ Support</h3>
        <button onClick={() => setIsOpen(false)} aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="support-chat-messages">
        {messages.length === 0 && (
          <div className="support-chat-welcome">
            <p>👋 Hi! I'm the PropIQ support assistant. How can I help you today?</p>
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
```

### Step 3: Add Basic Styles

```css
/* src/components/SupportChat.css */
.support-chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
}

.support-chat-button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.support-chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  max-height: calc(100vh - 100px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.support-chat-header {
  background: #007bff;
  color: white;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.support-chat-header h3 {
  margin: 0;
  font-size: 18px;
}

.support-chat-header button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

.support-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.support-chat-welcome {
  text-align: center;
  color: #666;
  padding: 20px;
}

.support-chat-message {
  display: flex;
  flex-direction: column;
}

.support-chat-message.user {
  align-items: flex-end;
}

.support-chat-message.assistant {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.support-chat-message.user .message-content {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.support-chat-message.assistant .message-content {
  background: #f1f3f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.support-chat-input {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
}

.support-chat-input input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
}

.support-chat-input button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
}

.support-chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .support-chat-widget {
    width: calc(100vw - 40px);
    height: calc(100vh - 40px);
    bottom: 20px;
    right: 20px;
  }
}
```

### Step 4: Add to Your App

```typescript
// src/App.tsx
import { SupportChat } from './components/SupportChat';

function App() {
  return (
    <div>
      {/* Your existing app */}

      {/* Support chat widget (shows for logged-in users) */}
      {isLoggedIn && <SupportChat />}
    </div>
  );
}
```

---

## Testing

### Test Backend Locally

```bash
# Test health
curl http://localhost:8000/support/health

# Test chat (replace <token> with real JWT)
curl -X POST http://localhost:8000/support/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I analyze a property?"}'
```

### Test in Browser

1. Login to your app
2. Click "Need Help?" button
3. Ask: "How do I analyze a property?"
4. Should get an AI response in ~2 seconds
5. Continue conversation - AI remembers context!

---

## What the AI Knows

The support agent is trained to help with:

✅ **How to use PropIQ**:
- Analyzing properties
- Understanding analysis results
- Subscription tiers and pricing
- Account management

✅ **Pricing**:
- Free: 3 trial analyses
- Starter ($29/mo): 20 analyses/month
- Pro ($79/mo): 100 analyses/month
- Elite ($199/mo): Unlimited

✅ **Features**:
- AI property analysis
- Market trend insights
- Financial projections
- Investment recommendations

The AI will admit if it doesn't know something and offer to connect users with your team.

---

## Customization

### Update AI Behavior

Edit the system prompt in `routers/support_chat.py:45`:

```python
SUPPORT_AGENT_PROMPT = """
Your custom instructions here...
"""
```

### Add More Context

Give the AI more information about your product, features, or common issues.

### Track Conversations

All conversations are saved in MongoDB (`support_chats` collection) so you can:
- Review user questions
- Improve AI responses
- Identify common issues
- Provide human followup if needed

---

## Cost Comparison

| Feature | Intercom | Custom Chat |
|---------|----------|-------------|
| **Monthly Cost** | $74 | $0* |
| **Setup Time** | 2+ hours | 15 minutes |
| **Dependencies** | External service | Your existing stack |
| **Customization** | Limited | Full control |
| **Data Ownership** | Intercom | Your MongoDB |
| **Webhooks** | Required | None |
| **Integration Issues** | Many | None |

*Uses your existing Azure OpenAI, costs ~$0.001 per chat message

---

## Monitoring

### Check Chat Health

```bash
curl https://luntra-outreach-app.azurewebsites.net/support/health
```

### View Conversations in MongoDB

```javascript
// MongoDB query
db.support_chats.find({
  user_id: "user123"
}).sort({ updated_at: -1 })
```

### Track Usage with W&B

W&B is already logging all Azure OpenAI calls, including support chat!

---

## Summary

**You now have**:
- ✅ AI-powered support chat
- ✅ Conversation history
- ✅ $0/month cost
- ✅ Full customization
- ✅ No external dependencies
- ✅ Works with your existing infrastructure

**Deploy and test**:
```bash
./deploy-azure.sh
curl https://luntra-outreach-app.azurewebsites.net/support/health
```

**Much simpler than Intercom!** No webhooks, no API keys to manage, no integration headaches.
