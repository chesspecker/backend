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
	const lastUpdate = new Date(user.lastUpdatedAt);
	const lastUpdateInMilliseconds = lastUpdate.getTime();

	if (today > lastUpdateInMilliseconds + ONE_WEEK) {
		const lichessUser = await getLichessData(request.session.token);
		user.id = lichessUser.id;
		user.username = lichessUser.username;
		user.url = lichessUser.url;
		user.lastUpdatedAt = today;

		if (lichessUser.perfs.ultraBullet) {
			user.perfs.ultraBullet = {
				games: lichessUser.perfs.ultraBullet.games,
				rating: lichessUser.perfs.ultraBullet.rating,
			};
		}

		if (lichessUser.perfs.bullet) {
			user.perfs.bullet = {
				games: lichessUser.perfs.bullet.games,
				rating: lichessUser.perfs.bullet.rating,
			};
		}

		if (lichessUser.perfs.blitz) {
			user.perfs.blitz = {
				games: lichessUser.perfs.blitz.games,
				rating: lichessUser.perfs.blitz.rating,
			};
		}

		if (lichessUser.perfs.rapid) {
			user.perfs.rapid = {
				games: lichessUser.perfs.rapid.games,
				rating: lichessUser.perfs.rapid.rating,
			};
		}

		if (lichessUser.perfs.classical) {
			user.perfs.classical = {
				games: lichessUser.perfs.classical.games,
				rating: lichessUser.perfs.classical.rating,
			};
		}

		if (lichessUser.perfs.correspondence) {
			user.perfs.correspondence = {
				games: lichessUser.perfs.correspondence.games,
				rating: lichessUser.perfs.correspondence.rating,
			};
		}

		if (lichessUser.perfs.puzzle) {
			user.perfs.puzzle = {
				games: lichessUser.perfs.puzzle.games,
				rating: lichessUser.perfs.puzzle.rating,
			};
		}

		user.save(error => {
			if (error) return next(error);
			return next();
		});
	} else {
		next();
	}
};

export default userUpdater;
