import {Router} from 'express';
import {worker} from '../controllers/downloads-worker.js';
import sessionValidator from '../middlewares/session-validator.js';

const router = new Router();

let count;
let max;
let progress;
let jobId;

worker.on('progress', (job, data) => {
	count = data.count;
	max = data.max;
	progress = data.progress;
	jobId = job.id;
});

router.get('/', sessionValidator, async (request, response) => {
	if (request.session.jobId === jobId) {
		response.send({count, max, progress});
	}
});

export default router;
