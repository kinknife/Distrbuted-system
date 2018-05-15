import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.less";
import { messageService } from "./services/messages";
import {
  LoginPage,
  ToolBar,
  UploadFiles,
  FileTable,
  ComfirmPopup
} from "./component";
const throttle = require("./client-lib/throttle");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      res: null,
      files: [],
      uploadingFiles: {},
      comfirmPopup: false
    };
  }

  componentDidMount() {
    messageService.addUpdateFun(
      throttle.delay(this.updateUpload.bind(this), 200)
    );
    messageService.getFile(this.state.id).then(res => {
      this.setState({
        files: res
      });
    });
    messageService.setUserName(this.state.id);
  }

  updateUpload() {
    let keys = Object.keys(this.state.uploadingFiles),
      cloneUpload = this.state.uploadingFiles;
    for (let key of keys) {
      if (messageService.uploading[key]) {
        cloneUpload[key].uploaded = messageService.uploading[key].uploaded;
        cloneUpload[key].status = messageService.uploading[key].status;
      } else {
        delete cloneUpload[key];
        if (messageService.uploadedFile) {
          let newFile = messageService.uploadedFile;
          let newUploadFile = this.state.files;
          let existedFile = newUploadFile.find(file => {
            return file.name === newFile.name;
          });
          if (!existedFile) {
            newUploadFile.push(messageService.uploadedFile);
          } else {
            existedFile = Object.assign(existedFile, newFile);
          }
          this.setState({
            files: newUploadFile
          });
          messageService.updatedUpload();
        }
      }
    }
    this.setState({
      uploadingFiles: cloneUpload
    });
  }

  handleUpload() {
    let uploadFile = this.fileInput.files[0],
      newUploadFile = {};
    if(this.checkFileName(uploadFile.name)) {
      this.setState({
        comfirmPopup: true
      });
      return;
    }
    newUploadFile[uploadFile.name] = { size: uploadFile.size, dup: false };
    this.setState({
      uploadingFiles: Object.assign(this.state.uploadingFiles, newUploadFile)
    });
    messageService.upload(uploadFile, this.state.id, false);
    this.fileInput.value = ''
  }

  handleDownload(fileName) {
    let filePath = `./uploaded files/${this.state.id}/${fileName}`;
    messageService.download(filePath);
  }

  handlePauseUpload(fileName) {
    messageService.pause(fileName);
  }

  handleResumeUpload(fileName) {
    messageService.resume(fileName);
  }

  handleCancelUpload(fileName) {
    console.log(fileName);
    let filePath = `./uploaded files/${this.state.id}/${fileName}`;
    messageService.cancelUpload(filePath);
  }

  handleLogin(message) {
    messageService.login(message).then(res => {
      if (res.success) {
        messageService.getFile(message.username).then(res => {
          this.setState({
            files: res
          });
        });
        this.setState({
          id: message.username
        });
        messageService.setUserName(this.state.id);
      } else {
        this.setState({
          res: res
        });
      }
    });
  }

  handleSignup(message) {
    messageService.sigup(message).then(res => {
      if (res.success) {
        this.setState({
          id: message.username
        });
        messageService.setUserName(this.state.id);
      } else {
        this.setState({
          res: res
        });
      }
    });
  }

  renderUploadFile() {
    if (Object.keys(this.state.uploadingFiles).length > 0) {
      return (
        <UploadFiles
          ref={uploadPopup => {
            this.uploadPopup = uploadPopup;
          }}
          uploading={this.state.uploadingFiles}
          handlePauseUpload={fileName => {
            this.handlePauseUpload(fileName);
          }}
          handleResumeUpload={fileName => {
            this.handleResumeUpload(fileName);
          }}
          handleCancelUpload={fileName => {
            this.handleCancelUpload(fileName);
          }}
        />
      );
    }
  }

  renderPopup() {
    if(this.state.comfirmPopup){
      return (
        <div className="noRoot">
          <ComfirmPopup 
            applyNewName = {() => {this.applyNewName()}}
            keepOld = {() => {this.keepOld()}}
            closePopup = {() => {this.closePopup()}}
          />
        </div>
      );
    }
  }

  applyNewName() {
    let uploadFile = this.fileInput.files[0]
		let extentName = uploadFile.name.split('.').pop();
    let baseName;
    let newUploadFile = {};
    let i = 1
    if(extentName.length === uploadFile.name.length) {
      baseName = extentName;
      extentName = '';
    } else {
      baseName = uploadFile.name.slice(0, -extentName.length - 1);
      extentName = '.' + extentName
    }
    let newName = baseName + ` (${i})` + extentName;
    while(this.checkFileName(newName)) {
      i++;
      newName = baseName + ` ${i}` + extentName;
    }
    newUploadFile[newName] = { size: uploadFile.size, dup: false };
    this.setState({
      uploadingFiles: Object.assign(this.state.uploadingFiles, newUploadFile)
    });
    messageService.upload(uploadFile, this.state.id, false, newName);
    this.fileInput.value = ''
    this.closePopup()
  }

  keepOld() {
    let uploadFile = this.fileInput.files[0];
    let newUploadFile = {};
    newUploadFile[uploadFile.name] = { size: uploadFile.size, dup: true };
    this.setState({
      uploadingFiles: Object.assign(this.state.uploadingFiles, newUploadFile)
    });
    messageService.upload(uploadFile, this.state.id, true);
    this.fileInput.value = ''
    this.closePopup()
  }

  closePopup() {
    this.setState({
      comfirmPopup: false
    })
  }

  checkFileName(name) {
    for (let each of this.state.files) {
      if (each.name === name) {
        this.setState({
          comfirmPopup: true
        });
        return true;
      }
    }
    return false
  }

  render() {
    if (this.state.id) {
      return (
        <div className="App">
          <div className="App-header">
            <h1 className="App-title">Welcome to React</h1>
            <div
              className="uploadBtn"
              onClick={() => {
                this.fileInput.click();
              }}
            >
              <button>file_upload</button>upload file
            </div>
            <input
              className="uploadInput"
              type="file"
              name="uploads[]"
              multiple="multiple"
              ref={fileInput => (this.fileInput = fileInput)}
              onChange={() => {
                this.handleUpload();
              }}
            />
          </div>
          <div className="appBody">
            <FileTable
              files={this.state.files}
              handleDownload={fileName => {
                this.handleDownload(fileName);
              }}
            />
          </div>
          {this.renderPopup()}
          {this.renderUploadFile()}
        </div>
      );
    } else {
      return (
        <LoginPage
          handleLogin={message => {
            this.handleLogin(message);
          }}
          handleSigup={message => {
            this.handleSignup(message);
          }}
          res={this.state.res}
        />
      );
    }
  }
}

export default App;
