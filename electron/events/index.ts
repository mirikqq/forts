import { dialog, ipcMain } from "electron";
import { win } from "../main";
import fs from "fs";
import { Proxies } from "../consts/proxies";
import { parseProxy } from "../modules/parseProxies";
import { parseBase } from "../modules/parseBase";
import { Base } from "../consts/base";

ipcMain.handle("upload-base", async () => {
  const file = await dialog.showOpenDialog(win!, {
    properties: ["openFile"],
    filters: [{ name: "", extensions: ["rar", "zip", "7zip"] }],
  });

  if (file.canceled || file.filePaths.length === 0) {
    return null;
  }

  win?.webContents.send("update-state", "loading", "state.uploadingBase");

  const logs = await parseBase(file.filePaths[0]);
  Base.length = 0;
  Base.push(...logs);
  win?.webContents.send("update-state", "iddle", "state.iddle");

  return win?.webContents.send("update-results", "lines", Base.length);
});

ipcMain.handle("upload-proxy", async () => {
  const file = await dialog.showOpenDialog(win!, {
    properties: ["openFile"],
    filters: [{ name: "", extensions: ["txt"] }],
  });

  if (file.canceled || file.filePaths.length === 0) {
    return null;
  }

  try {
    const fileContent = await fs.promises.readFile(file.filePaths[0], "utf-8");

    Proxies.length = 0;
    Proxies.push(...parseProxy(fileContent));

    return win?.webContents.send("update-results", "proxies", Proxies.length);
  } catch (error) {
    console.error("Ошибка при чтении файла:", error);
    return null;
  }
});

ipcMain.on("close-app", () => win!.close());
ipcMain.on("minimize-app", () => win!.minimize());
