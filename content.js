let model, webcam, ctx, labelContainer, maxPredictions, postureState = false; // postureState to track if posture is incorrect
let correctPostureDuration = 0; // Tracks the current record for the day
const today = new Date().toLocaleDateString("en-US"); // Format: MM/DD/YYYY

// // Add dummy data for testing
// chrome.storage.sync.get("day", (data) => {
//     let day = data.day || {};

//     // Add previous dates with corresponding data
//     const previousDates = {
//         "02/04/2024": 60,
//         "02/06/2024": 120,
//         "02/07/2024": 30
//     };

//     // Loop through the object and add the data to the `day` object
//     for (let date in previousDates) {
//         day[date] = previousDates[date];
//     }

//     // Save the updated `day` object in chrome storage
//     chrome.storage.sync.set({ day }, () => {
//         console.log("Previous dates with corresponding data have been added:", day);
//     });
// });





// chrome.storage.sync.get("day", (data) => {
//     let day = data.day || {};
//     day[today] = 2 * 60 * 60; // 2 hours in seconds
//     chrome.storage.sync.set({ day });
//     console.log("Day data set to 2 hours in seconds:", day);
// });

// chrome.storage.sync.get("day", (data) => {
//     let day = data.day || {};
//     let previousDate = Object.keys(day).pop(); // Get the last date recorded

//     if (previousDate) {
//         let prevDate = new Date(previousDate).toLocaleDateString("en-US"); // Format previous date to MM/DD/YYYY

//         // Check if the previous date is exactly one day before today
//         let previousDay = new Date(today);
//         previousDay.setDate(previousDay.getDate() - 1); // Subtract one day

//         if (prevDate === previousDay.toLocaleDateString("en-US")) {
//             progress.current_streak++;
//         } else if (today !== prevDate) {
//             progress.current_streak = 0; // Reset streak if it's a new day and not consecutive
//         }
//     } else {
//         progress.current_streak = 0; // Initialize streak if no previous date exists
//     }

//     // Save the updated streak back to storage
//     chrome.storage.sync.set({ "day": day }, () => {
//         console.log("Streak updated!");
//     });
// });

// setInterval(() => {
//         chrome.storage.sync.get("progress", (data) => {
//             let progress = data.progress || {
//                 highest_record: 0,
//                 highest_streak: 0,
//                 current_streak: 0,
//                 current_record: 0
//             };

//         });
// }, 1000); // Runs every 1 second



console.log("Initializing the model...");

async function init() {
    const modelURL = chrome.runtime.getURL('my_model/model.json');
    const metadataURL = chrome.runtime.getURL('my_model/metadata.json');

    // Create the audio element
    const audioElement = document.createElement('audio');
    audioElement.src = chrome.runtime.getURL('./assets/notif_sound.mp3');
    audioElement.id = 'alertSound';
    document.body.appendChild(audioElement);
    
    const popupElement = document.createElement('dialog');
    const warningLogo = chrome.runtime.getURL('./icons/warning.svg');


    popupElement.id = 'notif-popup';
    popupElement.className = 'popup-container';
    popupElement.innerHTML = `
        <div class="notif-popup">
            <div class="icon">
                <img src="${warningLogo}" alt="Warning Icon">
            </div>
            <div class="content">
                <h1 id="header-warning"></h1>
                <p id="content-warning"></p>
            </div>
        </div>
    `;
    document.body.appendChild(popupElement); // Add dialog to body

    const labelElement = document.createElement('div');  // Create a wrapper div
    labelElement.id = 'param-popup';
    labelElement.classList.add('param-popup');
    labelElement.innerHTML = `
        <div class="header">
            <h1>Posture Classification</h1>
        </div>
        <div class="content-param-container">
            <div id="label-container" class="content-param">

            </div>
        </div>
    `;


    document.body.appendChild(labelElement);  // Append the wrapper to the body
    
    // Load the model and metadata
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const canvas = document.getElementById("canvas");

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(canvas.width, canvas.height, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // At this point, canvas has already been appended to the body
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");

    // Create label elements for each class prediction
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        const labelDiv = document.createElement("div");
        labelDiv.classList.add("param");
        labelContainer.appendChild(labelDiv);
    }

    
}

async function loop(timestamp) {
    const settingsPopup = document.getElementById("setting-popup");
    const paramPopup = document.getElementById("param-popup");

    if (settingsPopup.open) {
        paramPopup.style.display = "none";

        hideDialog();
        pauseSound();
    }

    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}   

async function predict() {
    // Prediction #1: run input through posenet
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

    // Prediction #2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    // Check for "incorrect posture" in the predictions
    let incorrectPostureDetected = false;
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `
            <p>${prediction[i].className}</p>
            <div class="bar-container">
                <div class="bar" style="width: ${(prediction[i].probability * 100).toFixed(2)}%;"></div>
            </div>
        `;

        labelContainer.children[i].innerHTML = classPrediction;

        if (prediction[i].className === "Slouching_Forward" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
            document.getElementById("header-warning").innerText = "Slouching Forward";
            document.getElementById("content-warning").innerText = "Leaning in too much? Adjust your posture to stay comfortable during long calls.";
        } else if (prediction[i].className === "Leaning_Back" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
            document.getElementById("header-warning").innerText = "Leaning Back";
            document.getElementById("content-warning").innerText = "You're leaning too far back—sit upright for a more engaging call presence!";
        } else if (prediction[i].className === "Leaning_Sideways" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
            document.getElementById("header-warning").innerText = "Leaning Sideway";
            document.getElementById("content-warning").innerText = "Shift your weight back to the center—long shifts feel better with even posture!";
        } else if (prediction[i].className === "No_Person" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
            document.getElementById("header-warning").innerText = "No person";
            document.getElementById("content-warning").innerText = "Tracking paused—resume when you're back at your station.";
        } else if (prediction[i].className === "Head_Drooping" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
            document.getElementById("header-warning").innerText = "Head Drooping (Drowsy)";
            document.getElementById("content-warning").innerText = "Fatigue setting in? A quick stretch or water break can help you refresh!";
        }
    
    }

    // Function to toggle visibility
    function updatePopupVisibility(show) {
        const settingsPopup = document.getElementById("setting-popup");

        if (!settingsPopup.open) {
            const paramPopup = document.getElementById("param-popup");
            if (paramPopup) {
                paramPopup.style.display = show ? "block" : "none";
            }
        }
    }

    // Load stored setting when content script runs
    chrome.storage.sync.get(["showParameters"], (data) => {
        updatePopupVisibility(data.showParameters ?? true);
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message) => {
        if (message.showParameters !== undefined) {
            updatePopupVisibility(message.showParameters);
        }
    });


    // Show or hide the dialog based on incorrect posture detection
    if (incorrectPostureDetected && !postureState) {
        postureState = true; 
        showDialog(); 
    } else if (!incorrectPostureDetected && postureState) {
        postureState = false; 
        hideDialog(); 
    }

    if (!incorrectPostureDetected) {
        if (correctPostureDuration === 60) {
            chrome.storage.sync.get(["day", "progress"], (data) => {
                let day = data.day || {}; 
                let progress = data.progress || {}; 
            
                // Update the day count
                day[today] = day[today] ? day[today] + 1 : 1; 
            
                // Update progress (Example: increase current_record)
                progress.current_record = (progress.current_record || 0) + 1; 
            
                // Save both updated day and progress
                chrome.storage.sync.set({ day, progress }, () => {
                    console.log("Updated day:", day);
                    console.log("Updated progress:", progress);
                });
            });
            

            correctPostureDuration = 0; // Reset the frame count
        }

        correctPostureDuration += 1; // Increment frame count
    }

    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

function showDialog() {
    const popup = document.getElementById('notif-popup');
    popup.showModal(); // Show the dialog box
    playSound(); // Play the alert sound
}

function hideDialog() {
    const popup = document.getElementById('notif-popup');
    popup.close(); // Close the dialog box
}


function playSound() {
    const sound = document.getElementById("alertSound");
    sound.play();
}

function pauseSound() {
    const sound = document.getElementById("alertSound");
    sound.pause();
    alertSound.currentTime = 0;
}


// Call the initialize function to load the model and setup everything
init();

