const { ipcMain, shell } = require('electron');
const settings = require('../../storage/SettingsService');

function registerBrowserIpc() {
   ipcMain.handle('browser:issue', async (_, id) => {
    try {
      // Получаем URL из настроек (асинхронно)
      const serverUrl = await settings.get('serverUrl');

      if (!serverUrl || typeof serverUrl !== 'string') {
        throw new Error('Server URL is not configured. Please check your settings.');
      }
      // Нормализуем URL: убираем слэш в конце, если он есть
      const cleanUrl = serverUrl.replace(/\/$/, '');
      const url = `${cleanUrl}/issues/${id}`;
      return shell.openExternal(url);
    } catch (err) {
      throw err; // Пробрасываем ошибку обратно в рендерер
    }
  });
 
}

module.exports = { registerBrowserIpc };
