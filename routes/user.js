import {Router} from 'express';
import {getLichessUser} from '../utils/get-lichess-user.js';

const router = new Router();

router.get('/', async (request, response) => {
	if (request.session.token) {
		const lichessUser = await getLichessUser(request.session.token);

		response.json({name: lichessUser.username});
	} else {
		response.status(401).json({reason: 'No session cookie found'});
	}
});

export default router;
