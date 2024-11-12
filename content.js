// YouTube Speed Enhancer - Content Script
(() => {
    let currentSpeed = 1.0;
    const SPEEDS = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

    // Load saved speed from storage
    chrome.storage.local.get(['youtubeSpeed'], (result) => {
        if (result.youtubeSpeed) {
            currentSpeed = result.youtubeSpeed;
        }
    });

    // Initialize speed controls
    function initSpeedControls() {
        const video = document.querySelector('video');
        if (!video) return;

        // Set initial speed
        video.playbackRate = currentSpeed;

        // Override YouTube's playback rate setter
        const originalPlaybackRate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
        Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
            get: function() {
                return originalPlaybackRate.get.call(this);
            },
            set: function(speed) {
                currentSpeed = speed;
                chrome.storage.local.set({ youtubeSpeed: speed });
                originalPlaybackRate.set.call(this, speed);
            }
        });

        // Listen for speed change messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'setSpeed') {
                video.playbackRate = request.speed;
                sendResponse({ success: true });
            }
            if (request.action === 'getSpeed') {
                sendResponse({ speed: video.playbackRate });
            }
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
        const speedItems = document.querySelectorAll('.ytp-menuitem');
        speedItems.forEach(item => {
            if (item.textContent.includes('Playback speed')) {
                const panel = item.querySelector('.ytp-menuitem-content');
                if (panel) {
                    panel.textContent = `${currentSpeed}×`;
                }
            }
        });
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
