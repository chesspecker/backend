import getLichessData from '../utils/get-lichess-data.js';
import {User} from '../models/user-model.js';

const userUpdater = async function (request, _response, next) {
	const id = request.session.userID;
	if (!id) return next();
	let user;
	try {
		user = await User.findOne({id});
	} catch (error) {
		return next(error);
	}

	const today = Date.now();
	const ONE_WEEK = 1000 * 7 * 24 * 60 * 60;
	if (today > user.lastUpdatedAt + ONE_WEEK) {
		const lichessUser = await getLichessData(request.session.token);
		const updateBlock = {
			id: lichessUser.id,
			username: lichessUser.username,
			url: lichessUser.url,
			lastUpdatedAt: Date.now(),
		};

		if (lichessUser.perfs.ultraBullet) {
			updateBlock.perfs.ultraBullet = {
				games: lichessUser.perfs.ultraBullet.games,
				rating: lichessUser.perfs.ultraBullet.rating,
			};
		}

		if (lichessUser.perfs.bullet) {
			updateBlock.perfs.bullet = {
				games: lichessUser.perfs.bullet.games,
				rating: lichessUser.perfs.bullet.rating,
			};
		}

		if (lichessUser.perfs.blitz) {
			updateBlock.perfs.blitz = {
				games: lichessUser.perfs.blitz.games,
				rating: lichessUser.perfs.blitz.rating,
			};
		}

		if (lichessUser.perfs.rapid) {
			updateBlock.perfs.rapid = {
				games: lichessUser.perfs.rapid.games,
				rating: lichessUser.perfs.rapid.rating,
			};
		}

		if (lichessUser.perfs.classical) {
			updateBlock.perfs.classical = {
				games: lichessUser.perfs.classical.games,
				rating: lichessUser.perfs.classical.rating,
			};
		}

		if (lichessUser.perfs.correspondence) {
			updateBlock.perfs.correspondence = {
				games: lichessUser.perfs.correspondence.games,
				rating: lichessUser.perfs.correspondence.rating,
			};
		}

		if (lichessUser.perfs.puzzle) {
			updateBlock.perfs.puzzle = {
				games: lichessUser.perfs.puzzle.games,
				rating: lichessUser.perfs.puzzle.rating,
			};
		}

		User.updateOne({id}, {$set: updateBlock}, error => {
			if (error) return next(error);
			return next();
		});
	} else {
		next();
	}
};

export default userUpdater;
