import React, { Component } from "react";

export default class Leftcontrols extends Component {
	leftcontrolsStyle = {
		background: "grey",
		height: "80%",
		width: "25%",
		position: "relative",
		float: "left",
		margin: ".5%"
	};

	render() {
		return <div style={this.leftcontrolsStyle}>left controls</div>;
	}
}