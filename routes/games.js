import {Router} from 'express';
import {v4 as uuidv4} from 'uuid';
import {User} from '../models/user-model.js';
import getLichessData from '../utils/get-lichess-data.js';
import {downloadsQueue} from '../controllers/downloads-worker.js';

const router = new Router();

router.get('/', async (request, response) => {
	if (request.session.token) {
		const token = request.session.token;
		const {username} = await getLichessData(token);
		const user = await User.findOne({id: username});
		response.send(user);
	}
});

router.get('/download', async (request, response) => {
	if (request.session.token) {
		const token = request.session.token;
		const lichessUser = await getLichessData(token);
		const username = lichessUser.username.toLowerCase();
		const {
			max = '100',
			rated = 'true',
			perfType = 'blitz,rapid,classical',
		} = request.query;

		const linkParameters = new URLSearchParams({
			max,
			rated,
			perfType,
			pgnInJson: true,
		});

		const url = ` https://lichess.org/api/games/user/${username}?${linkParameters}`;

		const jobOptions = {url, token, username, max};
		downloadsQueue.add(uuidv4(), jobOptions).then(
			job => response.status(201).end(job.name),
			error => response.status(500).end(error),
		);
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
