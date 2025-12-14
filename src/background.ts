'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const execPromise = promisify(exec)
const isDevelopment = process.env.NODE_ENV !== 'production'

// Yönetici modunda çalışıp çalışmadığını kontrol et
async function isAdmin(): Promise<boolean> {
  if (process.platform !== 'win32') return false;

  try {
    // Windows'ta yönetici kontrolü için net session komutunu kullan
    await execPromise('net session', { timeout: 1000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Komutu yönetici olarak çalıştır
async function runAsAdmin(command: string): Promise<{ success: boolean; stdout: string; stderr: string; error?: string }> {
  try {
    // PowerShell ile elevated komut çalıştır
    const psCommand = `Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command','${command.replace(/'/g, "''")}' -Wait -WindowStyle Hidden`;

    const { stdout, stderr } = await execPromise(psCommand, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      shell: 'powershell.exe'
    });

    return { success: true, stdout, stderr };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      error: error.message
    };
  }
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createProtocol(scheme: string) {
  protocol.registerFileProtocol(scheme, (request: any, callback: any) => {
    const url = request.url.replace(`${scheme}://`, '')
    try {
      return callback(path.normalize(path.join(__dirname, url)))
    } catch (error) {
      console.error('Protocol error:', error)
      return callback({ error: -2 })
    }
  })
}

let win: BrowserWindow | null = null

async function createWindow() {

  // Yönetici modunda değilse kullanıcıyı bilgilendir
  const adminMode = await isAdmin();

  if (!adminMode) {
    console.warn('⚠️ Uygulama yönetici modunda çalışmıyor. Chocolatey ve bazı işlemler başarısız olabilir.');
  }

  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, isDevelopment ? '../dist-electron/preload.js' : 'preload.js')
    },
    backgroundColor: '#1e1e1e',
    show: true,
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    title: 'WinGet UI'
  })

  // Remove menu bar completely
  win.setMenuBarVisibility(false)
  win.webContents.openDevTools()

  try {
    if (isDevelopment) {
      // Load the Vite dev server URL
      const devServerURL = 'http://localhost:5173'
      await win.loadURL(devServerURL)
    } else {
      createProtocol('app')
      win.loadURL('app://./index.html')
    }
  } catch (error) {
    console.error('Error loading URL:', error)
  }

  win.once('ready-to-show', () => {
    win?.show()
  })

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools (optional)
    try {
      const installExtension = await import('electron-devtools-installer')
      await installExtension.default(installExtension.VUEJS_DEVTOOLS)
    } catch (e: any) {
      console.error('Vue Devtools not available:', e.message)
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// IPC Handlers for package management
ipcMain.handle('is-admin', async () => {
  return isAdmin();
});

ipcMain.handle('execute-command', async (_event: any, command: string) => {
  try {
    // Chocolatey komutlarını kontrol et - bunlar yönetici gerektirir
    const needsAdmin = command.toLowerCase().includes('choco install') ||
      command.toLowerCase().includes('choco upgrade') ||
      command.toLowerCase().includes('choco uninstall');

    // Yönetici modunda değilsek ve komut yönetici gerektiriyorsa
    if (needsAdmin && !(await isAdmin())) {
      return await runAsAdmin(command);
    }

    // Normal komut çalıştırma
    const { stdout, stderr } = await execPromise(command, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    })
    return { success: true, stdout, stderr }
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      error: error.message
    }
  }
})

ipcMain.handle('check-command', async (_event: any, command: string) => {
  try {
    await execPromise(`${command} --version`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024
    })
    return true
  } catch (error) {
    return false
  }
})
