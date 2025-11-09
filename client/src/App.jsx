import { useState } from 'react'
import UploadComponent from './components/UploadComponent'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Counterfeit Medicine Detector</h1>
        <p className="subtitle">Upload an image to classify authentic vs counterfeit medicine</p>
      </header>
      <main>
        <UploadComponent />
      </main>
    </div>
  )
}

export default App

