const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// Disable GPU acceleration
app.disableHardwareAcceleration();

let mainWindow;
let backendProcess;

function startBackend() {
    const backendScript = path.join(__dirname, "..", "backend", "server.js");
    console.log("Starting backend from:", backendScript);

    backendProcess = spawn("node", [backendScript], {
        stdio: "inherit"
    });

    backendProcess.on("error", (error) => {
        console.error("Backend error:", error);
    });

    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    const frontendPath = path.join(__dirname, "..", "frontend", "index.html");
    mainWindow.loadFile(frontendPath);

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = null;
        if (backendProcess) backendProcess.kill();
    });
}

app.on("ready", async () => {
    await startBackend();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (mainWindow === null) createWindow();
});
