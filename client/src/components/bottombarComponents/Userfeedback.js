import React, { Component } from "react";
import PropTypes from "prop-types";

class Userfeedback extends Component {
	userfeedbackStyle = {
		background: "grey",
		height: "80%",
		width: "40%",
		position: "relative",
		float: "left",
		margin: ".5%"
	};

	render() {
		return <div style={this.userfeedbackStyle}>{this.props.userFeedback}</div>;
	}
}

Userfeedback.propTypes = {
	userFeedback: PropTypes.string.isRequired
};

export default Userfeedback;