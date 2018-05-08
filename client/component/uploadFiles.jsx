import React, { Component } from "react";
import "./UploadFiles.less";

class UploadFiles extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(props) {}

  getControlButton(file, fileName) {
    let btn;
    if (file.status === "uploading" || file.status === "pending") {
      btn = (
        <div>
          <button onClick={() => {this.props.handlePauseUpload(fileName)}}>pause</button>
          <button onClick={() => {this.props.handleCancelUpload(fileName)}}>clear</button>
        </div>
      );
    } else {
      btn = (
        <div>
          <button onClick={() => {this.props.handleResumeUpload(fileName)}}>play_arrow</button>
          <button onClick={() => {this.props.handleCancelUpload(fileName)}}>clear</button>
        </div>
      );
    }
    return btn;
  }

  addToContiner() {
    let UploadFiles = this.props.uploading,
      uploads = Object.keys(UploadFiles).map((key, index) => (
        <div className="uploadFile" key={index}>
          <div className="infoContainer">
            <span>{key}</span>
            <div className="processBox">
              <div
                className="processBar"
                style={{
                  width:
                    UploadFiles[key].uploaded / UploadFiles[key].size * 100 +
                    "%"
                }}
              />
            </div>
          </div>
          <div className="btnBox">
            {this.getControlButton(UploadFiles[key],key)}
          </div>
        </div>
      ));
    return uploads;
  }

  render() {
    return (
      <div className="uploadContainer">
        <div className="title">
          <span>
            Đang tải{" "}
            {this.props.uploading
              ? Object.keys(this.props.uploading).length
              : ""}{" "}
            tập tin lên
          </span>
          <div className="btnContainer">
            <button>remove</button>
            <button>clear</button>
          </div>
        </div>
        <div className="files">{this.addToContiner()}</div>
      </div>
    );
  }
}

export { UploadFiles };
