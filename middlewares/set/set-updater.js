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
	} catch (error) {
		return next(error);
	}

	const updateBlock = {
		currentTime: 0,
		bestTime: puzzleSet.bestTime,
		cycles: puzzleSet.cycles,
		spacedRepetition: puzzleSet.spacedRepetition,
	};

	updateBlock['puzzles.$[].played'] = false;

	if (bestTime && (puzzleSet.bestTime === 0 || bestTime < puzzleSet.bestTime)) {
		updateBlock.bestTime = bestTime;
	}

	if (cycles) {
		const newCycles = puzzleSet.cycles + 1;
		updateBlock.cycles = newCycles;
	}

	if (spacedRepetition) {
		updateBlock.spacedRepetition = spacedRepetition;
	}

	let newPuzzleOrder;
	if (updateBlock.spacedRepetition === true) {
		newPuzzleOrder = spaceOrderGenerator(puzzleSet);
	} else {
		const length_ = puzzleSet.length;
		newPuzzleOrder = Array.from(new Array(length_).keys());
		newPuzzleOrder = shuffle(newPuzzleOrder);
	}

	updateBlock.puzzles = {
		$map: {
			input: {$range: [0, {$size: '$puzzles'}]},
			in: {
				$mergeObjects: [
					{$arrayElemAt: ['$puzzles', '$$this']},
					{order: {$arrayElemAt: [newPuzzleOrder, '$$this']}},
				],
			},
		},
	};

	PuzzleSet.updateOne({_id: puzzleSetId}, {$set: updateBlock}, error => {
		if (error) return next(error);
		response.send('success');
	});
};

export default setUpdater;
