document.addEventListener("DOMContentLoaded", () => {
    const toggleParameters = document.getElementById("toggleParameters");
    const toggleStart = document.getElementById("toggleStart");
    const toggleSettings = document.getElementById("toggleSettings");

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

    toggleSettings.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSettings" });
            }
        });
    });


    function updateProgress() {
        chrome.storage.sync.get("day", (data) => {
            const currentProgress = document.getElementById("current-record");
    
            let day = data.day || {};
            let today = new Date().toLocaleDateString("en-US"); // Get today's date in MM/DD/YYYY format
            let seconds = day[today] || 0; // Ensure today's value starts at 0 seconds
    
            // Convert seconds to HH:MM:SS format
            let hrs = Math.floor(seconds / 3600);
            let mins = Math.floor((seconds % 3600) / 60);
            let secs = seconds % 60;
            let formattedTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
            currentProgress.innerHTML = formattedTime;
        });
    }
    
    // Call updateProgress initially and update every second
    updateProgress();
    setInterval(updateProgress, 1000);



    function updateAchievements() {
        chrome.storage.sync.get(["progress"], (data) => {
            let progress = data.progress || {
                highest_record: 0,
                highest_streak: 0,
                current_streak: 0,
                current_record: 0,
                lastDate: null
            };

            const streak = document.getElementById("streak");
            streak.innerHTML = progress.current_streak;
        });
    }

    updateAchievements();
    
});

