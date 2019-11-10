const { Game, InvItem, Capability } = require("../../classes");
import { BIO_WEAPON_SELECTED } from "../../../client/src/redux/actions/actionTypes";
import { SERVER_REDIRECT, SERVER_SENDING_ACTION } from "../../../client/src/redux/socketEmits";
import { GAME_INACTIVE_TAG, GAME_DOES_NOT_EXIST } from "../../pages/errorTypes";
import { TYPE_NAME_IDS } from "../../../client/src/gameData/gameConstants";
const sendUserFeedback = require("../sendUserFeedback");

const biologicalWeaponsConfirm = async (socket, payload) => {
	const { gameId, gameTeam, gameController } = socket.handshake.session.ir3;

	if (payload == null || payload.selectedPositionId == null) {
		sendUserFeedback(socket, "Server Error: Malformed Payload (missing selectedPositionId)");
		return;
	}

	const { selectedPositionId, invItem } = payload;

	const thisGame = await new Game({ gameId }).init();
	if (!thisGame) {
		socket.emit(SERVER_REDIRECT, GAME_DOES_NOT_EXIST);
		return;
	}

	const { gameActive, gamePhase, gameSlice, game0Points, game1Points } = thisGame;

	if (!gameActive) {
		socket.emit(SERVER_REDIRECT, GAME_INACTIVE_TAG);
		return;
	}

	//gamePhase 2 is only phase for bio weapons
	if (gamePhase != 2) {
		sendUserFeedback(socket, "Not the right phase...");
		return;
	}

	//gameSlice 0 is only slice for bio weapons
	if (gameSlice != 0) {
		sendUserFeedback(socket, "Not the right slice (must be planning)...");
		return;
	}

	//Only the main controller (0) can use bio weapons
	if (gameController != 0) {
		sendUserFeedback(socket, "Not the main controller (0)...");
		return;
	}

	const { invItemId } = invItem;

	//Does the invItem exist for it?
	const thisInvItem = await new InvItem(invItemId).init();
	if (!thisInvItem) {
		sendUserFeedback(socket, "Did not have the invItem to complete this request.");
		return;
	}

	//verify correct type of inv item
	const { invItemTypeId } = thisInvItem;
	if (invItemTypeId != TYPE_NAME_IDS["Biological Weapons"]) {
		sendUserFeedback(socket, "Inv Item was not a bio weapon type.");
		return;
	}

	//does the position make sense?
	if (selectedPositionId < 0) {
		sendUserFeedback(socket, "got a negative position for bio weapon.");
		return;
	}

	//insert the 'plan' for bio weapon into the db for later use
	//let the client(team) know that this plan was accepted
	if (!(await Capability.insertBiologicalWeapons(gameId, gameTeam, selectedPositionId))) {
		sendUserFeedback(socket, "db failed to insert bio weapon, likely already an entry for that position.");
		return;
	}

	await thisInvItem.delete();

	const serverAction = {
		type: BIO_WEAPON_SELECTED,
		payload: {
			invItem: thisInvItem,
			selectedPositionId
		}
	};
	socket.emit(SERVER_SENDING_ACTION, serverAction);
};

module.exports = biologicalWeaponsConfirm;
