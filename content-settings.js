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
             <div class="check-icon">
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
                 <p>Sound</p>
                 <label class="soundL">
                     <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="1">
                 </label>
             </div>
             <div class="sensitivity">
                 <p>Sensitivity</p>
                 <label class="sensitivityL">
                     <input type="range" id="sensitivity" min="0.5" max="1" step="0.01" value="0.8">
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

    // Get the exit button
    const exitButton = document.getElementById("exit");
    exitButton.addEventListener("click", () => {
        settingsDialog.close();
    });

    // Get the save button
    const saveButton = document.getElementById("save");
    saveButton.addEventListener("click", () => {
        settingsDialog.close();
    });

    // Get the back button
    const backButton = document.getElementById("back");
    backButton.addEventListener("click", () => {
        settingsDialog.close();
    });


   

    
