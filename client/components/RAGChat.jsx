'use client';

import { useState, useRef, useEffect } from 'react';
import { ragAPI } from '@/services/api';
import '@/styles/RAGChat.css';

const RAGChat = ({ imageId, authenticity }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (imageId && authenticity) {
      // Add initial system message
      setMessages([
        {
          type: 'system',
          content: `Medicine processed! Classification: ${authenticity?.result || 'Unknown'} (${((authenticity?.confidence || 0) * 100).toFixed(1)}% confidence)`,
        },
      ]);
    }
  }, [imageId, authenticity]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !imageId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await ragAPI.chat(imageId, userMessage);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: response.data?.reply || 'No response received',
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: error.response?.data?.message || error.message || 'Failed to get response',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rag-chat-container">
      <div className="chat-header">
        <h3>Ask About This Medicine</h3>
        <p>Chat with Gemini Vision about the uploaded image</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.type}`}>
            {msg.type === 'user' && (
              <div className="message-content">
                <div className="message-avatar user-avatar">You</div>
                <div className="message-bubble user-bubble">{msg.content}</div>
              </div>
            )}
            {msg.type === 'assistant' && (
              <div className="message-content">
                <div className="message-avatar assistant-avatar">AI</div>
                <div className="message-bubble assistant-bubble">
                  {msg.content}
                </div>
              </div>
            )}
            {msg.type === 'system' && (
              <div className="message-content">
                <div className="message-bubble system-bubble">{msg.content}</div>
              </div>
            )}
            {msg.type === 'error' && (
              <div className="message-content">
                <div className="message-bubble error-bubble">{msg.content}</div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <div className="message-content">
              <div className="message-avatar assistant-avatar">AI</div>
              <div className="message-bubble assistant-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this medicine..."
          disabled={!imageId || loading}
          className="chat-input"
        />
        <button type="submit" disabled={!imageId || loading || !input.trim()} className="chat-send-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default RAGChat;

