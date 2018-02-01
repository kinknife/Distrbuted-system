const io = require('socket.io-client');
const ss = require('../client-lib/socket.io-stream.js');
import * as fileStream from 'streamsaver';
import * as axios from 'axios'

class MessageService {
    constructor() {
        let socket = io.connect('/');
        socket.on('connect', () => {
            this.socket = socket;
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
        this.socket.emit('findFile', {filePath: filePath});
        this.socket.on('download', (data) => {
            window.open('${window.location.href}download', '_blank')
        })
        this.socket.on('nofound', () => {
            return 'abc';
        })
    }


}

export let messageService = new MessageService();