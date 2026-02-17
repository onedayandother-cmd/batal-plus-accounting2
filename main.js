const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// 1. هذا السطر يحدد هل نحن نبرمج الآن أم أن البرنامج انتهى وتم تجميعه
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    // 2. استخدام الأيقونة من مجلد assets بصيغة ico للويندوز
    icon: path.join(__dirname, 'assets', 'icon.ico'), 
    title: "نظام البطل بلس للمحاسبة",
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDev // تفعيل أدوات المطور فقط وأنت تبرمج
    }
  });

  // 3. المنطق الذكي للتحميل (أهم جزء)
  if (isDev) {
    // أثناء البرمجة: اتصل بـ Vite على المنفذ 3000
    // هذا يسمح لك برؤية التعديلات فوراً بدون إعادة تشغيل
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools(); // يفتح لك شاشة الأخطاء لتساعدك
  } else {
    // في البرنامج النهائي (exe):
    // حمل ملف index.html من مجلد dist الذي ينتجه Vite
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // إخفاء القائمة العلوية لمظهر احترافي
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});