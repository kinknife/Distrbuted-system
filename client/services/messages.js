const io = require('socket.io-client');
const ss = require('../client-lib/socket.io-stream.js');
const path = require('path');
import * as axios from 'axios'


class MessageService {
    constructor() {
        let socket = io.connect('/');
        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('download', (data) => {
                let fileName = path.basename(data.filePath)
                window.open(`${window.location.href}download/${fileName}`,'_blank');
            })
        })
    }

    upload(file) {
        if (!this.socket) {
            return;
        }
        let stream = ss.createStream();
        ss(this.socket).emit('upload', stream, { fileName: file.name })
        ss.createBlobReadStream(file).pipe(stream)
        this.socket.on('success', () => {
            console.log('success');
        })
    }

    download(filePath) {
        this.socket.emit('findFile', {filePath: filePath, userId: this.socket.id});
    }


}

export let messageService = new MessageService();