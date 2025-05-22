import React, { useState, useEffect } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [recordingStatus, setRecordingStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check initial recording status
    checkRecordingStatus();

    // Set up event listeners
    window.electron.ipcRenderer.on('recording-started', (data) => {
      setIsRecording(true);
      setError(null);
      setRecordingStatus(data);
    });

    window.electron.ipcRenderer.on('recording-stopped', (data) => {
      setIsRecording(false);
      setError(null);
      setRecordingStatus(data);
    });

    window.electron.ipcRenderer.on('recording-saved', (data) => {
      setRecordingStatus(prev => ({
        ...prev,
        recordingPath: data.recordingPath
      }));
    });

    window.electron.ipcRenderer.on('recording-error', (data) => {
      setError(data.error);
    });

    return () => {
      // Clean up event listeners
      window.electron.ipcRenderer.removeAllListeners('recording-started');
      window.electron.ipcRenderer.removeAllListeners('recording-stopped');
      window.electron.ipcRenderer.removeAllListeners('recording-saved');
      window.electron.ipcRenderer.removeAllListeners('recording-error');
    };
  }, []);

  const checkRecordingStatus = async () => {
    const status = await window.electron.ipcRenderer.invoke('get-recording-status');
    setIsRecording(status.isRecording);
    setRecordingStatus(status);
  };

  const toggleRecording = async () => {
    try {
      setError(null);
      if (!isRecording) {
        const result = await window.electron.ipcRenderer.invoke('start-recording');
        if (!result.success) {
          setError(result.error);
        }
      } else {
        const result = await window.electron.ipcRenderer.invoke('stop-recording');
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuery = async () => {
    if (query.trim()) {
      try {
        const result = await window.electron.ipcRenderer.invoke('process-query', query);
        if (result.success) {
          setResponse(result.response);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="app-container fade-in">
      <header className="app-header">
        <div className="nav-container">
          <div className="nav-brand">Smart <span className="brand-accent">Mic AI</span></div>
          <button 
            className={`btn-primary record-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            <svg className="mic-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <main className="app-main">
        <section className="transcription-section">
          <div className="section-header">
            <h2>Live Transcription</h2>
            <div className="feature-tag">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Real-Time
            </div>
          </div>
          <div className="transcription-box">
            {transcription || 'Waiting for audio...'}
          </div>
          {recordingStatus?.recordingPath && (
            <div className="recording-status">
              <p>Recording saved to: {recordingStatus.recordingPath}</p>
            </div>
          )}
        </section>

        <section className="query-section">
          <div className="section-header">
            <h2>Ask a Question</h2>
            <div className="feature-tag">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              AI-Powered
            </div>
          </div>
          <div className="query-input">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question here..."
            />
            <button className="btn-primary" onClick={handleQuery}>Ask</button>
          </div>
          {response && (
            <div className="response-box">
              <h3>Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App; 