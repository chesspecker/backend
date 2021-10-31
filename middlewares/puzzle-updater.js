import {PuzzleSet} from '../models/puzzle-set-model.js';

export const gradeGenerator = options =>
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

export const spacedRepetitionGenerator = (grade, currentPuzzle) => {
	let nextInterval;
	let nextRepetition;
	let nextEasinessFactor;

	switch (grade) {
		case 0:
		case 1:
		case 2:
		case 3:
			nextInterval = grade;
			nextRepetition = 0;
			break;
		case 4:
		case 5:
			if (currentPuzzle.repetition === 0) {
				nextInterval = 3;
				nextRepetition = 1;
			} else if (currentPuzzle.repetition === 1) {
				nextInterval = 5;
				nextRepetition = 2;
			} else {
				nextInterval = Math.round(
					currentPuzzle.interval * currentPuzzle.easinessFactor,
				);
				nextRepetition = currentPuzzle.repetition + 1;
			}

			break;
		default:
			break;
	}

	nextEasinessFactor =
		currentPuzzle.easinessFactor +
		(0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

	if (nextEasinessFactor < 1.3) nextEasinessFactor = 1.3;

	return [nextInterval, nextRepetition, nextEasinessFactor];
};

const puzzleUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;
	const {puzzleId, options} = request.body;
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

	if (puzzleId) {
		const newTime =
			puzzleSet.currentTime + options.timeTaken + 3 * options.mistakes;
		const newTotalMistakes = puzzleSet.totalMistakes + options.mistakes;
		const newTotalPuzzlesPlayed = puzzleSet.totalPuzzlesPlayed + 1;
		const newAccuracy = 1 - newTotalMistakes / newTotalPuzzlesPlayed;

		const updateBlock = {
			'puzzles.$.played': true,
			'puzzles.$.mistakes': options.mistakes,
			'puzzles.$.timeTaken': options.timeTaken,
			currentTime: newTime,
			totalMistakes: newTotalMistakes,
			totalPuzzlesPlayed: newTotalPuzzlesPlayed,
			accuracy: newAccuracy,
		};

		if (puzzleSet.cycles < 1 || puzzleSet.spacedRepetition === true) {
			let currentPuzzle;
			try {
				const item = await PuzzleSet.findById(puzzleSetId).select({
					puzzles: {$elemMatch: {_id: puzzleId}},
				});
				currentPuzzle = item.puzzles[0];
			} catch (error) {
				return next(error);
			}

			const grade = gradeGenerator(options);
			const [nextInterval, nextRepetition, nextEasinessFactor] =
				spacedRepetitionGenerator(grade, currentPuzzle);
			updateBlock['puzzles.$.grade'] = grade;
			updateBlock['puzzles.$.interval'] = nextInterval;
			updateBlock['puzzles.$.repetition'] = nextRepetition;
			updateBlock['puzzles.$.easinessFactor'] = nextEasinessFactor;
		}

		PuzzleSet.updateOne(
			{_id: puzzleSetId, 'puzzles._id': puzzleId},
			{$set: updateBlock},
			error => {
				if (error) return next(error);
				response.send('success');
			},
		);
	} else {
		const error = new Error('Empty request');
		error.statusCode = 400;
		return next(error);
	}
};

export default puzzleUpdater;
