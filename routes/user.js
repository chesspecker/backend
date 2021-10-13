import {Router} from 'express';
import sessionValidator from '../middlewares/session-validator.js';

const router = new Router();

router.get('/', sessionValidator, async (request, response) => {
	const {userID} = request.session;
	response.json({name: userID});
});

export default router;
