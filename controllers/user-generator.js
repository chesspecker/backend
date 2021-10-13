import {User} from '../models/user-model.js';

export default function generateUser(lichessUser, userMail) {
	const user = new User();
	user.id = lichessUser.id;
	user.username = lichessUser.username;
	user.url = lichessUser.url;
	user.email = userMail;
	user.permissionLevel = 1;
	user.createdAt = lichessUser.createdAt;
	user.playTime = lichessUser.playTime.total;
	user.count = {
		all: lichessUser.count.all,
		rated: lichessUser.count.rated,
	};

	if (lichessUser.perfs.ultraBullet) {
		user.perfs = {
			ultraBullet: {
				games: lichessUser.perfs.ultraBullet.games,
				rating: lichessUser.perfs.ultraBullet.rating,
			},
		};
	}

	if (lichessUser.perfs.bullet) {
		user.perfs = {
			bullet: {
				games: lichessUser.perfs.bullet.games,
				rating: lichessUser.perfs.bullet.rating,
			},
		};
	}

	if (lichessUser.perfs.blitz) {
		user.perfs = {
			blitz: {
				games: lichessUser.perfs.blitz.games,
				rating: lichessUser.perfs.blitz.rating,
			},
		};
	}

	if (lichessUser.perfs.rapid) {
		user.perfs = {
			rapid: {
				games: lichessUser.perfs.rapid.games,
				rating: lichessUser.perfs.rapid.rating,
			},
		};
	}

	if (lichessUser.perfs.classical) {
		user.perfs = {
			classical: {
				games: lichessUser.perfs.classical.games,
				rating: lichessUser.perfs.classical.rating,
			},
		};
	}

	if (lichessUser.perfs.correspondence) {
		user.perfs = {
			correspondence: {
				games: lichessUser.perfs.correspondence.games,
				rating: lichessUser.perfs.correspondence.rating,
			},
		};
	}

	user.gamesInDb = 0;
	user.puzzlesInDb = 0;
	return user;
}
