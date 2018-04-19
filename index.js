const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const ss = require("socket.io-stream");
const mime = require("mime-types");
const md5 = require("md5");

const { ensurePath } = require("./server/services");
const port = 4000;

let users = [];

startServer();

async function startServer() {
  let filePath = path.join(__dirname, "users.json");
  try {
    if (await fs.stat(filePath)) {
      let data = fs.readFileSync(filePath, "utf-8");
      users = JSON.parse(data);
    }
  } catch (err) {
    let json = {
      users: []
    };
    fs.writeFile(filePath, JSON.stringify(json, null, "\t"));
  }
}

// App configuration.
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(path.join(__dirname, "dist")));

http.listen(port, function() {
  console.log("Server Started at port 4000");
});

io.sockets.on("connection", user => {
  ss(user).on("upload", async (stream, data) => {
    let dir = path.resolve("./uploaded files"),
      filePath = path.resolve("./uploaded files/" + data.fileName);
    await ensurePath(dir);
    let uploadStream = fs.createWriteStream(filePath);
    stream.on("data", data => {
      uploadStream.write(data);
    });
    stream.on("end", () => {
      console.log("end");
      uploadStream.destroy();
      user.emit("success");
    });
  });

  user.on("findFile", async data => {
    let filePath = data.filePath;
    if (user.id !== data.userId) {
      return;
    }
    try {
      if (await fs.stat(filePath)) {
        user.emit("download", { filePath: filePath });
      }
    } catch (err) {
      user.emit("nofound");
    }
  });
});

app.get("/download/:filePath/:fileDir/:fileName", (req, res) => {
  let filePath = path.resolve("uploaded files/" + req.params.fileDir + '/' + req.params.fileName),
    fileName = req.params.fileName;
  let contentType = mime.lookup(filePath);
  res.set("Content-type", contentType);
  res.download(filePath, fileName);
  // let downloadStream = fs.createReadStream(filePath);
  // downloadStream.on('data',(data) => {
  // 	console.log('in')
  // 	res.write(JSON.stringify({data: data}));
  // })
  // downloadStream.on('end',() => {
  // 	res.end();
  // })
});

app.post("/files", async (req, res) => {
  let { username } = req.body;
  let files = await fs.readdir(`./uploaded files/${username}`),
    dirPath = `./uploaded files/${username}`;
  uploadFiles = [];
  for (let each of files) {
    let stats = await fs.stat(path.join(dirPath, each)),
      newFile = {
        createTime: stats.birthtime,
        size: stats.size,
        name: each
      };
    uploadFiles.push(newFile);
  }
  res.send(uploadFiles);
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  let loginUser = users.find(user => {
    return user.username === username;
  });
  if (loginUser) {
    if (loginUser.password === md5(password)) {
      res.send({ success: true, error: null });
    } else {
      res.send({ success: false, error: "Password and username not match" });
    }
  } else {
    res.send({ success: false, error: "This username not registered!" });
  }
});

app.post("/signup", async (req, res) => {
  let { username, password } = req.body,
    newUser = {
      username: username,
      password: md5(password),
      uploadLocat: `uploaded files/${username}`
    };
  let existedUsername = users.find(user => {
    return user.username === username;
  });
  if (existedUsername) {
    res.send({ success: false, error: "existed username" });
  } else {
    ensurePath(newUser.uploadLocat);
    users.push(newUser);
    fs.writeFile(
      path.join(__dirname, "users.json"),
      JSON.stringify(users, null, "\t")
    );
    res.send({ success: true, error: null });
  }
});
