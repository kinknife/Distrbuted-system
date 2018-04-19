import React, { Component } from "react";
import "./LoginPage.less";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "sigin"
    };
  }
  
  sendLogin() {
    let username = this.username.value,
      pw = this.pw.value,
      message = { username: username, password: pw };
    this.props.handleLogin(message);
  }

  signup() {
    this.setState({
      mode: "sigup"
    });
  }

  sendSigup() {
    let pw = this.pw.value,
        comfirmPw = this.comfirmPw.value,
        username = this.username.value;
    if(comfirmPw !== pw) {
      this.errorText.innerText = "Comfirm password not match"
      return;
    }

    if(username === '') {
      this.errorText.innerText = "Please enter your username!"
      return;
    }
    let newUser = {
      username: username,
      password: pw
    }
    this.props.handleSigup(newUser)
  }

  render() {
    if (this.state.mode === "sigin") {
      return (
        <div className="outerContainer">
          <div className="loginContainer">
            <div className="titleContainer">
              <p className="sigupTitle">LOG IN</p>
              <div className="errorText" ref={(errorText) => {this.errorText = errorText}}>{this.props.res ? this.props.res.error : ''}</div>
            </div>
            <input
              placeholder="username"
              ref={username => {
                this.username = username;
              }}
            />
            <input
              placeholder="password"
              type="password"
              ref={pw => {
                this.pw = pw;
              }}
            />
            <button
              className="loginBtn"
              onClick={() => {
                this.sendLogin();
              }}
            >Login</button>
            <div className="signupContainer">
              <div className="sigupLine">Didn't have an account ?</div>
              <button
                className="sigupBtn"
                onClick={() => {
                  this.signup();
                }}
              >
                Signup
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="outerContainer">
          <div className="loginContainer">
            <div className="titleContainer">
              <p className="sigupTitle">SIGN UP</p>
              <div className="errorText" ref={(errorText) => {this.errorText = errorText}}>{this.props.res ? this.props.res.error : ''}</div>
            </div>
            <input
              placeholder="username"
              ref={username => {
                this.username = username;
              }}
            />
            <input
              placeholder="password"
              type="password"
              ref={pw => {
                this.pw = pw;
              }}
            />
            <input
              placeholder="comfirm password"
              type="password"
              ref={comfirmPw => {
                this.comfirmPw = comfirmPw;
              }}
            />
            <button
              className="loginBtn"
              onClick={() => {
                this.sendSigup();
              }}
            >Sign Up</button>
          </div>
        </div>
      );
    }
  }
}

export { LoginPage };
