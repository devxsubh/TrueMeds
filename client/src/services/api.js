const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function classifyImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/classify`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return await response.json()
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) throw new Error('Health check failed')
  return await response.json()
}

