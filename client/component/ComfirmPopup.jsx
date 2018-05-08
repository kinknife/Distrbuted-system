import React, { Component } from "react";
import './ComfirmPopup.less'

class ComfirmPopup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="popupContainer">
                <p>File is already existed. Do you want to rename it?</p>
                <div className='btnBox'>
                    <button> Yes </button>
                    <button> No </button>
                </div>
            </div>
        )
    }
}

export {ComfirmPopup}