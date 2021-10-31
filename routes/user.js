import {Router} from 'express';
import sessionValidator from '../middlewares/session-validator.js';
import {User} from '../models/user-model.js';

const router = new Router();

router.get('/', sessionValidator, async (request, response, next) => {
	const {userID} = request.session;
	User.findOne({id: userID}, (error, result) => {
		if (error) return next(error);
		if (result === null) return next(new Error('user not found'));
		return response.send(result);
	});
});

router.get('/name', sessionValidator, async (request, response) => {
	const {username} = request.session;
	response.json({name: username});
});

export default router;
