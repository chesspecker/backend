import {Router} from 'express';
import {v4 as uuidv4} from 'uuid';
import Joi from 'joi';
import {User} from '../models/user-model.js';
import getLichessData from '../utils/get-lichess-data.js';
import {downloadsQueue} from '../controllers/downloads-worker.js';
import {analysisQueue} from '../controllers/analysis-worker.js';
import sessionValidator from '../utils/session-validator.js';
import SocketService from '../services/socket-io.js';

const router = new Router();

router.get('/', sessionValidator, async (request, response) => {
	const id = request.session.userID;
	const user = await User.findOne({id});
	response.send(user);
});

router.get('/download', sessionValidator, async (request, response, next) => {
	const {max = 100, rated, perfType = 'blitz,rapid,classical'} = request.query;
	const schema = Joi.object({
		max: [Joi.number().integer().min(1).max(400).optional(), Joi.allow(null)],
		rated: [Joi.bool().optional(), Joi.allow(null)],
		perfType: Joi.string(),
	});

	try {
		await schema.validateAsync({max, rated, perfType});
	} catch (error) {
		error.status = 400;
		return next(error);
	}

	const token = request.session.token;
	const username = request.session.username;
	const linkParameters = new URLSearchParams({
		max,
		rated,
		perfType,
		pgnInJson: true,
	});

	const url = ` https://lichess.org/api/games/user/${username}?${linkParameters}`;
	const jobData = {url, token, username, max, session: request.session};
	const jobId = uuidv4();
	const jobOptions = {jobId};
	request.session.jobId = jobId;
	const io = SocketService.getInstance();
	let socketId;
	io.on('connection', socket => {
		console.log('connected with id: ' + socket.id);
		socketId = socket.id;
		request.session.socketId = socketId;
		downloadsQueue.add(jobId, jobData, jobOptions).then(
			job => response.status(201).send({status: 'success', id: job.name}),
			error => next(error),
		);
	});
});

router.get('/analysis', sessionValidator, async (request, response, next) => {
	const token = request.session.token;
	const lichessUser = await getLichessData(token);
	const jobOptions = {token, lichessUser};
	analysisQueue.add(uuidv4(), jobOptions).then(
		job => response.status(201).send({status: 'success', id: job.name}),
		error => next(error),
	);
});

export default router;
