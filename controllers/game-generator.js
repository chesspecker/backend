import {Game} from '../models/game-model.js';
import {User} from '../models/user-model.js';

export default async function generateGame(item, username) {
	let color;
	if (item.players.white.user.name.toLowerCase() === username) color = 'white';
	if (item.players.black.user.name.toLowerCase() === username) color = 'black';

	const user = await User.findOne({id: username});
	const gameObject = {
		game_id: item.id,
		color,
		user: user._id,
		status: item.status,
		variant: item.variant,
		speed: item.speed,
		perf: item.perf,
		pgn: item.pgn,
		analyzed: false,
	};

	const game = new Game(gameObject);
	return game;
}
