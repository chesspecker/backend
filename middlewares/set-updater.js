import {PuzzleSet} from '../models/puzzle-set-model.js';

const setUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;
	const {title, bestTime, tries, puzzleId, options} = request.body;
	if (!title && !bestTime && !tries && !puzzleId) return response.send('empty');

	let puzzleSet;
	try {
		puzzleSet = await PuzzleSet.findById(puzzleSetId);
	} catch (error) {
		return next(error);
	}

	const updateBlock = {};

	if (puzzleId) {
		const newTime = puzzleSet.currentTime + options.timeTaken;
		const updateBlock = {
			'puzzles.$.mistakes': options.mistakes,
			'puzzles.$.timeTaken': options.timeTaken,
			'puzzles.$.played': true,
			currentTime: newTime,
		};
		PuzzleSet.updateOne(
			{_id: puzzleSetId, 'puzzles._id': puzzleId},
			{$set: updateBlock},
			error => {
				if (error) return next(error);
				response.send('success');
			},
		);
	} else if (title) {
		updateBlock.title = title;
		PuzzleSet.updateOne({_id: puzzleSetId}, {$set: updateBlock}, error => {
			if (error) return next(error);
			response.send('success');
		});
	} else {
		updateBlock['puzzles.$[].played'] = false;
		updateBlock.currentTime = 0;

		if (bestTime && puzzleSet.bestTime === 0) {
			updateBlock.bestTime = bestTime;
		}

		if (bestTime && bestTime < puzzleSet.bestTime) {
			updateBlock.bestTime = bestTime;
		}

		if (tries) {
			const newTries = tries + puzzleSet.tries;
			updateBlock.tries = newTries;
		}

		PuzzleSet.updateOne({_id: puzzleSetId}, {$set: updateBlock}, error => {
			if (error) return next(error);
			response.send('success');
		});
	}
};

export default setUpdater;
