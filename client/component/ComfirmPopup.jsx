import React, { Component } from "react";
import "./ComfirmPopup.less";

class ComfirmPopup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="popupContainer">
        <span
          className="closebtn"
          onClick={() => {this.props.closePopup()}}
        >
          &times;
        </span>
        <p>File is already existed. Do you want to rename it?</p>
        <div className="btnBox">
          <button onClick={() => {this.props.applyNewName()}}> Yes </button>
          <button onClick={() => {this.props.keepOld()}}> No </button>
        </div>
      </div>
    );
  }
}

export { ComfirmPopup };
