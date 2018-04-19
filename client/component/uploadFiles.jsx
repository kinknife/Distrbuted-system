import React, { Component } from "react";
import "./UploadFiles.less"

class UploadFiles extends Component {
    constructor(props) {
        super(props)
    }

    addToContiner() {
        console.log(this.props);
        let UploadFiles = this.props.uploading,
            uploads = Object.keys(UploadFiles).map((key, index) => (
                <div className="uploadFile" key={index}>
                    <span>{key}</span>
                </div>
            ))
        console.log(uploads)
        return uploads
    }

    render() {
        return(
            <div className="uploadContainer">
                <div className="title">
                    <span>
                        Đang tải 1 tập tin lên
                    </span>
                </div>
                <div className="files">
                    {this.addToContiner()}
                </div>
            </div>
        )
    }
}

export {UploadFiles}