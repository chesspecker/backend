import {Router} from 'express';
import {Puzzle} from '../models/puzzle-model.js';
import {PuzzleSet} from '../models/puzzle-set-model.js';
import {User} from '../models/user-model.js';
import sessionValidator from '../middlewares/session-validator.js';
import setGenerator from '../controllers/set-generator.js';

const router = new Router();

router.get('/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleId = request.params.id;
	Puzzle.findById(puzzleId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

router.get('/sets', sessionValidator, async (request, response, next) => {
	const id = request.session.userID;
	const user = await User.findOne({id});
	PuzzleSet.find({user: user._id}, (error, puzzleSets) => {
		if (error) return next(error);
		if (puzzleSets.length === 0) {
			return next(new Error('No puzzle sets found, please create one'));
		}

		return response.send(puzzleSets);
	});
});

router.post('/sets', sessionValidator, async (request, response, next) => {
	const id = request.session.userID;
	const user = await User.findOne({id});
	const {themeArray, size, title} = request.body;
	const puzzleSet = await setGenerator(user, themeArray, size, title);
	await puzzleSet.populate('user');
	await puzzleSet.populate('puzzles');
	let puzzleSetId;
	puzzleSet.save(async (error, item) => {
		if (error) return next(error);
		puzzleSetId = item._id;
		response.send(puzzleSetId);
	});
	await user.update({$push: {puzzleSet: puzzleSetId}});
	await user.populate('puzzleSet');
	await user.save(async error => {
		if (error) return next(error);
	});
});

router.get('/set/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	PuzzleSet.findById(puzzleSetId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

router.delete(
	'/set/id/:id',
	sessionValidator,
	async (request, response, next) => {
		const puzzleSetId = request.params.id;
		PuzzleSet.deleteOne({_id: puzzleSetId}, error => {
			if (error) return next(error);
			return response.send('success');
		});
	},
);

router.put('/set/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	const {title, bestTime, tries} = request.body;
	if (!title && !bestTime && !tries) return response.send('empty');

	const puzzleSet = await PuzzleSet.findById(puzzleSetId);

	const updateBlock = {};
	if (bestTime && puzzleSet.bestTime === 0) {
		updateBlock.bestTime = bestTime;
	}

	if (bestTime && bestTime < puzzleSet.bestTime) {
		updateBlock.bestTime = bestTime;
	}

	if (title) {
		updateBlock.title = title;
	}

	if (tries) {
		const newTries = tries + puzzleSet.tries;
		updateBlock.tries = newTries;
	}

	puzzleSet.update({$set: updateBlock}, error => {
		if (error) return next(error);
		response.send('success');
	});
});

export default router;
