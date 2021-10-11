import {Queue, Worker} from 'bullmq';
import fetch from 'node-fetch';
import ndjson from 'ndjson';
import createClient from '../services/redis.js';
import {Game} from '../models/game-model.js';
import SocketService from '../services/socket-io.js';
import generateGame from './game-generator.js';

const connection = createClient('downloads worker');
const settings = {lockDuration: 300_000, maxStalledCount: 0};
const limiter = {max: 30};
const downloadsQueue = new Queue('downloads', {connection, limiter, settings});

const worker = new Worker(
	'downloads',
	async job => {
		const {url, token, username, max} = job.data;
		console.log(`*****************`);
		console.log(`🦊 JOB[${job.id}]::START`);
		console.time(`🦊 JOB[${job.id}]::TIME:`);
		let count = 0;
		let progress = 0;
		try {
			const responseStream = await fetch(url, {
				headers: {
					Accept: 'application/x-ndjson',
					Authorization: `Bearer ${token}`,
				},
			});
			if (responseStream.status === 429) throw new Error('Too many requests');
			responseStream.body
				.pipe(ndjson.parse())
				.on('data', async current => {
					const {session} = job.data;
					const {socketId} = session;
					const isInDB = await Game.exists({game_id: current.id});
					if (isInDB) {
						/**
						 * Check if another player played it before ?
						 */
						count++;
						progress = (count / max).toFixed(2);
						job.updateProgress({progress, socketId});
					} else {
						const game = await generateGame(current, username);
						await game.populate('user');
						await game.save(error => {
							if (error) throw new Error(error);
						});
						count++;
						progress = (count / max).toFixed(2);
						job.updateProgress({progress, socketId});
					}
				})
				.on('pause', () => {
					console.log('pause');
				})
				.on('end', () => {
					console.log('end');
					console.timeEnd(`🦊 JOB[${job.id}]::TIME:`);
					console.log(`🦊 JOB[${job.id}]::SUCCESS`);
					return 'done';
				})
				.on('error', error => {
					console.log(error);
				});
		} catch (error) {
			console.timeEnd(`🦊 JOB[${job.id}]::TIME:`);
			console.log(`🦊 JOB[${job.id}]::FAIL`);
			throw error;
		}
	},
	{connection},
);

console.log(`🦊 WORKER STARTED`);

worker.on('progress', (job, {progress, socketId}) => {
	/**
	 * Check if websocket is open, send progress
	 */
	const io = SocketService.getInstance();
	io.to(socketId).emit('FromAPI', progress);
	console.log(`${job.id} sent to ${socketId} progress : ${progress}`);
});

worker.on('completed', job => {
	console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, error) => {
	console.error(`${job.id} has failed with ${error.message}`);
});

downloadsQueue.on('active', job => console.log(`${job.jobId} has activated!`));
downloadsQueue.on('completed', job => {
	const io = SocketService.getInstance();
	io.on('connection', socket => {
		socket.emit('FromAPI', `${job.jobId} has activated!`);
	});
	console.log(`${job.jobId} has activated!`);
});

export {downloadsQueue, worker};
