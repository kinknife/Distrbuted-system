const io = require("socket.io-client");
const ss = require("../client-lib/socket.io-stream.js");
const path = require("path");
const streamSaver = require('streamsaver');
import * as axios from "axios";

class MessageService {
  constructor() {
    let socket = io.connect("/");
    this.uploading = {};
    this.username = null;
    this.uploadedFile = null;
    this._updateCb = [];
    socket.on("connect", () => {
      this.socket = socket;
      this.socket.on("success", data => {
        delete this.uploading[data.fileName];
        this.uploadedFile = data.newFile;
        this.callUpdate();
        this.nextFile();
      });
    });
    socket.on('disconnect', () => {
      for(let each in this.uploading) {
        if(this.uploading[each].status === 'uploading') {
          this.uploading[each].readStream.unpipe(this.uploading[each].stream);
          this.uploading[each].readStream.pause();
        }
      }
    })
  }

  setUserName(username) {
    this.username = username
  }

  callUpdate() {
    this._updateCb.forEach(cb => {
      cb();
    });
  }

  updatedUpload() {
    this.uploadedFile = null;
  }

  addUpdateFun(cb) {
    this._updateCb.push(cb);
    cb();
  }

  nextFile() {
    let keys = Object.keys(this.uploading);
    for (let key of keys) {
      if (this.uploading[key].status === "pending") {
        if (!this.uploading[key].stream) {
          let stream = ss.createStream();
          console.log(`${this.username}/${key}`);
          ss(this.socket).emit("upload", stream, {
            fileName: `${this.username}/${key}`,
            size: this.uploading[key].size,
            dup: this.uploading[key].dup
          });
          this.uploading[key].readStream.resume()
          this.uploading[key] = Object.assign(this.uploading[key], {
            stream: stream,
            status: "uploading"
          });
          this.uploading[key].readStream.on("data", chunk => {
            this.uploading[key].uploaded += chunk.length;
            this.callUpdate();
          });
          this.uploading[key].readStream.pipe(stream);
        } else {
          this.uploading[key].readStream.resume();
          this.uploading[key].readStream.pipe(this.uploading[key].stream);
          this.uploading[key].status = 'uploading';
        }
        break;
      }
    }
  }

  upload(file, username, dup, newName) {
    let fileName = newName ? newName : file.name
    if (!this.socket || this.uploading[fileName]) {
      return;
    }
    let uploadingFile = Object.keys(this.uploading).find(key => {
      return this.uploading[key].status === "uploading";
    });
    if (!uploadingFile) {
      let stream = ss.createStream();
      ss(this.socket).emit("upload", stream, {
        fileName: `${username}/${fileName}`,
        size: file.size,
        dup: dup
      });
      let readStream = ss.createBlobReadStream(file);
      this.uploading[fileName] = {
        stream: stream,
        readStream: readStream,
        status: "uploading",
        uploaded: 0
      };
      readStream.on("data", chunk => {
        this.uploading[fileName].uploaded += chunk.length;
        this.callUpdate()
      });
      readStream.pipe(stream);
    } else {
      let readStream = ss.createBlobReadStream(file);
      readStream.pause();
      this.uploading[fileName] = {
        stream: null,
        readStream: readStream,
        status: "pending",
        uploaded: 0,
        dup: dup
      };
      this.callUpdate();
    }
  }

  download(filePath) {
    let stream = ss.createStream(),
        fileStream = streamSaver.createWriteStream(path.basename(filePath)),
        writer = fileStream.getWriter();
    ss(this.socket).emit("fileDownload", stream ,{
      filePath: filePath
    });
    stream.on('data', data => {
      writer.write(data);
    })
    stream.on('end', () => {
      writer.close();
    })
  }

  pause(fileName) {
    this.uploading[fileName].readStream.unpipe(this.uploading[fileName].stream);
    this.uploading[fileName].readStream.pause();
    this.uploading[fileName].status = "paused";
    this.nextFile();
    this.callUpdate();
  }

  resume(fileName) {
    let uploadingFile = Object.keys(this.uploading).find(key => {
      this.uploading[key].status === "uploading";
    });
    if (!uploadingFile) {
      this.uploading[fileName].readStream.resume();
      this.uploading[fileName].readStream.pipe(this.uploading[fileName].stream);
      this.uploading[fileName].status = "uploading";
    } else {
      this.uploading[fileName].status = "pending";
    }
    this.callUpdate();
  }

  cancelUpload(filePath) {
    let fileName = path.basename(filePath)
    this.uploading[fileName].readStream.unpipe(this.uploading[fileName].stream);
    this.uploading[fileName].readStream.pause();
    this.socket.emit('cancelUpload', {
      filePath: filePath
    })
    delete this.uploading[fileName]
  }

  getFile(username) {
    return axios.post("/files", { username: username }).then(res => {
      let files = res.data;
      return files;
    });
  }

  login(message) {
    return axios.post("/login", message).then(res => {
      return res.data;
    });
  }

  sigup(message) {
    return axios.post("/signup", message).then(res => {
      let { success, error } = res.data;
      return {
        success: success,
        error: error
      };
    });
  }
}

export let messageService = new MessageService();
