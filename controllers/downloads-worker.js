import {Queue, Worker} from 'bullmq';
import fetch from 'node-fetch';
import ndjson from 'ndjson';
import createClient from '../services/redis.js';
import {Game} from '../models/game-model.js';
import generateGame from './game-generator.js';

const connection = createClient();
const settings = {lockDuration: 300_000, maxStalledCount: 0};
const limiter = {max: 30};
const downloadsQueue = new Queue('downloads', {connection, limiter, settings});

const worker = new Worker(
	'downloads',
	async job => {
		const {url, token, username, max} = job.data;
		const responseStream = await fetch(url, {
			headers: {
				Accept: 'application/x-ndjson',
				Authorization: `Bearer ${token}`,
			},
		});
		let progress = 0;
		const percent = (progress, max) =>
			`${Math.round((progress / max) * 100)}%`;
		responseStream.body
			.pipe(ndjson.parse())
			.on('data', async current => {
				const isInDB = await Game.exists({game_id: current.id});
				if (isInDB === true) {
					// Check if another player played it
					console.log('Game : ' + current.id + ' is in db');
					job.updateProgress(percent(progress++, max));
				} else {
					const game = await generateGame(current, username);
					await game.populate('user');
					await game.save(error => {
						if (error) throw new Error(error);
						console.log(`The document was inserted with the id: ${current.id}`);
					});
					job.updateProgress(percent(progress++, max));
				}
			})
			.on('pause', () => {
				console.log('pause');
			})
			.on('end', () => {
				console.log('end');
			})
			.on('error', error => {
				console.log(new Error(error));
			});
	},
	{connection},
);

worker.on('progress', (job, progress) => {
	console.log(`${job.id} has progress : ${progress}`);
});

worker.on('completed', job => {
	console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, error) => {
	console.log(`${job.id} has failed with ${error.message}`);
});

console.log('Worker is ready');

downloadsQueue.on('stalled', function (job) {
	console.log('Job %s is stalled', job.jobId);
});

export {downloadsQueue};
