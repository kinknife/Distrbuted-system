import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { messageService } from './services/messages'

class App extends Component {
	constructor(props) {
		super(props);

	}
	handleUpload() {
		messageService.upload(this.fileInput.files[0])
	}

	handleDownload() {
		console.log(messageService.download('./uploaded files/lịch học.PNG'));
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<input id="upload-input" type="file" name="uploads[]" multiple="multiple" ref={(fileInput) => this.fileInput = fileInput} />
				<button onClick={() => this.handleUpload()}>upload</button>
				<button onClick={() => this.handleDownload()}>download</button>
			</div>
		);
	}
}

export default App;
