import {PuzzleSet} from '../../models/puzzle-set-model.js';
import {User} from '../../models/user-model.js';

const setGetter = async function (request, response, next) {
	const id = request.session.userID;
	let user;
	try {
		user = await User.findOne({id});
	} catch (error) {
		return next(error);
	}

	PuzzleSet.find({user: user._id}, (error, puzzleSets) => {
		if (error) return next(error);
		if (puzzleSets.length === 0) {
			const error = new Error('No puzzle sets found, please create one');
			error.statusCode = 404;
			return next(error);
		}

		return response.send(puzzleSets);
	});
};

export default setGetter;

export const setGetterDashboard = async function (request, response, next) {
	const id = request.session.userID;
	let user;
	try {
		user = await User.findOne({id});
	} catch (error) {
		return next(error);
	}

	PuzzleSet.find(
		{user: user._id},
		{title: 1, cycles: 1, currentTime: 1, bestTime: 1, accuracy: 1, level: 1},
	).exec((error, puzzleSets) => {
		if (error) return next(error);
		if (puzzleSets.length === 0) {
			const error = new Error('No puzzle sets found, please create one');
			error.statusCode = 404;
			return next(error);
		}

		return response.send(puzzleSets);
	});
};
