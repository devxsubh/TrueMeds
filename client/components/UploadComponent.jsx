'use client';

import { useState, useRef } from 'react';
import { mlAPI } from '@/services/api';
import '@/styles/App.css';

function UploadComponent({ onProcessForRAG }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setFile(selectedFile)
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(selectedFile)
  }

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files?.[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    handleFileSelect(droppedFile)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await mlAPI.classify(file)
      // Handle both direct response and wrapped response
      const data = response.data || response
      setResult(data)
      
      // If onProcessForRAG callback is provided, call it with the file
      if (onProcessForRAG) {
        onProcessForRAG(file)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Classification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getResultColor = (label) => {
    return label?.toLowerCase() === 'authentic' ? '#10b981' : '#ef4444'
  }

  const getResultIcon = (label) => {
    return label?.toLowerCase() === 'authentic' ? '✓' : '✗'
  }

  return (
    <div className="upload-container">
      {/* Upload Area */}
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
          id="file-input"
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
            <h3 className="upload-title">Drag & Drop your image here</h3>
            <p className="upload-subtitle">or click to browse</p>
            <p className="upload-hint">Supports: JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="preview-wrapper">
            <img src={preview} alt="Preview" className="preview-image" />
            <button className="remove-image" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {preview && !result && (
        <div className="action-buttons">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="classify-btn"
          >
            {loading ? (
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

      {/* Results */}
      {result && (
        <div className="result-container">
          <div className="result-header">
            <h3>Classification Result</h3>
            <button className="reset-btn" onClick={handleReset}>
              Analyze Another
            </button>
          </div>
          
          <div className="result-card" style={{ borderColor: getResultColor(result.label) }}>
            <div className="result-badge" style={{ backgroundColor: getResultColor(result.label) }}>
              <span className="result-icon">{getResultIcon(result.label)}</span>
              <span className="result-label">{result.label?.charAt(0).toUpperCase() + result.label?.slice(1)}</span>
            </div>
            
            <div className="confidence-meter">
              <div className="confidence-header">
                <span>Confidence Level</span>
                <span className="confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${result.confidence * 100}%`,
                    backgroundColor: getResultColor(result.label)
                  }}
                ></div>
              </div>
            </div>

            <div className="probabilities">
              <h4>Probability Distribution</h4>
              <div className="probability-list">
                {Object.entries(result.probabilities || {}).map(([label, prob]) => (
                  <div key={label} className="probability-item">
                    <div className="probability-label">
                      <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                      <span className="probability-percent">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="probability-bar">
                      <div
                        className="probability-fill"
                        style={{
                          width: `${prob * 100}%`,
                          backgroundColor: label.toLowerCase() === 'authentic' ? '#10b981' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadComponent

