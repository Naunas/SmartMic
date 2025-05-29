const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const audioService = require('./services/audioService');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, load the local file
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle window state
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for audio processing
ipcMain.handle('get-audio-devices', async () => {
  return audioService.getAudioDevices();
});

ipcMain.handle('set-audio-device', async (event, deviceId) => {
  return audioService.setAudioDevice(deviceId);
});

ipcMain.handle('start-recording', async () => {
  try {
    const result = await audioService.startRecording(mainWindow);
    if (result.success) {
      mainWindow.webContents.send('recording-started', result);
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('stop-recording', async () => {
  try {
    const result = audioService.stopRecording(mainWindow);
    if (result.success) {
      mainWindow.webContents.send('recording-stopped', result);
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('get-recording-status', () => {
  return audioService.getRecordingStatus();
});

// Handle saving the recording from the renderer process
ipcMain.on('save-recording', async (event, buffer) => {
  const result = audioService.saveRecording(buffer);
  if (result.success) {
    mainWindow.webContents.send('recording-saved', result);
  } else {
    mainWindow.webContents.send('recording-error', result);
  }
});

// Placeholder for future audio processing with Whisper
ipcMain.handle('process-audio', async (event, audioPath) => {
  // TODO: Implement Whisper integration
  return {
    success: false,
    error: 'Audio processing not implemented yet'
  };
});

// Placeholder for future AI query processing
ipcMain.handle('process-query', async (event, query) => {
  // TODO: Implement AI query processing
  return {
    success: false,
    error: 'Query processing not implemented yet'
  };
});

// Handle audio level updates
ipcMain.on('audio-level-update', (event, level) => {
  audioService.updateAudioLevel(level);
  mainWindow.webContents.send('audio-level-updated', level);
}); 