// YouTube Speed Enhancer - Content Script
(() => {
    let currentSpeed = 1.0;
    const MIN_SPEED = 0.1;
    const MAX_SPEED = 16.0;
    let videoInitialized = false;

    // Load saved speed from storage
    chrome.storage.local.get(['youtubeSpeed'], (result) => {
        if (result.youtubeSpeed) {
            currentSpeed = result.youtubeSpeed;
            initSpeedControls();
        }
    });

    // Initialize speed controls
    function initSpeedControls() {
        const video = document.querySelector('video');
        if (!video) {
            videoInitialized = false;
            return;
        }

        videoInitialized = true;
        // Set initial speed
        video.playbackRate = currentSpeed;

        // Override YouTube's playback rate setter
        const originalPlaybackRate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
        Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
            get: function() {
                return originalPlaybackRate.get.call(this);
            },
            set: function(speed) {
                try {
                    if (speed >= MIN_SPEED && speed <= MAX_SPEED) {
                        currentSpeed = speed;
                        chrome.storage.local.set({ youtubeSpeed: speed });
                        originalPlaybackRate.set.call(this, speed);
                    }
                } catch (error) {
                    console.error('Error setting playback rate:', error);
                }
            }
        });

        // Listen for speed change messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                const video = document.querySelector('video');
                if (!video) {
                    sendResponse({ 
                        success: false, 
                        error: 'No video element found on page'
                    });
                    return;
                }

                if (request.action === 'setSpeed') {
                    if (request.speed >= MIN_SPEED && request.speed <= MAX_SPEED) {
                        video.playbackRate = request.speed;
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Speed must be between 0.1x and 16x'
                        });
                    }
                }
                else if (request.action === 'getSpeed') {
                    sendResponse({ 
                        success: true,
                        speed: video.playbackRate 
                    });
                }
                else if (request.action === 'checkVideo') {
                    sendResponse({ 
                        success: true,
                        hasVideo: Boolean(video)
                    });
                }
            } catch (error) {
                console.error('Error handling message:', error);
                sendResponse({ 
                    success: false, 
                    error: 'Internal extension error'
                });
            }
            return true; // Keep the message channel open for async response
        });

        // Modify YouTube's speed menu
        const observer = new MutationObserver((mutations) => {
            const speedMenu = document.querySelector('.ytp-settings-menu');
            if (speedMenu && speedMenu.style.display !== 'none') {
                updateSpeedMenu();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Update YouTube's speed menu to include new options
    function updateSpeedMenu() {
        try {
            const speedItems = document.querySelectorAll('.ytp-menuitem');
            speedItems.forEach(item => {
                if (item.textContent.includes('Playback speed')) {
                    const panel = item.querySelector('.ytp-menuitem-content');
                    if (panel) {
                        panel.textContent = `${currentSpeed}×`;
                    }
                }
            });
        } catch (error) {
            console.error('Error updating speed menu:', error);
        }
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpeedControls);
    } else {
        initSpeedControls();
    }

    // Re-initialize on navigation (for YouTube's SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(initSpeedControls, 1000);
        }
    }).observe(document, { subtree: true, childList: true });
})();
