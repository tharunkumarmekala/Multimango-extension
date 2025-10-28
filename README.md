# ⏱️ Multimango Extension

Multimango is a browser extension that monitors time spent on specific websites and tracks task completion. Perfect for personal productivity, study sessions, or workflow accountability — all running locally in your browser.

## 📌 Core Features

- ⏳ **Site-Specific Timer**: Automatically starts a timer when visiting monitored sites.
- ✅ **Task Completion Tracker**: Detects when tasks are submitted and logs completion time.
- 🔔 **Popup Interface**: Displays active timer, task status, and quick controls.
- 🧠 **Lightweight & Modular**: Built with vanilla JavaScript for easy customization.

## 🧩 File Overview

| File            | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `manifest.json` | Declares extension metadata, permissions, and script entry points           |
| `background.js` | Manages background logic and site monitoring                                |
| `content.js`    | Injects timer and task tracking logic into target websites                  |
| `popup.html`    | UI layout for the extension's popup                                         |
| `popup.js`      | Controls popup behavior and displays timer/task status                      |
| `style.css`     | Styles the popup interface                                                  |
| `README.md`     | Project documentation                                                       |

## 🚀 How It Works

1. When you visit a monitored site, the extension starts a timer.
2. The timer runs in the background and updates the popup UI.
3. When you submit a task (e.g., click a submit button), the extension logs the time and marks the task as complete.
4. All logic runs locally in your browser — no data is sent externally.

## 🛠️ Local Installation (Chrome)

1. **Download or clone** this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the folder containing the extension files.
5. Visit a monitored site and click the extension icon to view the timer and task tracker.

## 🧪 Customization

- To change which sites are monitored, update the URL matching logic in `background.js`.
- To modify task detection (e.g., different submit buttons), adjust selectors in `content.js`.
- You can extend the popup to show historical data or integrate with local storage.

## 📚 Use Cases

- Track time spent on learning platforms like Coursera or Udemy.
- Monitor productivity on task boards like Trello or Asana.
- Log task completion time for personal projects or study goals.

## 🤝 Contributing

Feel free to fork this repo, submit pull requests, or open issues for feature requests and bugs.

## 📄 License

This project is open-source and free to use under the MIT License.
