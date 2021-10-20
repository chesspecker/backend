import {PuzzleSet} from '../models/puzzle-set-model.js';
import {Puzzle} from '../models/puzzle-model.js';

const rating = user => {
	if (!user.perfs) return;
	const perf = user.perfs;
	let totalGameNumber = 1;
	const averageRating = [1500];

	if (perf.ultraBullet && perf.ultraBullet.games > 0) {
		const ultraBulletAverage = perf.ultraBullet.rating * perf.ultraBullet.games;
		totalGameNumber += perf.ultraBullet.games;
		averageRating.push(ultraBulletAverage);
	}

	if (perf.bullet && perf.bullet.games > 0) {
		const bulletAverage = perf.bullet.rating * perf.bullet.games;
		totalGameNumber += perf.bullet.games;
		averageRating.push(bulletAverage);
	}

	if (perf.blitz && perf.blitz.games > 0) {
		const blitzAverage = perf.blitz.rating * perf.blitz.games;
		totalGameNumber += perf.blitz.games;
		averageRating.push(blitzAverage);
	}

	if (perf.rapid && perf.rapid.games > 0) {
		const rapidAverage = perf.rapid.rating * perf.rapid.games;
		totalGameNumber += perf.rapid.games;
		averageRating.push(rapidAverage);
	}

	if (perf.classical && perf.classical.games > 0) {
		const classicalAverage = perf.classical.rating * perf.classical.games;
		totalGameNumber += perf.classical.games;
		averageRating.push(classicalAverage);
	}

	if (perf.correspondance && perf.correspondance.games > 0) {
		const correspondanceAverage =
			perf.correspondance.rating * perf.correspondance.games;
		totalGameNumber += perf.correspondance.games;
		averageRating.push(correspondanceAverage);
	}

	if (perf.puzzle && perf.puzzle.games > 0) {
		const puzzleAverage = perf.puzzle.rating * perf.puzzle.games;
		totalGameNumber += perf.puzzle.games;
		averageRating.push(puzzleAverage);
	}

	const sum = averageRating.reduce((partialSum, a) => partialSum + a, 0);
	const ratingTier = sum / totalGameNumber;
	const minRating = ratingTier - 75;
	const maxRating = ratingTier + 75;
	return [minRating, maxRating, ratingTier];
};

export default async function setGenerator(user, themeArray, length_, name_) {
	const puzzleSet = new PuzzleSet();
	const [minRating, maxRating, ratingTier] = rating(user);
	puzzleSet.user = user._id;
	puzzleSet.puzzles = [];
	let puzzlesCount = 0;

	if (themeArray.includes('healthyMix')) {
		for await (const doc of Puzzle.find(
			{
				Rating: {$gt: minRating, $lt: maxRating},
			},
			{_id: 1},
		)) {
			if (puzzlesCount >= length_) break;
			puzzleSet.puzzles.push(doc._id);
			puzzlesCount++;
		}
	} else {
		for await (const doc of Puzzle.find(
			{
				$and: [
					{Rating: {$gt: minRating, $lt: maxRating}},
					{Themes: {$in: [...themeArray]}},
				],
			},
			{_id: 1},
		)) {
			if (puzzlesCount >= length_) break;
			puzzleSet.puzzles.push(doc._id);
			puzzlesCount++;
		}
	}

	if (puzzlesCount < length_) {
		for await (const doc of Puzzle.find(
			{
				Rating: {$gt: minRating, $lt: maxRating},
			},
			{_id: 1},
		)) {
			if (puzzlesCount >= length_) break;
			puzzleSet.puzzles.push(doc._id);
			puzzlesCount++;
		}
	}

	puzzleSet.length = puzzlesCount;
	puzzleSet.title = name_;
	puzzleSet.tries = 0;
	puzzleSet.bestTime = 0;
	puzzleSet.rating = ratingTier;
	return puzzleSet;
}
