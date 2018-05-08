import React, { Component } from "react";
import './FileTable.less'


class FileTable extends Component {
    constructor(props) {
        super(props)
    }

    renderTable() {
        let table = this.props.files.map(file => (
            <tr key={file.name}>
                <td className="bodyRow" colSpan="3">{file.name}</td>
                <td className="bodyRow">{file.createTime}</td>
                <td className="bodyRow">{file.size}</td>
                <td className="bodyRow"><div><button onClick={() => {this.props.handleDownload(file.name)}}>file_download</button></div></td>
            </tr>
        ))
        return table
    }

    render() {
        return(
            <div className="fileTable">
                <table>
                    <thead>
                        <tr>
                            <th colSpan="3">File Name</th>
                            <th>Last Upload</th>
                            <th>File Size</th>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>{this.renderTable()}</tbody>
                </table>
            </div>
        )
    }
}

export {FileTable}