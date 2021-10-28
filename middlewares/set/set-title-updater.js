import {PuzzleSet} from '../../models/puzzle-set-model.js';

const setTitleUpdater = async function (request, response, next) {
	const puzzleSetId = request.params.id;
	const {title} = request.body;
	if (title) {
		PuzzleSet.updateOne({_id: puzzleSetId}, {$set: {title}}, error => {
			if (error) return next(error);
			response.send('success');
		});
	} else {
		const error = new Error('Empty request');
		error.statusCode = 400;
		return next(error);
	}
};

export default setTitleUpdater;
