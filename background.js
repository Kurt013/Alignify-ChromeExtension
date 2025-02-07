// Listen for tab updates (page reloads)
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
      chrome.storage.sync.set({ startNow: message.state });

      chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
              if (tab.url && tab.id) {
                  if (message.state) {
                      // Inject content.js
                      chrome.scripting.executeScript({
                          target: { tabId: tab.id },
                          files: ["content.js"]
                      }).catch((error) => console.error("Script injection failed:", error));
                  } else {
                      // Refresh all tabs to remove content.js
                      chrome.tabs.reload(tab.id);
                  }
              }
          });
      });
  }
});

// Listen for tab switching and refresh the new tab if toggleStart is OFF
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.sync.get(["startNow"], (data) => {
      if (!data.startNow) {
          // Refresh the newly activated tab
          chrome.tabs.reload(activeInfo.tabId);
      } else {
          // Inject content.js into the new active tab
          chrome.scripting.executeScript({
              target: { tabId: activeInfo.tabId },
              files: ["content.js"]
          }).catch((error) => console.error("Script injection failed:", error));
      }
  });
});

// Check storage on startup and inject script if needed
chrome.storage.sync.get(["startNow"], (data) => {
  if (data.startNow) {
      chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
              chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ["content.js"]
              }).catch((error) => console.error("Script injection failed:", error));
          });
      });
  }
});
