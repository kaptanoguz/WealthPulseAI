const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

const isDev = process.argv.includes('--dev');
const PORT = 3000;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'WealthPulse AI',
        icon: path.join(__dirname, 'public', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#0f1117',
        autoHideMenuBar: true,
    });

    mainWindow.loadURL(`http://localhost:${PORT}`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        serverProcess = exec(`${npmCmd} run start -- -p ${PORT}`, {
            cwd: __dirname,
            env: { ...process.env, NODE_ENV: 'production' },
        });

        serverProcess.stdout.on('data', (data) => {
            console.log('[Next.js]', data.toString().trim());
            if (data.toString().includes('Ready') || data.toString().includes('ready')) {
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error('[Next.js Error]', data.toString().trim());
        });

        // Fallback timeout - server should be ready within 15s
        setTimeout(resolve, 15000);
    });
}

app.whenReady().then(async () => {
    if (isDev) {
        createWindow();
    } else {
        console.log('Starting Next.js server...');
        await startServer();
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
    app.quit();
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
