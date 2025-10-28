const DEFAULT_URL = "https://www.multimango.com/tasks";

// Runs once when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage if it's the very first run
  chrome.storage.local.get(null, (data) => {
    if (data.dailyStats === undefined) {
      chrome.storage.local.set({
        trackedUrl: DEFAULT_URL,
        dailyStats: { timeSpent: 0, tasksCompleted: 0 },
        last5Days: []
      });
    }
  });
  // Create the daily alarm for data reset
  createDailyResetAlarm();
  // Initial setup of content script
  setupContentScript();
});

// Function to create an alarm that triggers every day at midnight IST
function createDailyResetAlarm() {
  chrome.alarms.create("dailyReset", {
    when: getNextMidnightIST(),
    periodInMinutes: 24 * 60 // Repeat every 24 hours
  });
}

// Calculates the timestamp for the next midnight in Indian Standard Time
function getNextMidnightIST() {
  const now = new Date();
  // Get a date object representing the current time in IST
  const todayIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const tomorrowIST = new Date(todayIST);
  tomorrowIST.setDate(tomorrowIST.getDate() + 1);
  tomorrowIST.setHours(0, 0, 0, 0); // Set to midnight
  
  // Convert the target IST time back to the user's local timezone's equivalent timestamp
  // This is a simplified way to ensure the alarm triggers correctly relative to IST midnight
  const offset = todayIST.getTimezoneOffset() + 330; // Difference from UTC and IST
  const nextMidnightLocal = new Date(tomorrowIST.getTime() + offset * 60 * 1000);
  
  return nextMidnightLocal.getTime();
}

// Listener for when any alarm goes off
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "dailyReset") {
    chrome.storage.local.get(["dailyStats", "last5Days"], data => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Format the date as DD/MM/YYYY
      const formattedDate = yesterday.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Add yesterday's stats to the history and keep only the last 5 records
      const newHistory = [{ date: formattedDate, ...data.dailyStats }, ...data.last5Days].slice(0, 5);
      
      // Reset today's stats and update the history
      chrome.storage.local.set({
        dailyStats: { timeSpent: 0, tasksCompleted: 0 },
        last5Days: newHistory
      });
    });
  }
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTrackedUrl") {
    setupContentScript();
    return; // No response needed
  }
  chrome.storage.local.get("dailyStats", data => {
    let stats = data.dailyStats || { timeSpent: 0, tasksCompleted: 0 };
    
    switch (request.action) {
      case "incrementTaskCount":
        stats.tasksCompleted += 1;
        break;
      case "addSessionTime":
        stats.timeSpent += request.time;
        break;
    }
    
    chrome.storage.local.set({ dailyStats: stats });
    sendResponse({ updatedStats: stats }); // Send back the updated stats
  });
  return true; // Indicates that the response is sent asynchronously
});

// --- Dynamic Content Script Injection ---

async function setupContentScript() {
  // First, unregister any existing content scripts to avoid duplicates
  try {
    const oldScripts = await chrome.scripting.getRegisteredContentScripts();
    if (oldScripts.length > 0) {
      const oldScriptIds = oldScripts.map(script => script.id);
      await chrome.scripting.unregisterContentScripts({ ids: oldScriptIds });
    }
  } catch (e) {
    console.error("Error unregistering content scripts:", e);
  }

  // Get the tracked URL from storage
  chrome.storage.local.get("trackedUrl", async (data) => {
    const urlToTrack = data.trackedUrl || DEFAULT_URL;
    
    // Register the new content script
    try {
      await chrome.scripting.registerContentScripts([{
        id: "multimango-content-script",
        js: ["content.js"],
        matches: [urlToTrack],
        runAt: "document_idle"
      }]);
      console.log("Content script registered for:", urlToTrack);
    } catch (e) {
      console.error("Error registering content script:", e);
    }
  });
}

// Listen for startup to ensure the content script is registered
chrome.runtime.onStartup.addListener(setupContentScript);