import {Router} from 'express';
import {PuzzleSet} from '../models/puzzle-set-model.js';
import sessionValidator from '../middlewares/session-validator.js';
import setUpdater from '../middlewares/set/set-updater.js';
import chunkUpdater from '../middlewares/set/chunk-updater.js';
import setTitleUpdater from '../middlewares/set/set-title-updater.js';
import setPoster from '../middlewares/set/set-poster.js';
import setGetter, {setGetterDashboard} from '../middlewares/set/set-getter.js';

const router = new Router();

router.get('/', sessionValidator, setGetter);
router.get('/dashboard', sessionValidator, setGetterDashboard);

router.post('/', sessionValidator, setPoster);

router.put('/complete/:id', sessionValidator, setUpdater);
router.put('/chunk/:id', sessionValidator, chunkUpdater);
router.put('/title/:id', sessionValidator, setTitleUpdater);

router.get('/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	PuzzleSet.findById(puzzleSetId, (error, result) => {
		if (error) return next(error);
		if (result === null) return next(new Error('puzzleSet not found'));
		return response.send(result);
	});
});

router.delete('/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	PuzzleSet.deleteOne({_id: puzzleSetId}, (error, result) => {
		if (error) return next(error);
		if (result === null) return next(new Error('puzzleSet not found'));
		return response.send('success');
	});
});

export default router;
