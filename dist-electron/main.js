var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ipcMain, dialog, app, BrowserWindow } from "electron";
import { app as app2 } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import require$$0 from "fs";
import require$$1 from "util";
import require$$2 from "path";
import require$$3 from "events";
import require$$4 from "zlib";
import require$$5 from "stream";
const Proxies = [];
const parseProxy = (list) => {
  return list.split(/\r?\n/);
};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
/**
 * @license node-stream-zip | (c) 2020 Antelle | https://github.com/antelle/node-stream-zip/blob/master/LICENSE
 * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/LICENSE
 */
let fs = require$$0;
const util = require$$1;
const path = require$$2;
const events = require$$3;
const zlib = require$$4;
const stream = require$$5;
const consts = {
  /* The local file header */
  LOCHDR: 30,
  // LOC header size
  LOCSIG: 67324752,
  // "PK\003\004"
  LOCVER: 4,
  // version needed to extract
  LOCFLG: 6,
  // general purpose bit flag
  LOCHOW: 8,
  // compression method
  LOCTIM: 10,
  // modification time (2 bytes time, 2 bytes date)
  LOCCRC: 14,
  // uncompressed file crc-32 value
  LOCSIZ: 18,
  // compressed size
  LOCLEN: 22,
  // uncompressed size
  LOCNAM: 26,
  // filename length
  LOCEXT: 28,
  // extra field length
  /* The central directory file header */
  CENHDR: 46,
  // CEN header size
  CENSIG: 33639248,
  // "PK\001\002"
  CENVEM: 4,
  // version made by
  CENVER: 6,
  // version needed to extract
  CENFLG: 8,
  // encrypt, decrypt flags
  CENHOW: 10,
  // compression method
  CENTIM: 12,
  // modification time (2 bytes time, 2 bytes date)
  CENCRC: 16,
  // uncompressed file crc-32 value
  CENSIZ: 20,
  // compressed size
  CENLEN: 24,
  // uncompressed size
  CENNAM: 28,
  // filename length
  CENEXT: 30,
  // extra field length
  CENCOM: 32,
  // file comment length
  CENDSK: 34,
  // volume number start
  CENATT: 36,
  // internal file attributes
  CENATX: 38,
  // external file attributes (host system dependent)
  CENOFF: 42,
  // LOC header offset
  /* The entries in the end of central directory */
  ENDHDR: 22,
  // END header size
  ENDSIG: 101010256,
  // "PK\005\006"
  ENDSIGFIRST: 80,
  ENDSUB: 8,
  // number of entries on this disk
  ENDTOT: 10,
  // total number of entries
  ENDSIZ: 12,
  // central directory size in bytes
  ENDOFF: 16,
  // offset of first CEN header
  ENDCOM: 20,
  // zip file comment length
  MAXFILECOMMENT: 65535,
  /* The entries in the end of ZIP64 central directory locator */
  ENDL64HDR: 20,
  // ZIP64 end of central directory locator header size
  ENDL64SIG: 117853008,
  // ZIP64 end of central directory locator signature
  ENDL64SIGFIRST: 80,
  /* The entries in the end of ZIP64 central directory */
  END64HDR: 56,
  // ZIP64 end of central directory header size
  END64SIG: 101075792,
  // ZIP64 end of central directory signature
  END64SIGFIRST: 80,
  END64SUB: 24,
  // number of entries on this disk
  END64TOT: 32,
  // total number of entries
  END64SIZ: 40,
  END64OFF: 48,
  /* Compression methods */
  STORED: 0,
  // no compression
  // 7 reserved
  DEFLATED: 8,
  // deflated
  ENHANCED_DEFLATED: 9,
  // deflate64
  FLG_ENTRY_ENC: 1,
  /* Header IDs */
  ID_ZIP64: 1,
  EF_ZIP64_OR_32: 4294967295,
  EF_ZIP64_OR_16: 65535
};
const StreamZip = function(config) {
  let fd, fileSize, chunkSize, op, centralDirectory, closed;
  const ready = false, that = this, entries = config.storeEntries !== false ? {} : null, fileName = config.file, textDecoder = config.nameEncoding ? new TextDecoder(config.nameEncoding) : null;
  open();
  function open() {
    if (config.fd) {
      fd = config.fd;
      readFile();
    } else {
      fs.open(fileName, "r", (err, f) => {
        if (err) {
          return that.emit("error", err);
        }
        fd = f;
        readFile();
      });
    }
  }
  function readFile() {
    fs.fstat(fd, (err, stat) => {
      if (err) {
        return that.emit("error", err);
      }
      fileSize = stat.size;
      chunkSize = config.chunkSize || Math.round(fileSize / 1e3);
      chunkSize = Math.max(
        Math.min(chunkSize, Math.min(128 * 1024, fileSize)),
        Math.min(1024, fileSize)
      );
      readCentralDirectory();
    });
  }
  function readUntilFoundCallback(err, bytesRead) {
    if (err || !bytesRead) {
      return that.emit("error", err || new Error("Archive read error"));
    }
    let pos = op.lastPos;
    let bufferPosition = pos - op.win.position;
    const buffer = op.win.buffer;
    const minPos = op.minPos;
    while (--pos >= minPos && --bufferPosition >= 0) {
      if (buffer.length - bufferPosition >= 4 && buffer[bufferPosition] === op.firstByte) {
        if (buffer.readUInt32LE(bufferPosition) === op.sig) {
          op.lastBufferPosition = bufferPosition;
          op.lastBytesRead = bytesRead;
          op.complete();
          return;
        }
      }
    }
    if (pos === minPos) {
      return that.emit("error", new Error("Bad archive"));
    }
    op.lastPos = pos + 1;
    op.chunkSize *= 2;
    if (pos <= minPos) {
      return that.emit("error", new Error("Bad archive"));
    }
    const expandLength = Math.min(op.chunkSize, pos - minPos);
    op.win.expandLeft(expandLength, readUntilFoundCallback);
  }
  function readCentralDirectory() {
    const totalReadLength = Math.min(consts.ENDHDR + consts.MAXFILECOMMENT, fileSize);
    op = {
      win: new FileWindowBuffer(fd),
      totalReadLength,
      minPos: fileSize - totalReadLength,
      lastPos: fileSize,
      chunkSize: Math.min(1024, chunkSize),
      firstByte: consts.ENDSIGFIRST,
      sig: consts.ENDSIG,
      complete: readCentralDirectoryComplete
    };
    op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
  }
  function readCentralDirectoryComplete() {
    const buffer = op.win.buffer;
    const pos = op.lastBufferPosition;
    try {
      centralDirectory = new CentralDirectoryHeader();
      centralDirectory.read(buffer.slice(pos, pos + consts.ENDHDR));
      centralDirectory.headerOffset = op.win.position + pos;
      if (centralDirectory.commentLength) {
        that.comment = buffer.slice(
          pos + consts.ENDHDR,
          pos + consts.ENDHDR + centralDirectory.commentLength
        ).toString();
      } else {
        that.comment = null;
      }
      that.entriesCount = centralDirectory.volumeEntries;
      that.centralDirectory = centralDirectory;
      if (centralDirectory.volumeEntries === consts.EF_ZIP64_OR_16 && centralDirectory.totalEntries === consts.EF_ZIP64_OR_16 || centralDirectory.size === consts.EF_ZIP64_OR_32 || centralDirectory.offset === consts.EF_ZIP64_OR_32) {
        readZip64CentralDirectoryLocator();
      } else {
        op = {};
        readEntries();
      }
    } catch (err) {
      that.emit("error", err);
    }
  }
  function readZip64CentralDirectoryLocator() {
    const length = consts.ENDL64HDR;
    if (op.lastBufferPosition > length) {
      op.lastBufferPosition -= length;
      readZip64CentralDirectoryLocatorComplete();
    } else {
      op = {
        win: op.win,
        totalReadLength: length,
        minPos: op.win.position - length,
        lastPos: op.win.position,
        chunkSize: op.chunkSize,
        firstByte: consts.ENDL64SIGFIRST,
        sig: consts.ENDL64SIG,
        complete: readZip64CentralDirectoryLocatorComplete
      };
      op.win.read(op.lastPos - op.chunkSize, op.chunkSize, readUntilFoundCallback);
    }
  }
  function readZip64CentralDirectoryLocatorComplete() {
    const buffer = op.win.buffer;
    const locHeader = new CentralDirectoryLoc64Header();
    locHeader.read(
      buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.ENDL64HDR)
    );
    const readLength = fileSize - locHeader.headerOffset;
    op = {
      win: op.win,
      totalReadLength: readLength,
      minPos: locHeader.headerOffset,
      lastPos: op.lastPos,
      chunkSize: op.chunkSize,
      firstByte: consts.END64SIGFIRST,
      sig: consts.END64SIG,
      complete: readZip64CentralDirectoryComplete
    };
    op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
  }
  function readZip64CentralDirectoryComplete() {
    const buffer = op.win.buffer;
    const zip64cd = new CentralDirectoryZip64Header();
    zip64cd.read(buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.END64HDR));
    that.centralDirectory.volumeEntries = zip64cd.volumeEntries;
    that.centralDirectory.totalEntries = zip64cd.totalEntries;
    that.centralDirectory.size = zip64cd.size;
    that.centralDirectory.offset = zip64cd.offset;
    that.entriesCount = zip64cd.volumeEntries;
    op = {};
    readEntries();
  }
  function readEntries() {
    op = {
      win: new FileWindowBuffer(fd),
      pos: centralDirectory.offset,
      chunkSize,
      entriesLeft: centralDirectory.volumeEntries
    };
    op.win.read(op.pos, Math.min(chunkSize, fileSize - op.pos), readEntriesCallback);
  }
  function readEntriesCallback(err, bytesRead) {
    if (err || !bytesRead) {
      return that.emit("error", err || new Error("Entries read error"));
    }
    let bufferPos = op.pos - op.win.position;
    let entry = op.entry;
    const buffer = op.win.buffer;
    const bufferLength = buffer.length;
    try {
      while (op.entriesLeft > 0) {
        if (!entry) {
          entry = new ZipEntry();
          entry.readHeader(buffer, bufferPos);
          entry.headerOffset = op.win.position + bufferPos;
          op.entry = entry;
          op.pos += consts.CENHDR;
          bufferPos += consts.CENHDR;
        }
        const entryHeaderSize = entry.fnameLen + entry.extraLen + entry.comLen;
        const advanceBytes = entryHeaderSize + (op.entriesLeft > 1 ? consts.CENHDR : 0);
        if (bufferLength - bufferPos < advanceBytes) {
          op.win.moveRight(chunkSize, readEntriesCallback, bufferPos);
          op.move = true;
          return;
        }
        entry.read(buffer, bufferPos, textDecoder);
        if (!config.skipEntryNameValidation) {
          entry.validateName();
        }
        if (entries) {
          entries[entry.name] = entry;
        }
        that.emit("entry", entry);
        op.entry = entry = null;
        op.entriesLeft--;
        op.pos += entryHeaderSize;
        bufferPos += entryHeaderSize;
      }
      that.emit("ready");
    } catch (err2) {
      that.emit("error", err2);
    }
  }
  function checkEntriesExist() {
    if (!entries) {
      throw new Error("storeEntries disabled");
    }
  }
  Object.defineProperty(this, "ready", {
    get() {
      return ready;
    }
  });
  this.entry = function(name) {
    checkEntriesExist();
    return entries[name];
  };
  this.entries = function() {
    checkEntriesExist();
    return entries;
  };
  this.stream = function(entry, callback) {
    return this.openEntry(
      entry,
      (err, entry2) => {
        if (err) {
          return callback(err);
        }
        const offset = dataOffset(entry2);
        let entryStream = new EntryDataReaderStream(fd, offset, entry2.compressedSize);
        if (entry2.method === consts.STORED) ;
        else if (entry2.method === consts.DEFLATED) {
          entryStream = entryStream.pipe(zlib.createInflateRaw());
        } else {
          return callback(new Error("Unknown compression method: " + entry2.method));
        }
        if (canVerifyCrc(entry2)) {
          entryStream = entryStream.pipe(
            new EntryVerifyStream(entryStream, entry2.crc, entry2.size)
          );
        }
        callback(null, entryStream);
      },
      false
    );
  };
  this.entryDataSync = function(entry) {
    let err = null;
    this.openEntry(
      entry,
      (e, en) => {
        err = e;
        entry = en;
      },
      true
    );
    if (err) {
      throw err;
    }
    let data = Buffer.alloc(entry.compressedSize);
    new FsRead(fd, data, 0, entry.compressedSize, dataOffset(entry), (e) => {
      err = e;
    }).read(true);
    if (err) {
      throw err;
    }
    if (entry.method === consts.STORED) ;
    else if (entry.method === consts.DEFLATED || entry.method === consts.ENHANCED_DEFLATED) {
      data = zlib.inflateRawSync(data);
    } else {
      throw new Error("Unknown compression method: " + entry.method);
    }
    if (data.length !== entry.size) {
      throw new Error("Invalid size");
    }
    if (canVerifyCrc(entry)) {
      const verify = new CrcVerify(entry.crc, entry.size);
      verify.data(data);
    }
    return data;
  };
  this.openEntry = function(entry, callback, sync) {
    if (typeof entry === "string") {
      checkEntriesExist();
      entry = entries[entry];
      if (!entry) {
        return callback(new Error("Entry not found"));
      }
    }
    if (!entry.isFile) {
      return callback(new Error("Entry is not file"));
    }
    if (!fd) {
      return callback(new Error("Archive closed"));
    }
    const buffer = Buffer.alloc(consts.LOCHDR);
    new FsRead(fd, buffer, 0, buffer.length, entry.offset, (err) => {
      if (err) {
        return callback(err);
      }
      let readEx;
      try {
        entry.readDataHeader(buffer);
        if (entry.encrypted) {
          readEx = new Error("Entry encrypted");
        }
      } catch (ex) {
        readEx = ex;
      }
      callback(readEx, entry);
    }).read(sync);
  };
  function dataOffset(entry) {
    return entry.offset + consts.LOCHDR + entry.fnameLen + entry.extraLen;
  }
  function canVerifyCrc(entry) {
    return (entry.flags & 8) !== 8;
  }
  function extract(entry, outPath, callback) {
    that.stream(entry, (err, stm) => {
      if (err) {
        callback(err);
      } else {
        let fsStm, errThrown;
        stm.on("error", (err2) => {
          errThrown = err2;
          if (fsStm) {
            stm.unpipe(fsStm);
            fsStm.close(() => {
              callback(err2);
            });
          }
        });
        fs.open(outPath, "w", (err2, fdFile) => {
          if (err2) {
            return callback(err2);
          }
          if (errThrown) {
            fs.close(fd, () => {
              callback(errThrown);
            });
            return;
          }
          fsStm = fs.createWriteStream(outPath, { fd: fdFile });
          fsStm.on("finish", () => {
            that.emit("extract", entry, outPath);
            if (!errThrown) {
              callback();
            }
          });
          stm.pipe(fsStm);
        });
      }
    });
  }
  function createDirectories(baseDir, dirs, callback) {
    if (!dirs.length) {
      return callback();
    }
    let dir = dirs.shift();
    dir = path.join(baseDir, path.join(...dir));
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err && err.code !== "EEXIST") {
        return callback(err);
      }
      createDirectories(baseDir, dirs, callback);
    });
  }
  function extractFiles(baseDir, baseRelPath, files, callback, extractedCount) {
    if (!files.length) {
      return callback(null, extractedCount);
    }
    const file = files.shift();
    const targetPath = path.join(baseDir, file.name.replace(baseRelPath, ""));
    extract(file, targetPath, (err) => {
      if (err) {
        return callback(err, extractedCount);
      }
      extractFiles(baseDir, baseRelPath, files, callback, extractedCount + 1);
    });
  }
  this.extract = function(entry, outPath, callback) {
    let entryName = entry || "";
    if (typeof entry === "string") {
      entry = this.entry(entry);
      if (entry) {
        entryName = entry.name;
      } else {
        if (entryName.length && entryName[entryName.length - 1] !== "/") {
          entryName += "/";
        }
      }
    }
    if (!entry || entry.isDirectory) {
      const files = [], dirs = [], allDirs = {};
      for (const e in entries) {
        if (Object.prototype.hasOwnProperty.call(entries, e) && e.lastIndexOf(entryName, 0) === 0) {
          let relPath = e.replace(entryName, "");
          const childEntry = entries[e];
          if (childEntry.isFile) {
            files.push(childEntry);
            relPath = path.dirname(relPath);
          }
          if (relPath && !allDirs[relPath] && relPath !== ".") {
            allDirs[relPath] = true;
            let parts = relPath.split("/").filter((f) => {
              return f;
            });
            if (parts.length) {
              dirs.push(parts);
            }
            while (parts.length > 1) {
              parts = parts.slice(0, parts.length - 1);
              const partsPath = parts.join("/");
              if (allDirs[partsPath] || partsPath === ".") {
                break;
              }
              allDirs[partsPath] = true;
              dirs.push(parts);
            }
          }
        }
      }
      dirs.sort((x, y) => {
        return x.length - y.length;
      });
      if (dirs.length) {
        createDirectories(outPath, dirs, (err) => {
          if (err) {
            callback(err);
          } else {
            extractFiles(outPath, entryName, files, callback, 0);
          }
        });
      } else {
        extractFiles(outPath, entryName, files, callback, 0);
      }
    } else {
      fs.stat(outPath, (err, stat) => {
        if (stat && stat.isDirectory()) {
          extract(entry, path.join(outPath, path.basename(entry.name)), callback);
        } else {
          extract(entry, outPath, callback);
        }
      });
    }
  };
  this.close = function(callback) {
    if (closed || !fd) {
      closed = true;
      if (callback) {
        callback();
      }
    } else {
      closed = true;
      fs.close(fd, (err) => {
        fd = null;
        if (callback) {
          callback(err);
        }
      });
    }
  };
  const originalEmit = events.EventEmitter.prototype.emit;
  this.emit = function(...args) {
    if (!closed) {
      return originalEmit.call(this, ...args);
    }
  };
};
StreamZip.setFs = function(customFs) {
  fs = customFs;
};
StreamZip.debugLog = (...args) => {
  if (StreamZip.debug) {
    console.log(...args);
  }
};
util.inherits(StreamZip, events.EventEmitter);
const propZip = Symbol("zip");
StreamZip.async = class StreamZipAsync extends events.EventEmitter {
  constructor(config) {
    super();
    const zip = new StreamZip(config);
    zip.on("entry", (entry) => this.emit("entry", entry));
    zip.on("extract", (entry, outPath) => this.emit("extract", entry, outPath));
    this[propZip] = new Promise((resolve, reject) => {
      zip.on("ready", () => {
        zip.removeListener("error", reject);
        resolve(zip);
      });
      zip.on("error", reject);
    });
  }
  get entriesCount() {
    return this[propZip].then((zip) => zip.entriesCount);
  }
  get comment() {
    return this[propZip].then((zip) => zip.comment);
  }
  async entry(name) {
    const zip = await this[propZip];
    return zip.entry(name);
  }
  async entries() {
    const zip = await this[propZip];
    return zip.entries();
  }
  async stream(entry) {
    const zip = await this[propZip];
    return new Promise((resolve, reject) => {
      zip.stream(entry, (err, stm) => {
        if (err) {
          reject(err);
        } else {
          resolve(stm);
        }
      });
    });
  }
  async entryData(entry) {
    const stm = await this.stream(entry);
    return new Promise((resolve, reject) => {
      const data = [];
      stm.on("data", (chunk) => data.push(chunk));
      stm.on("end", () => {
        resolve(Buffer.concat(data));
      });
      stm.on("error", (err) => {
        stm.removeAllListeners("end");
        reject(err);
      });
    });
  }
  async extract(entry, outPath) {
    const zip = await this[propZip];
    return new Promise((resolve, reject) => {
      zip.extract(entry, outPath, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
  async close() {
    const zip = await this[propZip];
    return new Promise((resolve, reject) => {
      zip.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};
class CentralDirectoryHeader {
  read(data) {
    if (data.length !== consts.ENDHDR || data.readUInt32LE(0) !== consts.ENDSIG) {
      throw new Error("Invalid central directory");
    }
    this.volumeEntries = data.readUInt16LE(consts.ENDSUB);
    this.totalEntries = data.readUInt16LE(consts.ENDTOT);
    this.size = data.readUInt32LE(consts.ENDSIZ);
    this.offset = data.readUInt32LE(consts.ENDOFF);
    this.commentLength = data.readUInt16LE(consts.ENDCOM);
  }
}
class CentralDirectoryLoc64Header {
  read(data) {
    if (data.length !== consts.ENDL64HDR || data.readUInt32LE(0) !== consts.ENDL64SIG) {
      throw new Error("Invalid zip64 central directory locator");
    }
    this.headerOffset = readUInt64LE(data, consts.ENDSUB);
  }
}
class CentralDirectoryZip64Header {
  read(data) {
    if (data.length !== consts.END64HDR || data.readUInt32LE(0) !== consts.END64SIG) {
      throw new Error("Invalid central directory");
    }
    this.volumeEntries = readUInt64LE(data, consts.END64SUB);
    this.totalEntries = readUInt64LE(data, consts.END64TOT);
    this.size = readUInt64LE(data, consts.END64SIZ);
    this.offset = readUInt64LE(data, consts.END64OFF);
  }
}
class ZipEntry {
  readHeader(data, offset) {
    if (data.length < offset + consts.CENHDR || data.readUInt32LE(offset) !== consts.CENSIG) {
      throw new Error("Invalid entry header");
    }
    this.verMade = data.readUInt16LE(offset + consts.CENVEM);
    this.version = data.readUInt16LE(offset + consts.CENVER);
    this.flags = data.readUInt16LE(offset + consts.CENFLG);
    this.method = data.readUInt16LE(offset + consts.CENHOW);
    const timebytes = data.readUInt16LE(offset + consts.CENTIM);
    const datebytes = data.readUInt16LE(offset + consts.CENTIM + 2);
    this.time = parseZipTime(timebytes, datebytes);
    this.crc = data.readUInt32LE(offset + consts.CENCRC);
    this.compressedSize = data.readUInt32LE(offset + consts.CENSIZ);
    this.size = data.readUInt32LE(offset + consts.CENLEN);
    this.fnameLen = data.readUInt16LE(offset + consts.CENNAM);
    this.extraLen = data.readUInt16LE(offset + consts.CENEXT);
    this.comLen = data.readUInt16LE(offset + consts.CENCOM);
    this.diskStart = data.readUInt16LE(offset + consts.CENDSK);
    this.inattr = data.readUInt16LE(offset + consts.CENATT);
    this.attr = data.readUInt32LE(offset + consts.CENATX);
    this.offset = data.readUInt32LE(offset + consts.CENOFF);
  }
  readDataHeader(data) {
    if (data.readUInt32LE(0) !== consts.LOCSIG) {
      throw new Error("Invalid local header");
    }
    this.version = data.readUInt16LE(consts.LOCVER);
    this.flags = data.readUInt16LE(consts.LOCFLG);
    this.method = data.readUInt16LE(consts.LOCHOW);
    const timebytes = data.readUInt16LE(consts.LOCTIM);
    const datebytes = data.readUInt16LE(consts.LOCTIM + 2);
    this.time = parseZipTime(timebytes, datebytes);
    this.crc = data.readUInt32LE(consts.LOCCRC) || this.crc;
    const compressedSize = data.readUInt32LE(consts.LOCSIZ);
    if (compressedSize && compressedSize !== consts.EF_ZIP64_OR_32) {
      this.compressedSize = compressedSize;
    }
    const size = data.readUInt32LE(consts.LOCLEN);
    if (size && size !== consts.EF_ZIP64_OR_32) {
      this.size = size;
    }
    this.fnameLen = data.readUInt16LE(consts.LOCNAM);
    this.extraLen = data.readUInt16LE(consts.LOCEXT);
  }
  read(data, offset, textDecoder) {
    const nameData = data.slice(offset, offset += this.fnameLen);
    this.name = textDecoder ? textDecoder.decode(new Uint8Array(nameData)) : nameData.toString("utf8");
    const lastChar = data[offset - 1];
    this.isDirectory = lastChar === 47 || lastChar === 92;
    if (this.extraLen) {
      this.readExtra(data, offset);
      offset += this.extraLen;
    }
    this.comment = this.comLen ? data.slice(offset, offset + this.comLen).toString() : null;
  }
  validateName() {
    if (/\\|^\w+:|^\/|(^|\/)\.\.(\/|$)/.test(this.name)) {
      throw new Error("Malicious entry: " + this.name);
    }
  }
  readExtra(data, offset) {
    let signature, size;
    const maxPos = offset + this.extraLen;
    while (offset < maxPos) {
      signature = data.readUInt16LE(offset);
      offset += 2;
      size = data.readUInt16LE(offset);
      offset += 2;
      if (consts.ID_ZIP64 === signature) {
        this.parseZip64Extra(data, offset, size);
      }
      offset += size;
    }
  }
  parseZip64Extra(data, offset, length) {
    if (length >= 8 && this.size === consts.EF_ZIP64_OR_32) {
      this.size = readUInt64LE(data, offset);
      offset += 8;
      length -= 8;
    }
    if (length >= 8 && this.compressedSize === consts.EF_ZIP64_OR_32) {
      this.compressedSize = readUInt64LE(data, offset);
      offset += 8;
      length -= 8;
    }
    if (length >= 8 && this.offset === consts.EF_ZIP64_OR_32) {
      this.offset = readUInt64LE(data, offset);
      offset += 8;
      length -= 8;
    }
    if (length >= 4 && this.diskStart === consts.EF_ZIP64_OR_16) {
      this.diskStart = data.readUInt32LE(offset);
    }
  }
  get encrypted() {
    return (this.flags & consts.FLG_ENTRY_ENC) === consts.FLG_ENTRY_ENC;
  }
  get isFile() {
    return !this.isDirectory;
  }
}
class FsRead {
  constructor(fd, buffer, offset, length, position, callback) {
    this.fd = fd;
    this.buffer = buffer;
    this.offset = offset;
    this.length = length;
    this.position = position;
    this.callback = callback;
    this.bytesRead = 0;
    this.waiting = false;
  }
  read(sync) {
    StreamZip.debugLog("read", this.position, this.bytesRead, this.length, this.offset);
    this.waiting = true;
    let err;
    if (sync) {
      let bytesRead = 0;
      try {
        bytesRead = fs.readSync(
          this.fd,
          this.buffer,
          this.offset + this.bytesRead,
          this.length - this.bytesRead,
          this.position + this.bytesRead
        );
      } catch (e) {
        err = e;
      }
      this.readCallback(sync, err, err ? bytesRead : null);
    } else {
      fs.read(
        this.fd,
        this.buffer,
        this.offset + this.bytesRead,
        this.length - this.bytesRead,
        this.position + this.bytesRead,
        this.readCallback.bind(this, sync)
      );
    }
  }
  readCallback(sync, err, bytesRead) {
    if (typeof bytesRead === "number") {
      this.bytesRead += bytesRead;
    }
    if (err || !bytesRead || this.bytesRead === this.length) {
      this.waiting = false;
      return this.callback(err, this.bytesRead);
    } else {
      this.read(sync);
    }
  }
}
class FileWindowBuffer {
  constructor(fd) {
    this.position = 0;
    this.buffer = Buffer.alloc(0);
    this.fd = fd;
    this.fsOp = null;
  }
  checkOp() {
    if (this.fsOp && this.fsOp.waiting) {
      throw new Error("Operation in progress");
    }
  }
  read(pos, length, callback) {
    this.checkOp();
    if (this.buffer.length < length) {
      this.buffer = Buffer.alloc(length);
    }
    this.position = pos;
    this.fsOp = new FsRead(this.fd, this.buffer, 0, length, this.position, callback).read();
  }
  expandLeft(length, callback) {
    this.checkOp();
    this.buffer = Buffer.concat([Buffer.alloc(length), this.buffer]);
    this.position -= length;
    if (this.position < 0) {
      this.position = 0;
    }
    this.fsOp = new FsRead(this.fd, this.buffer, 0, length, this.position, callback).read();
  }
  expandRight(length, callback) {
    this.checkOp();
    const offset = this.buffer.length;
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(length)]);
    this.fsOp = new FsRead(
      this.fd,
      this.buffer,
      offset,
      length,
      this.position + offset,
      callback
    ).read();
  }
  moveRight(length, callback, shift) {
    this.checkOp();
    if (shift) {
      this.buffer.copy(this.buffer, 0, shift);
    } else {
      shift = 0;
    }
    this.position += shift;
    this.fsOp = new FsRead(
      this.fd,
      this.buffer,
      this.buffer.length - shift,
      shift,
      this.position + this.buffer.length - shift,
      callback
    ).read();
  }
}
class EntryDataReaderStream extends stream.Readable {
  constructor(fd, offset, length) {
    super();
    this.fd = fd;
    this.offset = offset;
    this.length = length;
    this.pos = 0;
    this.readCallback = this.readCallback.bind(this);
  }
  _read(n) {
    const buffer = Buffer.alloc(Math.min(n, this.length - this.pos));
    if (buffer.length) {
      fs.read(this.fd, buffer, 0, buffer.length, this.offset + this.pos, this.readCallback);
    } else {
      this.push(null);
    }
  }
  readCallback(err, bytesRead, buffer) {
    this.pos += bytesRead;
    if (err) {
      this.emit("error", err);
      this.push(null);
    } else if (!bytesRead) {
      this.push(null);
    } else {
      if (bytesRead !== buffer.length) {
        buffer = buffer.slice(0, bytesRead);
      }
      this.push(buffer);
    }
  }
}
class EntryVerifyStream extends stream.Transform {
  constructor(baseStm, crc, size) {
    super();
    this.verify = new CrcVerify(crc, size);
    baseStm.on("error", (e) => {
      this.emit("error", e);
    });
  }
  _transform(data, encoding, callback) {
    let err;
    try {
      this.verify.data(data);
    } catch (e) {
      err = e;
    }
    callback(err, data);
  }
}
class CrcVerify {
  constructor(crc, size) {
    this.crc = crc;
    this.size = size;
    this.state = {
      crc: -1,
      size: 0
    };
  }
  data(data) {
    const crcTable = CrcVerify.getCrcTable();
    let crc = this.state.crc;
    let off = 0;
    let len = data.length;
    while (--len >= 0) {
      crc = crcTable[(crc ^ data[off++]) & 255] ^ crc >>> 8;
    }
    this.state.crc = crc;
    this.state.size += data.length;
    if (this.state.size >= this.size) {
      const buf = Buffer.alloc(4);
      buf.writeInt32LE(~this.state.crc & 4294967295, 0);
      crc = buf.readUInt32LE(0);
      if (crc !== this.crc) {
        throw new Error("Invalid CRC");
      }
      if (this.state.size !== this.size) {
        throw new Error("Invalid size");
      }
    }
  }
  static getCrcTable() {
    let crcTable = CrcVerify.crcTable;
    if (!crcTable) {
      CrcVerify.crcTable = crcTable = [];
      const b = Buffer.alloc(4);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 8; --k >= 0; ) {
          if ((c & 1) !== 0) {
            c = 3988292384 ^ c >>> 1;
          } else {
            c = c >>> 1;
          }
        }
        if (c < 0) {
          b.writeInt32LE(c, 0);
          c = b.readUInt32LE(0);
        }
        crcTable[n] = c;
      }
    }
    return crcTable;
  }
}
function parseZipTime(timebytes, datebytes) {
  const timebits = toBits(timebytes, 16);
  const datebits = toBits(datebytes, 16);
  const mt = {
    h: parseInt(timebits.slice(0, 5).join(""), 2),
    m: parseInt(timebits.slice(5, 11).join(""), 2),
    s: parseInt(timebits.slice(11, 16).join(""), 2) * 2,
    Y: parseInt(datebits.slice(0, 7).join(""), 2) + 1980,
    M: parseInt(datebits.slice(7, 11).join(""), 2),
    D: parseInt(datebits.slice(11, 16).join(""), 2)
  };
  const dt_str = [mt.Y, mt.M, mt.D].join("-") + " " + [mt.h, mt.m, mt.s].join(":") + " GMT+0";
  return new Date(dt_str).getTime();
}
function toBits(dec, size) {
  let b = (dec >>> 0).toString(2);
  while (b.length < size) {
    b = "0" + b;
  }
  return b.split("");
}
function readUInt64LE(buffer, offset) {
  return buffer.readUInt32LE(offset + 4) * 4294967296 + buffer.readUInt32LE(offset);
}
var node_stream_zip = StreamZip;
const StreamZip$1 = /* @__PURE__ */ getDefaultExportFromCjs(node_stream_zip);
class ArchiveReaderStreamZip {
  constructor(archivePath) {
    __publicField(this, "archivePath");
    this.archivePath = archivePath;
  }
  /**
   * Ищет в архиве папку "cookies", проходит по всем файлам в ней,
   * ищет строку, соответствующую регулярному выражению /EPIC_EG1\s+([^\s]+)/,
   * и возвращает найденные токены. Все операции выполняются с использованием node-stream-zip.
   */
  findEpicTokensInCookiesFolder() {
    return new Promise((resolve, reject) => {
      const zip = new StreamZip$1({
        file: this.archivePath,
        storeEntries: true
      });
      zip.on("error", (err) => {
        zip.close();
        reject(err);
      });
      zip.on("ready", () => {
        const tokens = [];
        const entries = zip.entries();
        const promises = [];
        for (const entryName in entries) {
          const entry = entries[entryName];
          if (entry.isDirectory) continue;
          const segments = entry.name.toLowerCase().split("/");
          if (!segments.includes("cookies")) continue;
          const p = new Promise((res, rej) => {
            zip.stream(entry.name, (err, stream2) => {
              if (err || !stream2) {
                return rej(err || new Error(`Ошибка открытия потока для ${entry.name}`));
              }
              const chunks = [];
              stream2.on("data", (chunk) => chunks.push(chunk));
              stream2.on("end", () => {
                const content = Buffer.concat(chunks).toString("utf8");
                const match = content.match(/EPIC_EG1\s+([^\s]+)/);
                if (match && match[0]) {
                  tokens.push(match[0]);
                }
                res();
              });
              stream2.on("error", (err2) => {
                rej(err2);
              });
            });
          });
          promises.push(p);
        }
        Promise.all(promises).then(() => {
          zip.close();
          resolve(tokens);
        }).catch((err) => {
          zip.close();
          reject(err);
        });
      });
    });
  }
}
const parseBase = async (basePath) => {
  const reader = new ArchiveReaderStreamZip(basePath);
  const tokens = await reader.findEpicTokensInCookiesFolder();
  return tokens;
};
const Base = [];
ipcMain.handle("upload-base", async () => {
  const file = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "", extensions: ["rar", "zip", "7zip"] }]
  });
  if (file.canceled || file.filePaths.length === 0) {
    return null;
  }
  win == null ? void 0 : win.webContents.send("update-state", "loading", "state.uploadingBase");
  const logs = await parseBase(file.filePaths[0]);
  Base.length = 0;
  Base.push(...logs);
  win == null ? void 0 : win.webContents.send("update-state", "iddle", "state.iddle");
  return win == null ? void 0 : win.webContents.send("update-results", "lines", Base.length);
});
ipcMain.handle("upload-proxy", async () => {
  const file = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "", extensions: ["txt"] }]
  });
  if (file.canceled || file.filePaths.length === 0) {
    return null;
  }
  try {
    const fileContent = await require$$0.promises.readFile(file.filePaths[0], "utf-8");
    Proxies.length = 0;
    Proxies.push(...parseProxy(fileContent));
    return win == null ? void 0 : win.webContents.send("update-results", "proxies", Proxies.length);
  } catch (error) {
    console.error("Ошибка при чтении файла:", error);
    return null;
  }
});
ipcMain.on("close-app", () => win.close());
ipcMain.on("minimize-app", () => win.minimize());
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      webSecurity: true
    },
    width: 1050,
    height: 710,
    frame: false,
    resizable: false,
    maximizable: false
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
});
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  app2 as app,
  win
};
