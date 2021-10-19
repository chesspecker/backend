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
	puzzleSet.save(async (error, item) => {
		if (error) return next(error);
		response.send(item._id);
		await user.update({$push: {puzzleSet: item._id}});
		await user.populate('puzzleSet');
		await user.save()
	});
});

router.get('/set/id/:id', sessionValidator, async (request, response, next) => {
	const puzzleSetId = request.params.id;
	PuzzleSet.findById(puzzleSetId, (error, result) => {
		if (error) return next(error);
		return response.send(result);
	});
});

router.put('/set/id/:id', sessionValidator, async (request, response) => {
	const puzzleSetId = request.params.id;
	let {tries} = request.body;
	const {title, bestTime} = request.body;
	const puzzleSet = await PuzzleSet.findById(puzzleSetId);
	if (bestTime && puzzleSet.bestTime === 0) {
		console.log(bestTime);
	}

	if (bestTime && bestTime < puzzleSet.bestTime) {
		console.log(bestTime);
	}

	if (title) {
		console.log(title);
	}

	if (tries) {
		tries += puzzleSet.tries;
		console.log(tries);
	}

	console.log(puzzleSet);
	response.send('success');
});

export default router;
