document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    const status = document.getElementById('status');

    // Get current speed and highlight active button
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getSpeed'}, (response) => {
            if (response && response.speed) {
                highlightButton(response.speed);
            }
        });
    });

    // Add click handlers to speed buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseFloat(button.dataset.speed);
            
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: 'setSpeed', speed: speed},
                    (response) => {
                        if (response && response.success) {
                            highlightButton(speed);
                            showStatus(`Speed set to ${speed}x`);
                        } else {
                            showStatus('Error setting speed');
                        }
                    }
                );
            });
        });
    });

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
