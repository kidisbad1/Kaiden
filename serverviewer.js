const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 420,
    resizable: false,
    title: "KAIDEN SURVEY",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>KAIDEN SURVEY</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #1e1e2f, #292942);
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        user-select: none;
      }
      h1 { font-size: 36px; margin-bottom: 8px; }
      p { font-size: 18px; margin-bottom: 25px; }
      button {
        background: #5865F2; border: none; padding: 15px 40px; border-radius: 15px;
        font-size: 20px; color: white; cursor: pointer; transition: 0.25s ease; margin: 10px 0;
      }
      button:hover { transform: scale(1.05); }
    </style>
  </head>
  <body>
    <h1>KAIDEN SURVEY</h1>
    <p>Click to begin:</p>
    <button id="startBtn">How well do you REALLY know him?</button>
    <p style="margin-top:16px;"><button id="chooseFileBtn">Choose a file (demo only)</button></p>

    <script>
      const { ipcRenderer } = require('electron');

      document.getElementById('startBtn').onclick = () => {
        showQuestionOne();
      };

      document.getElementById('chooseFileBtn').onclick = async () => {
        // This opens a chooser — the app will NOT upload anything.
        // It only demonstrates asking the user to pick a file.
        const result = await ipcRenderer.invoke('show-file-dialog');
        if (result && result.canceled === false) {
          alert('You selected: ' + result.filePaths.join(', ') + '\\n(This app does not upload files.)');
        }
      };

      function showQuestionOne() {
        document.body.innerHTML = \`
          <h1>Question 1</h1>
          <p>Does Kadon wear skinny jeans all the time?</p>
          <button onclick="alert('Correct!')">A: No</button>
          <button onclick="alert('Incorrect!')">B: Yes</button>
          <button onclick="alert('Incorrect!')">C: Trick Question</button>
        \`;
      }
    </script>
  </body>
  </html>
  `;

  const tempPath = path.join(app.getPath("userData"), "ui.html");
  fs.writeFileSync(tempPath, html);
  mainWindow.loadFile(tempPath);
  mainWindow.setMenuBarVisibility(false);
}

// IPC handler to open a file chooser (user-initiated)
ipcMain.handle('show-file-dialog', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Choose a file (demo only)',
    properties: ['openFile']
  });
  // Do NOT read or upload the file. We return the chosen path so renderer can show it.
  return res;
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
