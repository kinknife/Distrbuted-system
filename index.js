const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ss = require('socket.io-stream');

const { ensurePath } = require('./server/services')


// App configuration.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'dist')))


http.listen(port, function () {
	console.log("Server Started at port 3000");
});


io.sockets.on('connection', (user) => {
	ss(user).on('upload', async (stream, data) => {
		let dir = path.resolve('./uploaded files'),
			filePath = path.resolve('./uploaded files/' + data.fileName);
		await ensurePath(dir);
		stream.on('data', (data) => {
			fs.createWriteStream(filePath, data)
		})
		stream.on('end', () => {
			user.emit('success');
		})
	})

	user.on('findFile', async (data) => {
		let filePath = path.resolve(data.filePath);
		try {
			if(await fs.stat(filePath)){
				user.emit('download', { serverPath: filePath })
			}
		} catch (err) {
			user.emit('nofound');
		}
	})
})
// app.post('/upload',async (req, res) => {
// 	let tempPath = './temp'
// 	ensurePath(tempPath);
// 	if(md5(req.files.blobChunk.data) !== req.files.blobChunk.md5) {
// 		res.send({match: false})
// 	}
// 	console.log(req.files.blobChunk.data.byteLength)
// 	// if (firstChunk(tempPath + '/' + req.body.fileName)) {

// 	// }
// 	res.status(200).send('upload success chunk ' + req.body.chunkIndex);
// 	// fs.writeFileSync('./uploaded files/'+ req.body.fileName,req.files.blobChunk.data);
// 	// let filePath = path.resolve('./uploaded files/' + req.files.file.name);
// 	// await ensurePath(path.dirname(filePath));
// 	// fs.writeFileSync(filePath,req.files.file.data)
// })

// app.post('/download', (req, res) => {
// 	let filePath = path.resolve(req.body.path),
// 		fileName = path.dirname(filePath)
// 	res.download(filePath,fileName)
// })