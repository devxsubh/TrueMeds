'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ragAPI } from '@/services/api';
import UploadComponent from '@/components/UploadComponent';
import RAGChat from '@/components/RAGChat';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/Home.css';

const ProjectInfo = () => {
  return (
    <div className="project-info">
      <section className="info-section">
        <div className="section-header">
          <h2>📊 Dataset Information</h2>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </div>
            <div className="info-card-content">
              <h3>Total Dataset Size</h3>
              <p className="info-value">~110 MB</p>
              <p className="info-desc">Complete dataset for training and validation</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <div className="info-card-content">
              <h3>Training Images</h3>
              <p className="info-value">1,367 images</p>
              <p className="info-desc">89 MB - Used for model training</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div className="info-card-content">
              <h3>Validation Images</h3>
              <p className="info-value">123 images</p>
              <p className="info-desc">14 MB - Used for model validation</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div className="info-card-content">
              <h3>Test Images</h3>
              <p className="info-value">65 images</p>
              <p className="info-desc">6.8 MB - Used for final evaluation</p>
            </div>
          </div>
        </div>
        <div className="dataset-details">
          <h3>Dataset Source & Format</h3>
          <ul>
            <li><strong>Source:</strong> Roboflow Universe (Counterfeit_med_detection)</li>
            <li><strong>License:</strong> CC BY 4.0</li>
            <li><strong>Format:</strong> TensorFlow Object Detection format (CSV annotations)</li>
            <li><strong>Classes:</strong> Authentic (0) and Counterfeit (1)</li>
          </ul>
        </div>
      </section>

      <section className="info-section">
        <div className="section-header">
          <h2>🤖 Model Architecture</h2>
        </div>
        <div className="model-details">
          <div className="detail-card">
            <h3>Base Model</h3>
            <p><strong>ResNet-18</strong> - Pre-trained on ImageNet</p>
            <p className="detail-text">Transfer learning approach using a proven architecture</p>
          </div>
          <div className="detail-card">
            <h3>Training Method</h3>
            <p><strong>Transfer Learning</strong> with Fine-tuning</p>
            <p className="detail-text">Leverages pre-trained weights and adapts to medicine classification</p>
          </div>
          <div className="detail-card">
            <h3>Input Processing</h3>
            <p><strong>224x224 pixels</strong> RGB images</p>
            <p className="detail-text">Normalized and resized for optimal model performance</p>
          </div>
          <div className="detail-card">
            <h3>Output</h3>
            <p><strong>Binary Classification</strong></p>
            <p className="detail-text">Authentic or Counterfeit with confidence scores</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="section-header">
          <h2>🏗️ System Architecture</h2>
        </div>
        <div className="architecture-flow">
          <div className="flow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Frontend (Next.js)</h3>
              <p>Port 3000 - User interface for image upload and results display</p>
            </div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Backend API (Express.js)</h3>
              <p>Port 5000 - Authentication, user management, and service orchestration</p>
            </div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>ML Service (FastAPI)</h3>
              <p>Port 8000 - ResNet-18 model inference for classification</p>
            </div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Gemini Vision API</h3>
              <p>AI-powered image analysis and chat functionality</p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="section-header">
          <h2>⚙️ How It Works</h2>
        </div>
        <div className="workflow">
          <div className="workflow-step">
            <div className="workflow-icon">📤</div>
            <h3>1. Image Upload</h3>
            <p>User uploads a medicine packaging image through the web interface</p>
          </div>
          <div className="workflow-step">
            <div className="workflow-icon">🔍</div>
            <h3>2. Classification</h3>
            <p>Image is sent to ML service where ResNet-18 model analyzes it and returns authenticity prediction with confidence score</p>
          </div>
          <div className="workflow-step">
            <div className="workflow-icon">💬</div>
            <h3>3. AI Chat (Optional)</h3>
            <p>User can ask questions about the medicine. Gemini Vision API analyzes the image and provides detailed insights using the classification results</p>
          </div>
          <div className="workflow-step">
            <div className="workflow-icon">📊</div>
            <h3>4. Results Display</h3>
            <p>Classification results, confidence scores, and AI responses are displayed to the user in real-time</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="section-header">
          <h2>🛠️ Technology Stack</h2>
        </div>
        <div className="tech-stack">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>Next.js 14+ with App Router</li>
              <li>React 18+ with Hooks</li>
              <li>Client-side routing</li>
              <li>Axios for API calls</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Node.js with Express.js</li>
              <li>MongoDB for data storage</li>
              <li>JWT for authentication</li>
              <li>Mongoose for ODM</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>ML Service</h3>
            <ul>
              <li>Python 3.10+</li>
              <li>FastAPI for REST API</li>
              <li>PyTorch for deep learning</li>
              <li>ResNet-18 architecture</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>AI Integration</h3>
            <ul>
              <li>Google Gemini Vision API</li>
              <li>Model fallback strategy</li>
              <li>Rate limiting & queuing</li>
              <li>Medical compliance prompts</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const [imageId, setImageId] = useState(null);
  const [authenticity, setAuthenticity] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('classify');

  const handleImageProcessed = async (file) => {
    if (activeTab === 'rag') {
      setProcessingImage(true);
      try {
        const response = await ragAPI.uploadImage(file);
        setImageId(response.imageId);
        setAuthenticity(response.authenticity);
        setActiveTab('rag');
      } catch (error) {
        console.error('Error processing image for RAG:', error);
        alert('Failed to process image for RAG. Please try again.');
      } finally {
        setProcessingImage(false);
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="home-container">
        <header className="home-header">
          <div className="header-content">
            <h1>Counterfeit Medicine Detector</h1>
            <p className="welcome-text">
              Welcome, {user?.firstName || user?.userName || 'User'}!
            </p>
          </div>
        </header>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'classify' ? 'active' : ''}`}
            onClick={() => setActiveTab('classify')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Classification
          </button>
          <button
            className={`tab-button ${activeTab === 'rag' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            AI Chat (RAG)
          </button>
          <button
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            About Project
          </button>
        </div>

        <main className="home-main">
          {activeTab === 'classify' && (
            <div className="tab-content">
              <UploadComponent />
            </div>
          )}

          {activeTab === 'rag' && (
            <div className="tab-content rag-tab">
              <div className="rag-layout">
                <div className="rag-upload-section">
                  <h3>Step 1: Upload Medicine Image</h3>
                  <UploadComponent onProcessForRAG={handleImageProcessed} />
                  {processingImage && (
                    <div className="processing-indicator">
                      Processing image for RAG...
                    </div>
                  )}
                </div>

                {imageId && authenticity && (
                  <div className="rag-chat-section">
                    <h3>Step 2: Ask Questions</h3>
                    <RAGChat imageId={imageId} authenticity={authenticity} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="tab-content about-tab">
              <ProjectInfo />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
