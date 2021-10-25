import {PuzzleSet} from '../models/puzzle-set-model.js';

const getGrade = options =>
	options.mistakes < 1
		? options.timeTaken < 4
			? 5
			: options.timeTaken < 8
			? 4
			: 3
		: options.mistakes < 2
		? options.timeTaken < 7
			? 2
			: 1
		: 0;

const spacedRepetition = (grade, puzzleSet) => {
	let nextInterval;
	let nextRepetition;
	let nextEasinessFactor;

	if (grade >= 3) {
		if (puzzleSet.repetition === 0) {
			nextInterval = 1;
			nextRepetition = 1;
		} else if (puzzleSet.repetition === 1) {
			nextInterval = 6;
			nextRepetition = 2;
		} else {
			nextInterval = Math.round(puzzleSet.interval * puzzleSet.easinessFactor);
			nextRepetition = puzzleSet.repetition + 1;
		}
	} else {
		nextInterval = 1;
		nextRepetition = 0;
	}

	nextEasinessFactor =
		puzzleSet.easinessFactor +
		(0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

	if (nextEasinessFactor < 1.3) nextEasinessFactor = 1.3;

	return [nextInterval, nextRepetition, nextEasinessFactor];
};

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
		const newTotalMistakes = puzzleSet.totalMistakes + options.mistakes;
		const newTotalPuzzlesPlayed = puzzleSet.totalPuzzlesPlayed + 1;
		const newAccuracy = 1 - newTotalMistakes / newTotalPuzzlesPlayed;

		const grade = getGrade(options);
		const [nextInterval, nextRepetition, nextEasinessFactor] = spacedRepetition(
			grade,
			puzzleSet,
		);

		const updateBlock = {
			'puzzles.$.played': true,
			'puzzles.$.mistakes': options.mistakes,
			'puzzles.$.timeTaken': options.timeTaken,
			'puzzles.$.interval': nextInterval,
			'puzzles.$.repetition': nextRepetition,
			'puzzles.$.easinessFactor': nextEasinessFactor,
			currentTime: newTime,
			totalMistakes: newTotalMistakes,
			totalPuzzlesPlayed: newTotalPuzzlesPlayed,
			accuracy: newAccuracy,
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
