import {shuffle} from 'help-array';
import {PuzzleSet} from '../models/puzzle-set-model.js';
import {Puzzle} from '../models/puzzle-model.js';

const rating = user => {
	if (!user.perfs) return;
	const perf = user.perfs;
	let totalGameNumber = 1;
	const averageRating = [1500];

	if (perf.ultraBullet) {
		const ultraBulletAverage = perf.ultraBullet.rating * perf.ultraBullet.games;
		totalGameNumber += perf.ultraBullet.games;
		averageRating.push(ultraBulletAverage);
	}

	if (perf.bullet) {
		const bulletAverage = perf.bullet.rating * perf.bullet.games;
		totalGameNumber += perf.bullet.games;
		averageRating.push(bulletAverage);
	}

	if (perf.blitz) {
		const blitzAverage = perf.blitz.rating * perf.blitz.games;
		totalGameNumber += perf.blitz.games;
		averageRating.push(blitzAverage);
	}

	if (perf.rapid) {
		const rapidAverage = perf.rapid.rating * perf.rapid.games;
		totalGameNumber += perf.rapid.games;
		averageRating.push(rapidAverage);
	}

	if (perf.classical) {
		const classicalAverage = perf.classical.rating * perf.classical.games;
		totalGameNumber += perf.classical.games;
		averageRating.push(classicalAverage);
	}

	if (perf.correspondance) {
		const correspondanceAverage =
			perf.correspondance.rating * perf.correspondance.games;
		totalGameNumber += perf.correspondance.games;
		averageRating.push(correspondanceAverage);
	}

	if (perf.puzzle) {
		const puzzleAverage = perf.puzzle.rating * perf.puzzle.games;
		totalGameNumber += perf.puzzle.games;
		averageRating.push(puzzleAverage);
	}

	const sum = averageRating.reduce((partialSum, a) => partialSum + a, 0);
	const ratingTier = sum / totalGameNumber;
	const minRating = ratingTier - 75;
	const maxRating = ratingTier + 75;
	return [minRating, maxRating];
};

export default async function setGenerator(user, themeArray, length_, name_) {
	const puzzleSet = new PuzzleSet();
	const [minRating, maxRating] = rating(user);
	puzzleSet.user = user._id;
	const puzzleCursor = await Puzzle.find(
		{
			$and: [
				{Rating: {$gte: minRating, $lte: maxRating}},
				{Theme: {$in: [themeArray]}},
			],
		},
		{_id: 1},
	).exec();

	puzzleSet.puzzles = [];
	const puzzleArray = shuffle(puzzleCursor);

	let puzzlesCount = 0;
	for (puzzlesCount; puzzlesCount < length_; puzzlesCount++) {
		const element = puzzleArray[puzzlesCount];
		if (!element) break;
		puzzleSet.puzzles.push(element);
	}

	puzzleSet.length = puzzlesCount;
	puzzleSet.name = name_;
	puzzleSet.tries = 0;
	puzzleSet.bestTime = 0;
	return puzzleSet;
}
