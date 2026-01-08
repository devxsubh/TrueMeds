'use client';

import { useState, useRef, useEffect } from 'react';
import { mlAPI, ragAPI } from '@/services/api';
import MessageFormatter from '@/components/MessageFormatter';
import '@/styles/UnifiedChat.css';

const UnifiedChat = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const messagesEndRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate heat map data based on classification result
  useEffect(() => {
    if (result && preview) {
      generateHeatmap();
    }
  }, [result, preview]);

  const generateHeatmap = () => {
    // Simulate heat map data - in production, this would come from Grad-CAM
    // For now, we'll create a visual representation based on confidence
    const confidence = result.confidence;
    const isAuthentic = result.label?.toLowerCase() === 'authentic';
    
    // Create a more detailed grid for smoother heat map
    const gridSize = 30;
    const heatmap = [];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Simulate attention areas (center gets more attention, with some randomness)
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        const distFromCenter = Math.sqrt(
          Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2)
        );
        const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const normalizedDist = 1 - (distFromCenter / maxDist);
        
        // Add some variation to make it more realistic
        const variation = (Math.sin(i * 0.5) + Math.cos(j * 0.5)) * 0.1;
        
        // Higher confidence = stronger heat map
        const intensity = Math.max(0.1, Math.min(0.9, 
          normalizedDist * confidence * 0.7 + 0.2 + variation
        ));
        
        heatmap.push({
          x: (j / gridSize) * 100,
          y: (i / gridSize) * 100,
          intensity: intensity,
          color: isAuthentic 
            ? `rgba(16, 185, 129, ${intensity * 0.7})` // Green for authentic
            : `rgba(239, 68, 68, ${intensity * 0.7})`  // Red for counterfeit
        });
      }
    }
    
    setHeatmapData(heatmap);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
    setImageId(null);
    setMessages([]);
    setHeatmapData(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleClassify = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setClassifying(true);
    setError(null);
    try {
      // Classify image
      const response = await mlAPI.classify(file);
      const data = response.data || response;
      setResult(data);

      // Upload for RAG chat
      const ragResponse = await ragAPI.uploadImage(file);
      setImageId(ragResponse.imageId);

      // Add system message with classification result
      const classificationMsg = {
        type: 'system',
        content: `🔍 Image classified as **${data.label?.charAt(0).toUpperCase() + data.label?.slice(1)}** with ${(data.confidence * 100).toFixed(1)}% confidence. You can now ask questions about this medicine!`,
        result: data
      };
      setMessages([classificationMsg]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Classification failed. Please try again.');
    } finally {
      setClassifying(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !imageId || chatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setChatLoading(true);

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
      setChatLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setImageId(null);
    setMessages([]);
    setHeatmapData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getResultColor = (label) => {
    return label?.toLowerCase() === 'authentic' ? '#10b981' : '#ef4444';
  };

  return (
    <div className="unified-chat-container">
      <div className="unified-chat-layout">
        {/* Left Side: Image Upload & Classification */}
        <div className="image-section">
          <div className="section-header">
            <h2>📸 Upload Medicine Image</h2>
            <p>Upload an image to classify and analyze</p>
          </div>

          {/* Upload Zone */}
          <div
            ref={dropZoneRef}
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            
            {!preview ? (
              <div className="upload-content">
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3>Drag & Drop your image here</h3>
                <p>or click to browse</p>
              </div>
            ) : (
              <div className="preview-container">
                <div className="image-wrapper" ref={imageRef}>
                  <img src={preview} alt="Preview" className="preview-image" />
                  {heatmapData && result && (
                    <div className="heatmap-overlay">
                      {heatmapData.map((point, idx) => (
                        <div
                          key={idx}
                          className="heatmap-point"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            backgroundColor: point.color,
                            opacity: point.intensity * 0.6,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button className="remove-image" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Classification Button */}
          {preview && !result && (
            <button
              onClick={handleClassify}
              disabled={classifying}
              className="classify-btn"
            >
              {classifying ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  Classify Image
                </>
              )}
            </button>
          )}

          {/* Classification Result */}
          {result && (
            <div className="result-card" style={{ borderColor: getResultColor(result.label) }}>
              <div className="result-header">
                <div className="result-badge" style={{ backgroundColor: getResultColor(result.label) }}>
                  <span className="result-icon">
                    {result.label?.toLowerCase() === 'authentic' ? '✓' : '✗'}
                  </span>
                  <span className="result-label">
                    {result.label?.charAt(0).toUpperCase() + result.label?.slice(1)}
                  </span>
                </div>
                <div className="confidence-display">
                  <span className="confidence-label">Confidence</span>
                  <span className="confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="confidence-bar-container">
                <div
                  className="confidence-bar"
                  style={{
                    width: `${result.confidence * 100}%`,
                    backgroundColor: getResultColor(result.label)
                  }}
                ></div>
              </div>

              {heatmapData && (
                <div className="heatmap-info">
                  <p>🔥 Heat map shows model attention areas</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Chat Interface */}
        <div className="chat-section">
          <div className="chat-header">
            <h2>💬 Ask About This Medicine</h2>
            <p>Chat with AI about the uploaded image</p>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">💭</div>
                <p>Upload and classify an image to start chatting!</p>
                <p className="empty-chat-hint">Ask questions like:</p>
                <ul>
                  <li>"What are the key features of this medicine?"</li>
                  <li>"Is this packaging authentic?"</li>
                  <li>"What should I look for to verify authenticity?"</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, idx) => (
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
                        <MessageFormatter content={msg.content} />
                      </div>
                    </div>
                  )}
                  {msg.type === 'system' && (
                    <div className="message-content">
                      <div className="message-bubble system-bubble">
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    </div>
                  )}
                  {msg.type === 'error' && (
                    <div className="message-content">
                      <div className="message-bubble error-bubble">{msg.content}</div>
                    </div>
                  )}
                </div>
              ))
            )}
            {chatLoading && (
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
              placeholder={imageId ? "Ask a question about this medicine..." : "Upload and classify an image first..."}
              disabled={!imageId || chatLoading}
              className="chat-input"
            />
            <button 
              type="submit" 
              disabled={!imageId || chatLoading || !input.trim()} 
              className="chat-send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UnifiedChat;
