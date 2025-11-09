import { useState } from 'react'
import { classifyImage } from '../services/api'

function UploadComponent() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await classifyImage(file)
      setResult(response)
    } catch (err) {
      setError(err.message || 'Classification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-box">
        <label htmlFor="file-input" className="file-label">
          Choose Image
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        {file && <p className="file-name">{file.name}</p>}
      </div>

      {preview && (
        <div className="preview-box">
          <img src={preview} alt="Preview" className="preview-img" />
        </div>
      )}

      <button onClick={handleSubmit} disabled={!file || loading} className="submit-btn">
        {loading ? 'Classifying...' : 'Classify'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-box">
          <h3>Prediction</h3>
          <p className="prediction-label">
            <strong>Label:</strong> {result.label}
          </p>
          <p className="prediction-confidence">
            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
          </p>
          <details>
            <summary>All Probabilities</summary>
            <ul>
              {Object.entries(result.probabilities).map(([label, prob]) => (
                <li key={label}>
                  {label}: {(prob * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  )
}

export default UploadComponent

