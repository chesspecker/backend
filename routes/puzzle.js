import {Router} from 'express';
import {Puzzle} from '../models/puzzle-model.js';
import sessionValidator from '../middlewares/session-validator.js';
import puzzleUpdater from '../middlewares/puzzle-updater.js';

const router = new Router();

router.get('/:id', sessionValidator, async (request, response, next) => {
	const puzzleId = request.params.id;
	Puzzle.findById(puzzleId, (error, result) => {
		if (error) return next(error);
		if (result === null) return next(new Error('puzzle not found'));
		return response.send(result);
	});
});

router.put('/:id', sessionValidator, puzzleUpdater);

export default router;
