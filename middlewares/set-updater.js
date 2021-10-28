/* eslint-disable unicorn/no-new-array */
import {shuffle} from 'help-array';
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

const spacedRepetition = (grade, currentPuzzle) => {
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

const spaceOrder = puzzleSet => {
	let newPuzzleOrder;
	const chunkSize = puzzleSet.puzzles.length / 5;
	let chunk0 = 0;
	let chunk1 = chunkSize + 1;
	let chunk2 = chunkSize * 2 + 1;
	let chunk3 = chunkSize * 3 + 1;
	let chunk4 = chunkSize * 4 + 1;
	let chunk5 = chunkSize * 5 + 1;
	const sum0 = () => chunk0;
	const sum1 = () => chunk0 + chunk1;
	const sum2 = () => chunk0 + chunk1 + chunk2;
	const sum3 = () => chunk0 + chunk1 + chunk2 + chunk3;
	const sum4 = () => chunk0 + chunk1 + chunk2 + chunk3 + chunk4;
	const sum5 = () => chunk0 + chunk1 + chunk2 + chunk3 + chunk4 + chunk5;

	for (let index = 0; index < puzzleSet.puzzles.length; index++) {
		const element = puzzleSet.puzzles[index];
		switch (element.interval) {
			case 0: {
				if (chunk0 < chunkSize) {
					chunk0++;
					newPuzzleOrder.push(sum0());
				} else if (chunk1 < chunkSize) {
					chunk1++;
					newPuzzleOrder.push(sum1());
				} else if (chunk2 < chunkSize) {
					chunk2++;
					newPuzzleOrder.push(sum2());
				} else if (chunk3 < chunkSize) {
					chunk3++;
					newPuzzleOrder.push(sum3());
				} else if (chunk4 < chunkSize) {
					chunk4++;
					newPuzzleOrder.push(sum4());
				} else {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}

				break;
			}

			case 1: {
				if (chunk1 < chunkSize) {
					chunk1++;
					newPuzzleOrder.push(sum1());
				} else if (chunk2 < chunkSize) {
					chunk2++;
					newPuzzleOrder.push(sum2());
				} else if (chunk3 < chunkSize) {
					chunk3++;
					newPuzzleOrder.push(sum3());
				} else if (chunk4 < chunkSize) {
					chunk4++;
					newPuzzleOrder.push(sum4());
				} else {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}

				break;
			}

			case 2: {
				if (chunk2 < chunkSize) {
					chunk2++;
					newPuzzleOrder.push(sum2());
				} else if (chunk3 < chunkSize) {
					chunk3++;
					newPuzzleOrder.push(sum3());
				} else if (chunk4 < chunkSize) {
					chunk4++;
					newPuzzleOrder.push(sum4());
				} else {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}

				break;
			}

			case 3: {
				if (chunk3 < chunkSize) {
					chunk3++;
					newPuzzleOrder.push(sum3());
				} else if (chunk4 < chunkSize) {
					chunk4++;
					newPuzzleOrder.push(sum4());
				} else {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}

				break;
			}

			case 4: {
				if (chunk4 < chunkSize) {
					chunk4++;
					newPuzzleOrder.push(sum4());
				} else {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}

				break;
			}

			default:
				if (element.interval >= 5) {
					chunk5++;
					newPuzzleOrder.push(sum5());
				}
		}
	}

	return newPuzzleOrder;
};

const setUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;
	const {title, bestTime, cycles, puzzleId, options} = request.body;
	if (!title && !bestTime && !cycles && !puzzleId)
		return response.send('empty');

	let puzzleSet;
	try {
		puzzleSet = await PuzzleSet.findById(puzzleSetId).exec();
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

			const grade = getGrade(options);
			const [nextInterval, nextRepetition, nextEasinessFactor] =
				spacedRepetition(grade, currentPuzzle);
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
	} else if (title) {
		PuzzleSet.updateOne({_id: puzzleSetId}, {$set: {title}}, error => {
			if (error) return next(error);
			response.send('success');
		});
	} else {
		const updateBlock = {currentTime: 0};
		updateBlock['puzzles.$[].played'] = false;

		if (bestTime && puzzleSet.bestTime === 0) {
			updateBlock.bestTime = bestTime;
		}

		if (bestTime && bestTime < puzzleSet.bestTime) {
			updateBlock.bestTime = bestTime;
		}

		if (cycles) {
			const newCycles = puzzleSet.cycles + 1;
			updateBlock.cycles = newCycles;
		}

		let newPuzzleOrder;
		if (puzzleSet.spacedRepetition === true) {
			newPuzzleOrder = spaceOrder(puzzleSet);
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
	}
};

export default setUpdater;
