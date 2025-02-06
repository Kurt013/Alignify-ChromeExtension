let model, webcam, ctx, labelContainer, maxPredictions, postureState = false; // postureState to track if posture is incorrect

console.log("Initializing the model...");

async function init() {
    const modelURL = chrome.runtime.getURL('my_model/model.json');
    const metadataURL = chrome.runtime.getURL('my_model/metadata.json');

    const audioElement = document.createElement('audio');
    audioElement.src = chrome.runtime.getURL('./assets/notif_sound.mp3');
    audioElement.id = 'alertSound';
    document.body.appendChild(audioElement);

    const canvasWrapper = document.createElement('div');  
    const canvasElement = document.createElement('canvas');  
    canvasElement.id = 'canvas';
    canvasElement.style.display = 'none'; 
    canvasWrapper.appendChild(canvasElement); 
    document.body.appendChild(canvasWrapper);  

    const popupElement = document.createElement('dialog');
    const warningLogo = chrome.runtime.getURL('./icons/warning.svg');

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


    popupElement.id = 'notif-popup';
    popupElement.className = 'popup-container';
    popupElement.innerHTML = `
        <div class="notif-popup">
            <div class="icon">
                <img src="${warningLogo}" alt="Warning Icon">
            </div>
            <div class="content">
                <h1>Leaning Sideways</h1>
                <p>Shift your weight back to
                    the center-long shifts feel better with even posture!</p>
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
    // labelElement.id = 'label-container';  // Set the wrapper id
    // labelElement.style.cssText = `
    //     position: fixed;
    //     bottom: 10px;
    //     right: 10px;
    //     background-color: rgba(0, 0, 0, 0.7);
    //     color: white;
    //     padding: 10px;
    //     border-radius: 5px;
    //     z-index: 1000;
    // `;


    document.body.appendChild(labelElement);  // Append the wrapper to the body
    
    // Load the model and metadata
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // At this point, canvas has already been appended to the body
    const canvas = document.getElementById("canvas");
    canvas.width = size; 
    canvas.height = size;
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
    webcam.update(); // update the webcam frame
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

        if (prediction[i].className !== "Correct_Posture" && prediction[i].probability > 0.8) {
            incorrectPostureDetected = true;
        }
    }

    // Show or hide the dialog based on incorrect posture detection
    if (incorrectPostureDetected && !postureState) {
        postureState = true; // Set posture state to incorrect
        showDialog(); // Show dialog
    } else if (!incorrectPostureDetected && postureState) {
        postureState = false; // Set posture state to correct
        hideDialog(); // Hide dialog
    }

    // finally draw the poses
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


// Call the initialize function to load the model and setup everything
init();
