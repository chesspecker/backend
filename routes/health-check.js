import process from 'node:process';
import {Router} from 'express';

const router = new Router();

router.get('/', async (_request, response) => {
	const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now(),
	};
	response.send(healthcheck);
});

export default router;
