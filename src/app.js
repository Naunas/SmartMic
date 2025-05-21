class SmartMic {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcript = '';
        this.setupSpeechRecognition();
        this.createOverlayUI();
    }

    setupSpeechRecognition() {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser.');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            this.updateTranscript(finalTranscript, interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
        };
    }

    createOverlayUI() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'smart-mic-overlay';
        this.overlay.innerHTML = `
            <div class="smart-mic-container">
                <div class="smart-mic-header">
                    <div class="smart-mic-status">Smart Mic AI</div>
                    <button class="smart-mic-close">×</button>
                </div>
                <div class="smart-mic-content">
                    <div class="smart-mic-transcript"></div>
                </div>
                <div class="smart-mic-controls">
                    <button class="smart-mic-record">
                        <svg class="mic-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(this.overlay);

        // Add event listeners
        this.overlay.querySelector('.smart-mic-record').addEventListener('click', () => {
            this.toggleRecording();
        });

        this.overlay.querySelector('.smart-mic-close').addEventListener('click', () => {
            this.hideOverlay();
        });

        // Initially hide the overlay
        this.hideOverlay();
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (!this.recognition) return;
        
        this.isRecording = true;
        this.recognition.start();
        this.overlay.querySelector('.smart-mic-record').classList.add('recording');
        this.overlay.querySelector('.smart-mic-status').textContent = 'Recording...';
    }

    stopRecording() {
        if (!this.recognition) return;
        
        this.isRecording = false;
        this.recognition.stop();
        this.overlay.querySelector('.smart-mic-record').classList.remove('recording');
        this.overlay.querySelector('.smart-mic-status').textContent = 'Smart Mic AI';
    }

    updateTranscript(final, interim) {
        const transcriptElement = this.overlay.querySelector('.smart-mic-transcript');
        if (final) {
            this.transcript += final;
        }
        transcriptElement.innerHTML = this.transcript + 
            '<span class="interim">' + interim + '</span>';
    }

    showOverlay() {
        this.overlay.style.display = 'block';
    }

    hideOverlay() {
        this.overlay.style.display = 'none';
        this.stopRecording();
    }
}

// Initialize Smart Mic when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.smartMic = new SmartMic();
});
