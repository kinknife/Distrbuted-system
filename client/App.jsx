import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.less";
import { messageService } from "./services/messages";
import { LoginPage } from "./component/LoginPage";
import { ToolBar } from "./component/ToolBar";
import { UploadFiles } from "./component/uploadFiles";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "kinknife",
      res: null,
      files: [],
      uploadingFiles: {}
    };
  }
  handleUpload() {
    let uploadFile = this.fileInput.files[0],
        newUploadFile = {};
    newUploadFile[uploadFile.name] = {size: uploadFile.size}
    this.setState({
      uploadingFiles: Object.assign(this.state.uploadingFiles,newUploadFile)
    })
    messageService.upload(uploadFile, this.state.id);
  }

  handleDownload() {
    messageService.download("./uploaded files/kinknife/lịch học.PNG");
  }

  handlePauseUpload() {
    messageService.pause(this.fileInput.files[0].name);
  }

  handleResumeUpload() {
    messageService.resume(this.fileInput.files[0].name);
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
      } else {
        this.setState({
          res: res
        });
      }
    });
  }

  renderUploadFile() {
    if (Object.keys(this.state.uploadingFiles).length > 0) {
      return <UploadFiles ref={(uploadPopup) => {this.uploadPopup = uploadPopup}} uploading={this.state.uploadingFiles}/>;
    }
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
            <button onClick={() => this.handleUpload()}>upload</button>
            <button onClick={() => this.handleDownload()}>download</button>
            <button onClick={() => this.handlePauseUpload()}>pause</button>
            <button onClick={() => this.handleResumeUpload()}>resume</button>
          </div>
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
