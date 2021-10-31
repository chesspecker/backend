/* eslint-disable unicorn/no-new-array */
import {shuffle} from 'help-array';
import {PuzzleSet} from '../../models/puzzle-set-model.js';
import {spaceOrderGenerator} from './chunk-updater.js';

const setUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;
	const {bestTime, cycles, spacedRepetition} = request.body;
	if (!bestTime && !cycles && !spacedRepetition) {
		const error = new Error('Empty request');
		error.statusCode = 400;
		return next(error);
	}

	let puzzleSet;
	try {
		puzzleSet = await PuzzleSet.findById(puzzleSetId).exec();
		if (puzzleSet === null) {
			const error = new Error('puzzleSet not found');
			error.statusCode = 400;
			throw error;
		}
	} catch (error) {
		return next(error);
	}

	puzzleSet.currentTime = 0;

	if (bestTime && (puzzleSet.bestTime === 0 || bestTime < puzzleSet.bestTime)) {
		puzzleSet.bestTime = bestTime;
	}

	if (cycles) {
		const newCycles = puzzleSet.cycles + 1;
		puzzleSet.cycles = newCycles;
	}

	if (spacedRepetition) {
		puzzleSet.spacedRepetition = spacedRepetition;
	}

	let newPuzzleOrder;
	if (puzzleSet.spacedRepetition === true) {
		newPuzzleOrder = spaceOrderGenerator(puzzleSet);
	} else {
		const length_ = puzzleSet.length;
		newPuzzleOrder = Array.from(new Array(length_).keys());
		newPuzzleOrder = shuffle(newPuzzleOrder);
	}

	for (let i = 0; i < puzzleSet.puzzles.length; i++) {
		const element = puzzleSet.puzzles[i];
		element.order = newPuzzleOrder[i];
		element.played = false;
	}

	puzzleSet
		.save()
		.then(() => {
			response.send('success');
		})
		.catch(error => {
			return next(error);
		});
};

export default setUpdater;
