document.addEventListener("DOMContentLoaded", () => {
    const toggleParameters = document.getElementById("toggleParameters");
    const toggleStart = document.getElementById("toggleStart");

    // Load the saved state from storage
    chrome.storage.sync.get(["showParameters", "startNow"], (data) => {
        toggleParameters.checked = data.showParameters ?? true; // Default: ON
        toggleStart.checked = data.startNow ?? false; // Default: OFF
    });

    // Function to handle toggle changes
    function handleToggleChange(toggle, key) {
        chrome.storage.sync.set({ [key]: toggle.checked });
        chrome.runtime.sendMessage({ action: key, state: toggle.checked });
    }

    toggleParameters.addEventListener("change", () => handleToggleChange(toggleParameters, "showParameters"));
    toggleStart.addEventListener("change", () => {
        handleToggleChange(toggleStart, "startNow");
        if (!toggleStart.checked) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.reload(tabs[0].id);
            });
        }
    });
});
