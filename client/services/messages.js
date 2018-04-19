const io = require('socket.io-client');
const ss = require('../client-lib/socket.io-stream.js');
const path = require('path');
import * as axios from 'axios'


class MessageService {
    constructor() {
        let socket = io.connect('/');
        this.uploading = {};
        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('download', (data) => {
                window.open(`${window.location.href}download/${data.filePath}`,'_blank');
            })
        })
    }

    upload(file, username) {
        if (!this.socket || this.uploading[file.name]) {
            return;
        }
        let stream = ss.createStream();
        ss(this.socket).emit('upload', stream, { fileName: `${username}/${file.name}` })
        let readStream = ss.createBlobReadStream(file)
        this.uploading[file.name] = {stream: stream, readStream: readStream};
        readStream.pipe(stream);
        this.socket.on('success', () => {
            console.log('success');
        })
    }

    download(filePath) {
        this.socket.emit('findFile', {filePath: filePath, userId: this.socket.id});
    }

    pause(fileName) {
        this.uploading[fileName].readStream.unpipe(this.uploading[fileName].stream);
        this.uploading[fileName].readStream.pause();
    }

    resume(fileName) {
        this.uploading[fileName].readStream.resume();
        this.uploading[fileName].readStream.pipe(this.uploading[fileName].stream);
    }
    getFile(username) {
        return axios.post('/files', {username: username}).then((res) => {
            let files = res.data;
            return files
        })
    }

    login(message) {
        return axios.post('/login', message).then((res) => {
            return res.data
        })
    }

    sigup(message) {
        return axios.post('/signup', message).then((res) => {
            let {success, error} = res.data;
            return {
                success: success,
                error: error
            }
        })
    }
}

export let messageService = new MessageService();