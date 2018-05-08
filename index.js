const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const ss = require("socket.io-stream");
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
  let uploading = {};
  ss(user).on("upload", async (stream, data) => {
    let filePath = path.resolve("./uploaded files/" + data.fileName);
    let dir = path.dirname(filePath);
    let truePath = filePath;
    let objectName = filePath;
    await ensurePath(dir);
    if (data.dup) {
      filePath += ".backup";
      objectName = filePath;
    }

    let uploadStream = fs.createWriteStream(filePath);
    uploading[truePath] = {
      filePath: filePath,
      uploadStream: uploadStream,
      size: data.size,
      uploaded: 0
    };
    stream.on("data", data => {
      uploadStream.write(data);
      uploading[truePath].uploaded += data.length;
    });
    stream.on("end", async () => {
      uploadStream.destroy();
      if (filePath.indexOf(".backup") !== -1) {
        await fs.unlink(truePath);
        await fs.rename(filePath, truePath);
        delete uploading[truePath];
      }
      let stats = await fs.stat(truePath),
          newFile = {
            createTime: stats.birthtime,
            size: stats.size,
            name: path.basename(truePath)
          };
      user.emit("success", {fileName:path.basename(truePath),newFile: newFile});
    });
  });

  user.on("cancelUpload", async data => {
    let filePath = path.resolve(data.filePath);
    if(uploading[filePath]){
      await uploading[filePath].uploadStream.destroy();
      await fs.unlink(uploading[filePath].filePath);
      delete uploading[filePath];
    }
  });

  user.on("disconnect", async () => {
    for (let each in uploading) {
      if (uploading[each].uploaded === uploading[each].size) {
        continue;
      }
      await uploading[each].uploadStream.destroy();
      await fs.unlink(uploading[each].filePath);
    }
  });

  ss(user).on("fileDownload", (stream, data) => {
    let filePath = path.resolve(data.filePath);
    let readStream = fs.createReadStream(filePath);
    readStream.pipe(stream);
  });
});

app.post("/files", async (req, res) => {
  let { username } = req.body;
  let files = await fs.readdir(`./uploaded files/${username}`),
    dirPath = `./uploaded files/${username}`;
  uploadFiles = [];
  for (let each of files) {
    try {
      let stats = await fs.stat(path.join(dirPath, each)),
        newFile = {
          createTime: stats.birthtime,
          size: stats.size,
          name: each
        };
      uploadFiles.push(newFile);
    } catch (err) {
      continue;
    }
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
