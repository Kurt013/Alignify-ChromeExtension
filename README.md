# 📏 Alignify: A Posture Corrector for Prolonged Sitting

Chrome extension (Manifest V3) that helps people who sit for long periods improve posture through progress tracking, reminders, and motivation.

---

## 📸 Demo

![Chrome Extension UI](https://raw.githubusercontent.com/Kurt013/Alignify-ChromeExtension/refs/heads/main/assets/extension-ui.png)  
![Popup UI](https://raw.githubusercontent.com/Kurt013/Alignify-ChromeExtension/refs/heads/main/assets/popup-ui.png)  
![Analytics Dashboard UI](https://raw.githubusercontent.com/Kurt013/Alignify-ChromeExtension/refs/heads/main/assets/analytics-ui.png)  

---

## 📦 Load the Extension in Chrome

Download the repository as a ZIP file and load it as a Chrome extension:

1. Open Google Chrome and go to:
    chrome://extensions/
2. Enable **Developer mode** (top-right corner).
3. Click **Load unpacked**.
4. Select the folder containing `manifest.json`.

Once loaded, the Alignify icon will appear in the Chrome toolbar.

---

## 🛠 Usage

1. Click the **Alignify extension icon** in the Chrome toolbar.
2. Use the app to:
   - Track posture progress over time
   - View daily, weekly, and monthly statistics
   - Receive posture, stretching, and hydration reminders
   - See motivational messages and achievements

---

## ✨ Features

- Track daily, weekly, and monthly posture progress  
- Visual bar chart for posture history  
- Progress stats (highest record, current streak, highest streak)  
- Posture, stretching, and hydration reminders  
- Motivational messages to encourage healthy habits  
- Interactive charts with Day / Week / Month views  

---

## 🧠 What I Learned

- Learned how to build a **Chrome Extension using Manifest V3** through reading official docs
- Implemented **progress tracking and reminders** with Chrome Storage API
- Gained experience with **Chart.js for data visualization**
- Explored **machine learning integration** with Teachable Machine
- Improved skills in **HTML, CSS, and JavaScript** for interactive UIs

Overall, building this extension was fun but challenging. Integrating Teachable Machine was tricky because there is limited documentation for Chrome Extensions. After hours of experimenting, I found a solution: **download the necessary model files locally** and configure `manifest.json` to point to them.

I also faced challenges with **audio permissions**, which were resolved by explicitly configuring them in `manifest.json`. This project taught me that **Manifest V3 is stricter than V2**, which prevents things like loading external scripts from a CDN, requiring workarounds like local hosting of model files.

---

## 🧰 Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge) 
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge) 
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge) 
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-4285F4?logo=googlechrome&logoColor=white&style=for-the-badge)
![Teachable Machine](https://img.shields.io/badge/Teachable_Machine-34A853?logo=google&logoColor=white&style=for-the-badge)

---

## 🎨 Design Prototype

View the full Figma design here:  
[Open Figma](https://www.figma.com/design/L6eE9GTRIRah5uk5FGiZjC/ALIGNIFY-UI?node-id=20-2&m=dev)

---

## 📄 License

See [LICENSE](LICENSE) for full details.