document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.speed-buttons button');
    const customSpeedInput = document.getElementById('customSpeed');
    const setCustomSpeedButton = document.getElementById('setCustomSpeed');
    const speedUpButton = document.getElementById('speedUp');
    const speedDownButton = document.getElementById('speedDown');
    const status = document.getElementById('status');
    const SPEED_STEP = 0.10;
    const MIN_SPEED = 0.1;
    const MAX_SPEED = 16.0;

    // Add handlers for speed toggle buttons
    speedUpButton.addEventListener('click', () => {
        let currentSpeed = parseFloat(customSpeedInput.value) || 1.0;
        currentSpeed = Math.min(MAX_SPEED, Math.round((currentSpeed + SPEED_STEP) * 100) / 100);
        customSpeedInput.value = currentSpeed.toFixed(2);
    });

    speedDownButton.addEventListener('click', () => {
        let currentSpeed = parseFloat(customSpeedInput.value) || 1.0;
        currentSpeed = Math.max(MIN_SPEED, Math.round((currentSpeed - SPEED_STEP) * 100) / 100);
        customSpeedInput.value = currentSpeed.toFixed(2);
    });

    // Check if we're on a YouTube page with video
    function checkYouTubeVideo() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0]?.url?.includes('youtube.com')) {
                showStatus('Please navigate to a YouTube video', 'error');
                disableControls(true);
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: 'checkVideo'}, (response) => {
                if (chrome.runtime.lastError) {
                    showStatus('Unable to connect to YouTube page', 'error');
                    disableControls(true);
                    return;
                }

                if (!response?.hasVideo) {
                    showStatus('No video found on page', 'error');
                    disableControls(true);
                    return;
                }

                disableControls(false);
                getCurrentSpeed();
            });
        });
    }

    // Get current speed and highlight active button
    function getCurrentSpeed() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getSpeed'}, (response) => {
                if (chrome.runtime.lastError) {
                    showStatus('Unable to get current speed', 'error');
                    return;
                }

                if (response?.success && response?.speed) {
                    highlightButton(response.speed);
                    customSpeedInput.value = response.speed.toFixed(2);
                }
            });
        });
    }

    // Add click handlers to speed buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseFloat(button.dataset.speed);
            setSpeed(speed);
        });
    });

    // Add handler for custom speed input
    setCustomSpeedButton.addEventListener('click', () => {
        const speed = parseFloat(customSpeedInput.value);
        if (isValidSpeed(speed)) {
            setSpeed(speed);
        } else {
            showStatus('Please enter a valid speed (0.1 to 16)', 'error');
        }
    });

    // Add enter key handler for custom speed input
    customSpeedInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const speed = parseFloat(customSpeedInput.value);
            if (isValidSpeed(speed)) {
                setSpeed(speed);
            } else {
                showStatus('Please enter a valid speed (0.1 to 16)', 'error');
            }
        }
    });

    function setSpeed(speed) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {action: 'setSpeed', speed: speed},
                (response) => {
                    if (chrome.runtime.lastError) {
                        showStatus('Unable to set speed', 'error');
                        return;
                    }

                    if (response?.success) {
                        highlightButton(speed);
                        customSpeedInput.value = speed.toFixed(2);
                        showStatus(`Speed set to ${speed}x`, 'success');
                    } else {
                        showStatus(response?.error || 'Error setting speed', 'error');
                    }
                }
            );
        });
    }

    function isValidSpeed(speed) {
        return !isNaN(speed) && speed >= MIN_SPEED && speed <= MAX_SPEED;
    }

    function highlightButton(speed) {
        buttons.forEach(button => {
            button.classList.remove('active');
            if (parseFloat(button.dataset.speed) === speed) {
                button.classList.add('active');
            }
        });
    }

    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.className = 'status ' + type;
        if (type !== 'error') {
            setTimeout(() => {
                status.textContent = '';
                status.className = 'status';
            }, 2000);
        }
    }

    function disableControls(disabled) {
        buttons.forEach(button => button.disabled = disabled);
        customSpeedInput.disabled = disabled;
        setCustomSpeedButton.disabled = disabled;
        speedUpButton.disabled = disabled;
        speedDownButton.disabled = disabled;
    }

    // Initialize
    checkYouTubeVideo();
});
