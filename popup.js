document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.speed-buttons button');
    const customSpeedInput = document.getElementById('customSpeed');
    const setCustomSpeedButton = document.getElementById('setCustomSpeed');
    const status = document.getElementById('status');

    // Get current speed and highlight active button
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getSpeed'}, (response) => {
            if (response && response.speed) {
                highlightButton(response.speed);
                customSpeedInput.value = response.speed;
            }
        });
    });

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
            showStatus('Please enter a valid speed (0.1 to 16)');
        }
    });

    // Add enter key handler for custom speed input
    customSpeedInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const speed = parseFloat(customSpeedInput.value);
            if (isValidSpeed(speed)) {
                setSpeed(speed);
            } else {
                showStatus('Please enter a valid speed (0.1 to 16)');
            }
        }
    });

    function setSpeed(speed) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {action: 'setSpeed', speed: speed},
                (response) => {
                    if (response && response.success) {
                        highlightButton(speed);
                        customSpeedInput.value = speed;
                        showStatus(`Speed set to ${speed}x`);
                    } else {
                        showStatus('Error setting speed');
                    }
                }
            );
        });
    }

    function isValidSpeed(speed) {
        return !isNaN(speed) && speed >= 0.1 && speed <= 16;
    }

    function highlightButton(speed) {
        buttons.forEach(button => {
            button.classList.remove('active');
            if (parseFloat(button.dataset.speed) === speed) {
                button.classList.add('active');
            }
        });
    }

    function showStatus(message) {
        status.textContent = message;
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    }
});
