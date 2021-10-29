import {PuzzleSet} from '../../models/puzzle-set-model.js';

export const spaceOrderGenerator = puzzleSet => {
	const newPuzzleOrder = [];
	const chunkSize = puzzleSet.chunkLength;
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
		switch (element.grade) {
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
				chunk5++;
				newPuzzleOrder.push(sum5());
		}
	}

	return newPuzzleOrder;
};

const chunkUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;

	let puzzleSet;
	try {
		puzzleSet = await PuzzleSet.findById(puzzleSetId).exec();
	} catch (error) {
		return next(error);
	}

	const newPuzzleOrder = spaceOrderGenerator(puzzleSet);
	const updateBlock = {
		puzzles: {
			$map: {
				input: {$range: [0, {$size: '$puzzles'}]},
				in: {
					$mergeObjects: [
						{$arrayElemAt: ['$puzzles', '$$this']},
						{order: {$arrayElemAt: [newPuzzleOrder, '$$this']}},
					],
				},
			},
		},
	};

	PuzzleSet.updateOne({_id: puzzleSetId}, {$set: updateBlock}, error => {
		if (error) return next(error);
		response.send('success');
	});
};

export default chunkUpdater;
