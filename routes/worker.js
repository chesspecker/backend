import {Router} from 'express';
import {downloadsQueue} from '../controllers/downloads-worker.js';

const router = new Router();

router.get('/', async (request, response) => {
	if (request.session.jobId) {
		const jobId = request.session.jobId;
		const jobProgress = request.session.progress;

		const job = await downloadsQueue.getJob(jobId);
		if (job === undefined) response.send('no worker found');

		const jobState = await job.getState();
		response.send({jobState, jobProgress});
	} else {
		response.send('no worker found');
	}
});

export default router;
