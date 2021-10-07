import {Router} from 'express';
import {auth} from '../config/config.js';
import fetch from 'node-fetch';

const router = new Router();

const getLichessUser = async accessToken =>
	fetch('https://lichess.org/api/account', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}).then(response => response.json());

router.get('/', async (request, response) => {
	if (request.session.token) {
		const lichessUser = await getLichessUser(request.session.token);

		response.json({name: lichessUser.username});
	} else {
		response.status(401).json({reason: 'No session cookie found'});
	}
});

export default router;
