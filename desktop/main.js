const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

const APP_URL = "https://nutri-hfls89sdq-b-rap.vercel.app";

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: "Nutri • Gestão Nutricional",
    icon: path.join(__dirname, "icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Ocultar barra de menus padrão para visual moderno de app nativo (estilo Discord)
  Menu.setApplicationMenu(null);

  // Carregar a aplicação online na Vercel com base de dados Supabase em tempo real
  win.loadURL(APP_URL);

  // Abrir links externos (como termos, documentação) no browser predefinido do utilizador
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  win.on("page-title-updated", (evt) => {
    evt.preventDefault();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
