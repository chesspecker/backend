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

		const responseStream = await fetch(url, {
			headers: {
				Accept: 'application/x-ndjson',
				Authorization: `Bearer ${token}`,
			},
		});

		if (responseStream.status === 429) throw new Error('Too many requests');

		const processingGames = () =>
			new Promise((resolve, reject) => {
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
							job.updateProgress({count, max, progress, socketId});
						} else {
							const game = await generateGame(current, username);
							await game.populate('user');
							await game.save(error => {
								if (error) throw new Error(error);
							});
							count++;
							progress = (count / max).toFixed(2);
							job.updateProgress({count, max, progress, socketId});
						}
					})
					.on('finish', resolve)
					.on('error', reject);
			});

		processingGames()
			.then(() => {
				console.timeEnd(`🦊 JOB[${job.id}]::TIME:`);
				console.log(`🦊 JOB[${job.id}]::SUCCESS`);
				return 'done';
			})
			.catch(error => {
				console.log(`🦊 JOB[${job.id}]::FAIL`);
				console.error(error);
			});
	},
	{connection},
);

console.log(`🦊 WORKER STARTED`);

worker.on('progress', (job, {count, max, progress, socketId}) => {
	const io = SocketService.getInstance();
	io.to(socketId).emit('FromAPI', {count, max, progress});
	console.log(`${job.id} sent to ${socketId} progress : ${progress}`);
});

worker.on('completed', job => {
	console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, error) => {
	console.error(`${job.id} has failed with ${error.message}`);
});

downloadsQueue.on('active', job => console.log(`${job.jobId} has activated!`));

export {downloadsQueue, worker};
