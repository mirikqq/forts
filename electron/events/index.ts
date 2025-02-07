import { ipcMain } from "electron"
import { sharedResults } from "../../shared/sharedResults.ts";

ipcMain.handle('upload-base', () => {
    sharedResults.lines++
})