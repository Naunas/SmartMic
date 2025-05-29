const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, ...args) => {
        // Whitelist channels
        const validChannels = [
          'start-recording',
          'stop-recording',
          'get-recording-status',
          'process-audio',
          'process-query',
          'get-audio-devices',
          'set-audio-device'
        ];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Unauthorized IPC channel: ${channel}`);
      },
      on: (channel, func) => {
        // Whitelist channels
        const validChannels = [
          'recording-started',
          'recording-stopped',
          'recording-saved',
          'recording-error',
          'audio-level-updated'
        ];
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      removeAllListeners: (channel) => {
        const validChannels = [
          'recording-started',
          'recording-stopped',
          'recording-saved',
          'recording-error',
          'audio-level-updated'
        ];
        if (validChannels.includes(channel)) {
          ipcRenderer.removeAllListeners(channel);
        }
      }
    }
  }
); 