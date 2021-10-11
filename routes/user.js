import {Router} from 'express';
import sessionValidator from '../utils/session-validator.js';

const router = new Router();

router.get('/', sessionValidator, async (request, response) => {
	const {userID} = request.session;
	response.json({name: userID});
});

export default router;
