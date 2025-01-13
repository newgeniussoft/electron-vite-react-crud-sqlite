const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:5173'
            : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

function initDatabase() {
    db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
        if (err) console.error('Database opening error: ', err);
        console.log('Database connected');
        
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

app.whenReady().then(() => {
    createWindow();
    initDatabase();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// CRUD Operations
ipcMain.handle('create-item', async (event, item) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO items (title, description) VALUES (?, ?)';
        db.run(sql, [item.title, item.description], function(err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
});

ipcMain.handle('read-items', async () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM items ORDER BY created_at DESC';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
});

ipcMain.handle('update-item', async (event, item) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE items SET title = ?, description = ? WHERE id = ?';
        db.run(sql, [item.title, item.description, item.id], (err) => {
            if (err) reject(err);
            resolve(true);
        });
    });
});

ipcMain.handle('delete-item', async (event, id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM items WHERE id = ?';
        db.run(sql, [id], (err) => {
            if (err) reject(err);
            resolve(true);
        });
    });
});
