import setGenerator from '../../controllers/set-generator.js';
import {User} from '../../models/user-model.js';

const setPoster = async function (request, response, next) {
	const id = request.session.userID;
	let user;
	try {
		user = await User.findOne({id}).exec();
		if (user === null) {
			const error = new Error('user not found');
			error.statusCode = 400;
			throw error;
		}
	} catch (error) {
		return next(error);
	}

	const {themeArray, size, title, level} = request.body;
	const options = {themeArray, size, title, level};

	let puzzleSet;
	try {
		puzzleSet = await setGenerator(user, options);
	} catch (error) {
		return next(error);
	}

	try {
		await puzzleSet.populate('user');
		await puzzleSet.populate('puzzles');
	} catch (error) {
		return next(error);
	}

	let puzzleSetId;
	puzzleSet.save(async (error, item) => {
		if (error) return next(error);
		puzzleSetId = item._id;
		response.send(puzzleSetId);
	});
	/**
	 * Doesn't work, throwing error :
	 * 
MissingSchemaError: Schema hasn't been registered for model "PuzzleSet".
Use mongoose.model(name, schema)
    at NativeConnection.Connection.model (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/connection.js:1132:11)
    at addModelNamesToMap (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/helpers/populate/getModelsMapForPopulate.js:470:28)
    at getModelsMapForPopulate (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/helpers/populate/getModelsMapForPopulate.js:174:7)
    at populate (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/model.js:4437:21)
    at _populate (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/model.js:4408:5)
    at /home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/model.js:4385:5
    at /home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js:32:5
    at new Promise (<anonymous>)
    at promiseOrCallback (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/helpers/promiseOrCallback.js:31:10)
    at Mongoose._promiseOrCallback (/home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/index.js:1151:10)
(node:345946) UnhandledPromiseRejectionWarning: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (_http_outgoing.js:561:11)
    at ServerResponse.header (/home/ubuntu/chesspecker-backend/node_modules/express/lib/response.js:771:10)
    at ServerResponse.send (/home/ubuntu/chesspecker-backend/node_modules/express/lib/response.js:170:12)
    at ServerResponse.json (/home/ubuntu/chesspecker-backend/node_modules/express/lib/response.js:267:15)
    at ServerResponse.send (/home/ubuntu/chesspecker-backend/node_modules/express/lib/response.js:158:21)
    at file:///home/ubuntu/chesspecker-backend/routes/puzzles.js:56:12
    at /home/ubuntu/chesspecker-backend/node_modules/mongoose/lib/model.js:4923:18
    at processTicksAndRejections (internal/process/task_queues.js:77:11)
	 
	try {
		await user.update({$push: {puzzleSet: puzzleSetId}});
		await user.populate('puzzleSet');
		await user.save();
	} catch (error) {
		return next(error);
	}
	*/
};

export default setPoster;
