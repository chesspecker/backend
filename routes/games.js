import fetch from 'node-fetch';
import ndjson from 'ndjson';
import {Router} from 'express';
import {Game} from '../models/game-model.js';
import {User} from '../models/user-model.js';
import getLichessData from '../utils/get-lichess-data.js';

const router = new Router();

router.get('/download', async (request, response) => {
	if (request.session.token) {
		const lichessUser = await getLichessData(request.session.token);
		const username = lichessUser.username.toLowerCase();
		const {
			max = '100',
			rated = 'true',
			perfType = 'blitz,rapid,classical',
		} = request.query;

		const url = ` https://lichess.org/api/games/user/${username}?max=${max}&rated=${rated}&perfType${perfType}&pgnInJson=true`;

		const result = await fetch(url, {
			headers: {
				Accept: 'application/x-ndjson',
				Authorization: `Bearer ${request.session.token}`,
			},
		});

		let progress = 0;
		const percent = (progress, max) =>
			`${Math.round((progress / max) * 100)}%\n`;

		result.body
			.pipe(ndjson.parse())
			.on('data', async item => {
				const isInDB = await Game.exists({game_id: item.id});
				if (isInDB === true) {
					// Check if another player played it
					console.log('Game : ' + item.id + ' is in db');
					response.write(percent(progress++, max));
				} else {
					let color;
					if (item.players.white.user.name.toLowerCase() === username)
						color = 'white';
					if (item.players.black.user.name.toLowerCase() === username)
						color = 'black';

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
					await game.populate('user');
					await game.save(error => {
						if (error) throw new Error(error);
						console.log(`The document was inserted with the id: ${item.id}`);
					});
					response.write(percent(progress++, max));
				}
			})
			.on('pause', () => {
				console.log('pause');
			})
			.on('end', () => {
				response.end();
			})
			.on('error', error => {
				console.log(new Error(error));
			});
	} else {
		response.end();
	}
});

router.get('/analyze', async (request, response) => {
	if (request.session.token) {
		const lichessUser = await getLichessData(request.session.token);
		response.json(lichessUser);
	} else {
		response.end();
	}
});

export default router;
