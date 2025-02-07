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
