document.addEventListener('DOMContentLoaded', () => {
    const timeSpentElem = document.getElementById('time-spent');
    const tasksCompletedElem = document.getElementById('tasks-completed');
    const historyTableBody = document.querySelector('#history-table tbody');
    const trackedUrlInput = document.getElementById('tracked-url-input');
    const saveUrlBtn = document.getElementById('save-url-btn');
    const saveStatusElem = document.getElementById('save-status');

    // Session Timer elements
    const sessionTimeElem = document.getElementById('session-time');
    const startSessionBtn = document.getElementById('start-session-btn');
    const endSessionBtn = document.getElementById('end-session-btn');

    let sessionInterval;
    let sessionSeconds = 0;

    // --- Utility Functions ---

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    // --- Data Display Functions ---

    function updatePopup() {
        chrome.storage.local.get(['dailyStats', 'last5Days', 'trackedUrl'], (data) => {
            if (data.dailyStats) {
                timeSpentElem.textContent = formatTime(data.dailyStats.timeSpent);
                tasksCompletedElem.textContent = data.dailyStats.tasksCompleted;
            }
            if (data.last5Days) {
                updateHistory(data.last5Days);
            }
            if (data.trackedUrl) {
                trackedUrlInput.value = data.trackedUrl;
            }
        });
    }

    function updateHistory(history) {
        historyTableBody.innerHTML = '';
        if (history.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No history yet.</td></tr>';
            return;
        }
        history.forEach(day => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${day.date}</td>
                <td>${formatTime(day.timeSpent)}</td>
                <td>${day.tasksCompleted}</td>
            `;
            historyTableBody.appendChild(row);
        });
    }

    // --- Settings Functions ---

    function saveUrl() {
        const newUrl = trackedUrlInput.value.trim();
        if (newUrl) {
            try {
                // Basic validation
                new URL(newUrl);
                chrome.storage.local.set({ trackedUrl: newUrl }, () => {
                    saveStatusElem.textContent = 'URL saved!';
                    // Let background script know to update listeners
                    chrome.runtime.sendMessage({ action: "updateTrackedUrl" });
                    setTimeout(() => saveStatusElem.textContent = '', 2000);
                });
            } catch (error) {
                saveStatusElem.textContent = 'Invalid URL format.';
                saveStatusElem.style.color = 'var(--danger-color)';
                setTimeout(() => {
                    saveStatusElem.textContent = '';
                    saveStatusElem.style.color = 'var(--success-color)';
                }, 2000);
            }
        }
    }

    // --- Session Timer Functions ---

    function startSession() {
        startSessionBtn.style.display = 'none';
        endSessionBtn.style.display = 'flex';

        chrome.storage.local.get('sessionStartTime', (data) => {
            const startTime = data.sessionStartTime || Date.now();
            if (!data.sessionStartTime) {
                chrome.storage.local.set({ sessionStartTime: startTime });
            }

            sessionInterval = setInterval(() => {
                sessionSeconds = Math.floor((Date.now() - startTime) / 1000);
                sessionTimeElem.textContent = formatTime(sessionSeconds);
            }, 1000);
        });
    }

    function endSession() {
        clearInterval(sessionInterval);
        chrome.storage.local.get('sessionStartTime', (data) => {
            if (data.sessionStartTime) {
                const sessionDuration = Math.floor((Date.now() - data.sessionStartTime) / 1000);
                if (sessionDuration > 0) {
                    chrome.runtime.sendMessage({ action: "addSessionTime", time: sessionDuration }, () => {
                        updatePopup(); // Refresh stats after sending
                    });
                }
                chrome.storage.local.remove('sessionStartTime');
            }
        });

        sessionSeconds = 0;
        sessionTimeElem.textContent = formatTime(0);
        startSessionBtn.style.display = 'flex';
        endSessionBtn.style.display = 'none';
    }

    // --- Event Listeners ---

    saveUrlBtn.addEventListener('click', saveUrl);
    startSessionBtn.addEventListener('click', startSession);
    endSessionBtn.addEventListener('click', endSession);

    // Listen for storage changes to keep the popup updated
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            updatePopup();
        }
    });

    // --- Initialization ---

    // Check if a session is already running when the popup opens
    chrome.storage.local.get('sessionStartTime', (data) => {
        if (data.sessionStartTime) {
            startSession();
        }
    });

    updatePopup();
});