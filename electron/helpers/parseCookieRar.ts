import StreamZip from "node-stream-zip";

export class ArchiveReaderStreamZip {
  archivePath: string;

  constructor(archivePath: string) {
    this.archivePath = archivePath;
  }

  /**
   * Ищет в архиве папку "cookies", проходит по всем файлам в ней,
   * ищет строку, соответствующую регулярному выражению /EPIC_EG1\s+([^\s]+)/,
   * и возвращает найденные токены. Все операции выполняются с использованием node-stream-zip.
   */
  findEpicTokensInCookiesFolder(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const zip = new StreamZip({
        file: this.archivePath,
        storeEntries: true,
      });

      zip.on("error", (err) => {
        zip.close();
        reject(err);
      });

      zip.on("ready", () => {
        const tokens: string[] = [];
        const entries = zip.entries();
        const promises: Promise<void>[] = [];

        for (const entryName in entries) {
          const entry = entries[entryName];
          // Обрабатываем только файлы (не папки), в пути которых есть сегмент "cookies"
          if (entry.isDirectory) continue;
          const segments = entry.name.toLowerCase().split("/");
          if (!segments.includes("cookies")) continue;

          const p = new Promise<void>((res, rej) => {
            zip.stream(entry.name, (err, stream) => {
              if (err || !stream) {
                return rej(err || new Error(`Ошибка открытия потока для ${entry.name}`));
              }
              const chunks: Buffer[] = [];
              stream.on("data", (chunk: Buffer) => chunks.push(chunk));
              stream.on("end", () => {
                const content = Buffer.concat(chunks).toString("utf8");
                const match = content.match(/EPIC_EG1\s+([^\s]+)/);
                if (match && match[0]) {
                  tokens.push(match[0]);
                }
                res();
              });
              stream.on("error", (err) => {
                rej(err);
              });
            });
          });
          promises.push(p);
        }

        Promise.all(promises)
          .then(() => {
            zip.close();
            resolve(tokens);
          })
          .catch((err) => {
            zip.close();
            reject(err);
          });
      });
    });
  }
}
