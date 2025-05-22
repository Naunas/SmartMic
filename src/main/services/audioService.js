const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class AudioService {
  constructor() {
    this.isRecording = false;
    this.recordingPath = null;
    this.ensureRecordingDirectory();
  }

  ensureRecordingDirectory() {
    const userDataPath = app.getPath('userData');
    this.recordingsDir = path.join(userDataPath, 'recordings');
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }
  }

  async startRecording(mainWindow) {
    if (this.isRecording) {
      return { success: false, error: 'Recording is already in progress' };
    }

    try {
      // Request microphone access through the renderer process
      await mainWindow.webContents.executeJavaScript(`
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            window.audioStream = stream;
            window.mediaRecorder = new MediaRecorder(stream);
            window.audioChunks = [];
            
            window.mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                window.audioChunks.push(event.data);
              }
            };

            window.mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(window.audioChunks, { type: 'audio/wav' });
              const buffer = await audioBlob.arrayBuffer();
              window.electron.ipcRenderer.send('save-recording', buffer);
            };

            window.mediaRecorder.start();
            return true;
          })
          .catch(error => {
            console.error('Error accessing microphone:', error);
            return false;
          });
      `);

      this.isRecording = true;
      return {
        success: true,
        message: 'Recording started'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to start recording: ${error.message}`
      };
    }
  }

  stopRecording(mainWindow) {
    if (!this.isRecording) {
      return {
        success: false,
        error: 'No recording in progress'
      };
    }

    try {
      mainWindow.webContents.executeJavaScript(`
        if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
          window.mediaRecorder.stop();
          if (window.audioStream) {
            window.audioStream.getTracks().forEach(track => track.stop());
          }
        }
      `);

      this.isRecording = false;
      return {
        success: true,
        message: 'Recording stopped'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to stop recording: ${error.message}`
      };
    }
  }

  saveRecording(buffer) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.recordingPath = path.join(this.recordingsDir, `recording-${timestamp}.wav`);
      fs.writeFileSync(this.recordingPath, Buffer.from(buffer));
      return {
        success: true,
        recordingPath: this.recordingPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save recording: ${error.message}`
      };
    }
  }

  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      recordingPath: this.recordingPath
    };
  }
}

module.exports = new AudioService(); 