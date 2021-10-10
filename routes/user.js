import {Router} from 'express';
import getLichessData from '../utils/get-lichess-data.js';

const router = new Router();

router.get('/', async (request, response) => {
	if (request.session.token) {
		const lichessUser = await getLichessData(request.session.token);
		response.json({name: lichessUser.username});
	} else {
		response.status(401).json({reason: 'No session cookie found'});
	}
});

export default router;
