let model, webcam, ctx, labelContainer, maxPredictions, postureState = false;
let correctPostureStartTime = null;
let totalCorrectPostureDuration = 0; // in milliseconds
let sensitivity;  
let volume;
let audioPath;
let previousAudioPath = "";
const checkStatus = document.getElementById("check-icon");


chrome.storage.sync.get(["preferences"], (result) => {

    let preferences = result.preferences || {
        profile: 'user123',
        sound: 1,
        sensitivity: 0.8
    };

    sensitivity = preferences.sensitivity;
    volume = parseFloat(preferences.sound);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.preferences) {
        let newPreferences = changes.preferences.newValue;

        if (newPreferences.sensitivity !== undefined) {
            sensitivity = newPreferences.sensitivity;
            console.log("Updated Sensitivity:", sensitivity);
        }

        if (newPreferences.sound !== undefined) {
            volume = parseFloat(newPreferences.sound) || 1.0;
            console.log("Updated Volume:", volume);
        }
    }
});

async function init() {
    const modelURL = chrome.runtime.getURL('my_model/model.json');
    const metadataURL = chrome.runtime.getURL('my_model/metadata.json');

    // Create the audio element
    const audioElement = document.createElement('audio');
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
    document.body.appendChild(popupElement);

    const labelElement = document.createElement('div');
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


    document.body.appendChild(labelElement); 
    
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const canvas = document.getElementById("canvas");

    const flip = true; 
    webcam = new tmPose.Webcam(canvas.width, canvas.height, flip); 
    await webcam.setup();
    await webcam.play();

    setInterval(loop, 3000);

    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");

    for (let i = 0; i < maxPredictions; i++) {
        const labelDiv = document.createElement("div");
        labelDiv.classList.add("param");
        labelContainer.appendChild(labelDiv);
    }
}

async function loop() {
    const settingsPopup = document.getElementById("setting-popup");
    const paramPopup = document.getElementById("param-popup");

    if (settingsPopup.open) {
        paramPopup.style.display = "none";

        hideDialog();
        pauseSound();
    }

    webcam.update();
    await predict();
}   

async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    let incorrectPostureDetected = false;
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `
            <p>${prediction[i].className}</p>
            <div class="bar-container">
                <div class="bar" style="width: ${(prediction[i].probability * 100).toFixed(2)}%;"></div>
            </div>
        `;

        labelContainer.children[i].innerHTML = classPrediction;

        if (prediction[i].className === "Correct_Posture" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = false;
        } else if (prediction[i].className === "Slouching_Forward" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = true;
            setAudioAndPopup('slouching_forward.mp3', "Slouching Forward", "Leaning in too much? Adjust your posture to stay comfortable during long calls.");
        } else if (prediction[i].className === "Leaning_Back" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = true;
            setAudioAndPopup('leaning_back.mp3', "Leaning Back", "You're leaning too far back—sit upright for a more engaging call presence!");
        } else if (prediction[i].className === "Leaning_Sideways" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = true;
            setAudioAndPopup('leaning_sideways.mp3', "Leaning Sideways", "Shift your weight back to the center—long shifts feel better with even posture!");
        } else if (prediction[i].className === "No_Person" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = true;
            setAudioAndPopup('no_person.mp3', "No person", "Tracking paused—resume when you're back at your station.");
        } else if (prediction[i].className === "Head_Drooping" && prediction[i].probability > sensitivity) {
            incorrectPostureDetected = true;
            setAudioAndPopup('head_drooping.mp3', "Head Drooping (Drowsy)", "Fatigue setting in? A quick stretch or water break can help you refresh!");
        }
    
    }

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


    if (!incorrectPostureDetected) {
        checkStatus.classList.remove('hide-check');
    }
    else {
        checkStatus.classList.add('hide-check');
    }

    if (incorrectPostureDetected && !postureState) {
        postureState = true; 
        showDialog(); 
    } else if (!incorrectPostureDetected && postureState) {
        postureState = false; 
        hideDialog(); 
    }

    if (!incorrectPostureDetected && !settingsDialog.open) {
        if (correctPostureStartTime === null) {
            correctPostureStartTime = Date.now(); // Start timing
        }

        chrome.storage.sync.get(["day", "progress"], (data) => {
            const today = new Date().toISOString().split('T')[0];

            let day = data.day || {}; 

            let progress = data.progress || {
                highest_record: 0,
                highest_streak: 0,
                current_streak: 0,
                current_record: 0,
                lastDate: null
            };

            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            let yesterdayStr = yesterday.toISOString().split('T')[0];

            day[today] = (day[today] || 0) + 1; 

            progress.current_record = day[today];

            if (progress.current_record > progress.highest_record) {
                progress.highest_record = progress.current_record;
            }

            if (progress.current_record > 30) {
                if (progress.lastDate === yesterdayStr) {
                    progress.current_streak += 1;
                } else if (progress.lastDate !== today || progress.lastDate === null) {
                    progress.current_streak = 1;
                }
                progress.lastDate = today;
            }

            if (progress.current_streak > progress.highest_streak) {
                progress.highest_streak = progress.current_streak;
            }

            chrome.storage.sync.set({ day, progress }, () => {
                console.log("Updated day and progress:", day, progress);
            });
        });
    } else {
        if (correctPostureStartTime !== null) {

            totalCorrectPostureDuration += Date.now() - correctPostureStartTime;
            correctPostureStartTime = null;
        }
    }
    

    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);

        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

function showDialog() {
    const popup = document.getElementById('notif-popup');
    playSound();
    popup.showModal();
}

function hideDialog() {
    const popup = document.getElementById('notif-popup');
    popup.close(); 
}


function setAudioAndPopup(audioFile, headerText, contentText) {
    const newAudioPath = chrome.runtime.getURL(`assets/${audioFile}`);
    
    if (previousAudioPath !== newAudioPath) {
        previousAudioPath = newAudioPath;
        
        audioPath = newAudioPath;
        document.getElementById("header-warning").innerText = headerText;
        document.getElementById("content-warning").innerText = contentText;
        
        playSound();
    }
}

function playSound() {
    const sound = document.getElementById("alertSound");
    if (sound) {
        sound.pause();
        sound.currentTime = 0;

        sound.src = audioPath;
        sound.volume = volume;
        sound.play();
    }
}

function pauseSound() {
    const sound = document.getElementById("alertSound");
    sound.pause();
    sound.currentTime = 0;
}

init();