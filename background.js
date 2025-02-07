chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startNow") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
              if (message.state) {
                  // Inject content.js script
                  chrome.scripting.executeScript({
                      target: { tabId: tabs[0].id },
                      files: ["content.js"]
                  }).catch((error) => console.error("Script injection failed:", error));
              } else {
                  // Send message to remove posture detection logic
                  chrome.tabs.sendMessage(tabs[0].id, { action: "stopScript" });
              }
          }
      });
  }
});
