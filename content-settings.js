// Load the fonts
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    @font-face {
        font-family: 'Epilogue-Regular';
        src: url('${chrome.runtime.getURL('fonts/static/Epilogue-Regular.ttf')}') format('truetype');
    }

    @font-face {
        font-family: 'Epilogue-Light';
        src: url('${chrome.runtime.getURL('fonts/static/Epilogue-Light.ttf')}') format('truetype');
    }

    @font-face {
        font-family: 'Epilogue-ExtraLight';
        src: url('${chrome.runtime.getURL('fonts/static/Epilogue-ExtraLight.ttf')}') format('truetype');
    }

    @font-face {
        font-family: 'PoiretOne-Regular';
        src: url('${chrome.runtime.getURL('fonts/PoiretOne-Regular.ttf')}') format('truetype');
    }
`;
document.head.appendChild(styleElement);

// Create the dialog element for the settings
 const canvasWrapper = document.createElement('dialog');
 canvasWrapper.id = 'setting-popup';
 canvasWrapper.classList.add('setting-popup-container');
 
 canvasWrapper.innerHTML = `
     <div class="setting-popup">
         <button id="exit" class="exit-btn">
             <img src="${chrome.runtime.getURL('icons/exit.svg')}">
         </button>
         <div class="header-setting">
             <h1>Settings</h1>
         </div>
         <div id="camera-container" class="camera-container">
             <div id="check-icon" class="check-icon hide-check">
                 <img src="${chrome.runtime.getURL('icons/check.svg')}">
             </div>
             <canvas id="canvas" class="camera" width="260" height="260"></canvas>
             <div class="edit-prof">
                 <p id="username">KurtyKurt13</p>
                 <button class="edit" id="edit"><img src="${chrome.runtime.getURL('icons/pencil.svg')}"></button>
             </div>
         </div>
         <div class="camera-message">
             <p>Adjust your posture</p>
         </div>
         <div class="settings">
             <div class="sound">
                 <p>Sound (<span id="sound_perc"></span>)</p>
                 <label class="soundL">
                     <input type="range" id="volumeSlider" min="0" max="1" step="0.1">
                 </label>
             </div>
             <div class="sensitivity">
                 <p>Sensitivity (<span id="sensitivity_perc"></span>)</p>
                 <label class="sensitivityL">
                     <input type="range" id="sensitivity" min="0.5" max="0.95" step="0.01">
                 </label>
             </div>
         </div>
         <div class="button-section">
             <button id="back" class="back">
                 Back
             </button>
             <button id="save" class="save">
                 Save
             </button>
         </div>
     </div>
 `;
 

    document.body.appendChild(canvasWrapper);  

    // Get the settings dialog
    const settingsDialog = document.getElementById("setting-popup");


    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "toggleSettings") {
            if (settingsDialog) {
                if (settingsDialog.open) {
                    settingsDialog.close(); // Close if already open
                } else {
                    settingsDialog.showModal(); // Open as modal
                }
            }
        }
    });


// Load settings from chrome.storage
chrome.storage.sync.get(['preferences'], (result) => {
    let preferences = result.preferences || {
        profile: 'user123',
        sound: 1,
        sensitivity: 0.8
    };

    // Get DOM elements
    const usernameField = document.getElementById('username');
    const editButton = document.getElementById('edit'); // Edit button
    const volumeSlider = document.getElementById('volumeSlider');
    const sensitivitySlider = document.getElementById('sensitivity');
    const backButton = document.getElementById("back");
    const exitButton = document.getElementById("exit");
    const saveButton = document.getElementById("save");

    const soundPercent = document.getElementById('sound_perc');
    const sensitivityPercent = document.getElementById('sensitivity_perc');

    // Set initial values
    usernameField.innerText = preferences.profile;
    volumeSlider.value = preferences.sound;
    sensitivitySlider.value = preferences.sensitivity;


    // Update the displayed percentage for sound and sensitivity
    function updateDisplayedPercentages() {
        soundPercent.innerText = `${Math.round(volumeSlider.value * 100)}%`;
        sensitivityPercent.innerText = `${Math.round(sensitivitySlider.value * 100)}%`;
    }

    // Initial update of displayed percentages
    updateDisplayedPercentages();

    // Add event listeners to update percentages dynamically
    volumeSlider.addEventListener('input', updateDisplayedPercentages);
    sensitivitySlider.addEventListener('input', updateDisplayedPercentages);




    // Function to update save button state
    function updateSaveButtonState() {
        if (volumeSlider.value != preferences.sound || 
            sensitivitySlider.value != preferences.sensitivity || 
            usernameField.innerText.trim() !== preferences.profile) {
            saveButton.classList.add('save-active');
        } else {
            saveButton.classList.remove('save-active');
        }
    }

    // Enable editing when the edit button is clicked
    editButton.addEventListener("click", () => {
        usernameField.contentEditable = "true";
        usernameField.focus();
        usernameField.classList.add("editable"); // Optional styling
    });

    // Disable editing on blur (when clicking outside)
    usernameField.addEventListener("blur", () => {
        usernameField.contentEditable = "false";
        usernameField.classList.remove("editable");
        updateSaveButtonState();
    });

    // Allow pressing Enter to save and exit edit mode
    usernameField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents a new line from being added
            usernameField.blur();
        }
    });

    // Add event listeners for save button state update
    volumeSlider.addEventListener('input', updateSaveButtonState);
    sensitivitySlider.addEventListener('input', updateSaveButtonState);
    usernameField.addEventListener('input', updateSaveButtonState);


    // Get the exit button
    exitButton.addEventListener("click", () => {
        settingsDialog.close();
    });


    // Save button click event
    saveButton.addEventListener("click", (e) => {
        if (!saveButton.classList.contains("save-active")) {
            e.preventDefault();
        } else {
            preferences.profile = usernameField.innerText.trim();
            preferences.sound = parseFloat(volumeSlider.value);
            preferences.sensitivity = parseFloat(sensitivitySlider.value);

            chrome.storage.sync.set({ preferences }, () => {
                saveButton.classList.remove("save-active");
                settingsDialog.close();
                console.log(preferences);
            });
        }
    });


    // Get the back button
    backButton.addEventListener("click", () => {
        settingsDialog.close();
    });

   
});


  

    
