const { Game, InvItem, ShopItem } = require("../classes");
const sendUserFeedback = require("./sendUserFeedback");
const { SHOP_TRANSFER, GAME_INACTIVE_TAG } = require("../constants");

/***
 * TODO: standard function descriptions (author?, arguments, returns, why/when used?)
 * Transfers ShopItems into InvItems ("confirms" them, no longer able to refund once inside inventory...)
 */

const shopConfirmPurchase = async (socket, payload) => {
	const { gameId, gameTeam, gameController } = socket.handshake.session.ir3;
	const thisGame = await new Game({ gameId }).init();

	const { gameActive, gamePhase } = thisGame;

	if (!gameActive) {
		socket.emit("serverRedirect", GAME_INACTIVE_TAG);
		return;
	}

	//gamePhase 1 is only phase for confirming purchase
	if (gamePhase != 1) {
		sendUserFeedback(socket, "Not the right phase...");
		return;
	}

	//Only the main controller (0) can confirm purchase
	if (gameController != 0) {
		sendUserFeedback(socket, "Not the main controller (0)...");
		return;
	}

	await InvItem.insertFromShop(gameId, gameTeam);
	await ShopItem.deleteAll(gameId, gameTeam);
	const invItems = await InvItem.all(gameId, gameTeam); //TODO: this may cause an error on the front end, check what happens when confirm purchase executes...

	const serverAction = {
		type: SHOP_TRANSFER,
		payload: {
			invItems
		}
	};
	socket.emit("serverSendingAction", serverAction);
};

module.exports = shopConfirmPurchase;
