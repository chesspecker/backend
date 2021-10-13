import {Router} from 'express';
import {Puzzle} from '../models/puzzle-model.js';
import {PuzzleSet} from '../models/puzzle-set-model.js';
import sessionValidator from '../middlewares/session-validator.js';

const router = new Router();

router.get('/:id', sessionValidator, async (request, response, next) => {
	const puzzleId = request.params.id;
	Puzzle.findById(puzzleId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

router.put('/:id', async (request, _response) => {
	const puzzleId = request.params.id;
	const puzzle = await Puzzle.findById(puzzleId);
	console.log(puzzle);
});

router.get('set/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	PuzzleSet.findById(puzzleSetId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

router.put('set/:id', async (request, _response) => {
	const puzzleSetId = request.params.id;
	const puzzleSet = await PuzzleSet.findById(puzzleSetId);
	console.log(puzzleSet);
});

export default router;
