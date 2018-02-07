const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ss = require('socket.io-stream');
const mime = require('mime-types')

const { ensurePath } = require('./server/services')
const port = 3000;



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
		let uploadStream = fs.createWriteStream(filePath);
		stream.on('data', (data) => {
			console.log(data);
			uploadStream.write(data);
		})
		stream.on('end', () => {
			uploadStream.destroy();
			user.emit('success');
		})
	})

	user.on('findFile', async (data) => {
		let filePath = data.filePath;
		if (user.id !== data.userId) {
			return;
		}
		try {
			if (await fs.stat(filePath)) {
				user.emit('download', { filePath: filePath })
			}
		} catch (err) {
			user.emit('nofound');
		}
	})
})

app.get('/download/:filePath', (req, res) => {
	let filePath = path.resolve('uploaded files/' + req.params.filePath),
		fileName = req.params.filePath;
	let contentType = mime.lookup(filePath);
	res.set('Content-type',contentType);
	res.download(filePath,fileName);
	// let downloadStream = fs.createReadStream(filePath);
	// downloadStream.on('data',(data) => {
	// 	console.log('in')
	// 	res.write(JSON.stringify({data: data}));
	// })
	// downloadStream.on('end',() => {
	// 	res.end();
	// })
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
// 	let filePath = path.resolve(req.body.filePath),
// 		fileName = path.basename(filePath);
// 	res.set('Content-disposition', "attachment");
// 	res.set('filename', fileName);
// 	res.send(filePath);
// })

