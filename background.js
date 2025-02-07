// Listen for tab updates to reinject the script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.storage.sync.get(["startNow"], (data) => {
            if (data.startNow) {
                chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["content.js"]
                }).catch((error) => console.error("Script injection failed:", error));
            }
        });
    }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startNow") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                if (message.state) {
                    // Save state and inject script
                    chrome.storage.sync.set({ startNow: true });
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ["content.js"]
                    }).catch((error) => console.error("Script injection failed:", error));
                } else {
                    // Save state and remove script
                    chrome.storage.sync.set({ startNow: false });
                    chrome.tabs.sendMessage(tabs[0].id, { action: "stopScript" });
                }
            }
        });
    }
});

// Check storage on startup and inject script if needed
chrome.storage.sync.get(["startNow"], (data) => {
    if (data.startNow) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ["content.js"]
                }).catch((error) => console.error("Script injection failed:", error));
            }
        });
    }
});
