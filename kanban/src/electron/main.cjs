const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
let serverPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Encontrar a raiz do repositorio Fowlgen Wars
function findRepoRoot(startDir) {
  if (process.env.REPO_ROOT && fs.existsSync(process.env.REPO_ROOT)) {
    return path.resolve(process.env.REPO_ROOT);
  }
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(current, 'openspec')) || fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(startDir, '../../../');
}

const REPO_ROOT = findRepoRoot(__dirname);
process.env.REPO_ROOT = REPO_ROOT;

// Testa se a porta ja esta respondendo
function pingServer(port, callback) {
  const req = http.get(`http://127.0.0.1:${port}/api/sync/status`, (res) => {
    callback(true);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(800, () => {
    req.destroy();
    callback(false);
  });
}

function startBackendServer(callback) {
  // Primeiro testa se o servidor já está ativo (ex: iniciado externamente)
  pingServer(serverPort, (alreadyRunning) => {
    if (alreadyRunning) {
      console.log(`[Electron] Servidor Kanban já está rodando na porta ${serverPort}.`);
      return callback();
    }

    console.log(`[Electron] Iniciando servidor interno do Kanban Studio...`);
    const serverScript = path.join(__dirname, '../../dist/server.js');
    
    // Se o bundle dist/server.js nao existir ainda, usa tsx src/server/server.ts
    const isCompiled = fs.existsSync(serverScript);
    const env = Object.assign({}, process.env, {
      PORT: serverPort.toString(),
      REPO_ROOT: REPO_ROOT
    });

    if (isCompiled) {
      serverProcess = fork(serverScript, [], {
        env,
        silent: false
      });
    } else {
      const tsxPath = path.join(__dirname, '../../node_modules/tsx/dist/cli.mjs');
      const tsServer = path.join(__dirname, '../server/server.ts');
      serverProcess = fork(tsxPath, [tsServer], {
        env,
        silent: false
      });
    }

    serverProcess.on('error', (err) => {
      console.error('[Electron] Erro ao iniciar processo do servidor:', err);
    });

    // Aguardar servidor responder
    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      pingServer(serverPort, (isUp) => {
        if (isUp || retries > 25) {
          clearInterval(interval);
          callback();
        }
      });
    }, 300);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    title: 'Kanban Studio — Fowlgen Wars',
    backgroundColor: '#0b1120',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  const url = `http://localhost:${serverPort}`;
  mainWindow.loadURL(url);

  // Abrir links externos no navegador padrao
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes(`localhost:${serverPort}`)) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializacao do Electron
app.whenReady().then(() => {
  startBackendServer(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
