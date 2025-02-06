document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("toggleParameters");

    // Load the saved state from storage
    chrome.storage.sync.get(["showParameters"], (data) => {
        toggle.checked = data.showParameters ?? true; // Default: ON
    });

    // Save toggle state when changed
    toggle.addEventListener("change", () => {
        chrome.storage.sync.set({ showParameters: toggle.checked });
        notifyContentScript(toggle.checked);
    });
});

// Notify content script to update UI immediately
function notifyContentScript(state) {
    chrome.runtime.sendMessage({ showParameters: state });
}
