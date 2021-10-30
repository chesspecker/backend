import process from 'node:process';
import {Router} from 'express';

const router = new Router();

/**
 * @openapi
 * /healthCheck:
 *	get:
 *		summary: Check backend status.
 *		description: Simple way to check if the backend is online and correctly working.
 *		reponses:
 *			200:
 *				description:
 *				content:
 *					application/json:
 *						schema:
 *							type: object
 *							properties:
 *								uptime:
 *									type: number
 *									description: The number of seconds the backend has been online.
 *									example: 14875.657347202
 *								message:
 *									type: string
 *									description: Simple 'OK' string. Useful to check the backend status.
 *									example: 'OK'
 *								timestamp:
 *									type: number
 *									description: The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 *									example: '1635426778044'
 */

router.get('/', async (_request, response) => {
	const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now(),
	};
	response.send(healthcheck);
});

export default router;
