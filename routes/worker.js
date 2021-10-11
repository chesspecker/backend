import {Router} from 'express';
import {downloadsQueue} from '../controllers/downloads-worker.js';

const router = new Router();

router.get('/', async (request, response) => {
	if (request.session.jobId) {
		const jobId = request.session.jobId;
		const job = await downloadsQueue.getJob(jobId);
		if (job === undefined) {
			response.send('no worker found');
			return;
		}

		const jobState = job.getState();
		// Const jobProgress = job.progress();
		response.send({jobState});
	} else {
		response.send('no worker found');
	}
});

export default router;
