import {spawn} from 'node:child_process';
import {Queue, Worker} from 'bullmq';
import createClient from '../services/redis.js';

const connection = createClient('analysis worker');
const settings = {lockDuration: 300_000, maxStalledCount: 0};
const limiter = {max: 30};
const analysisQueue = new Queue('analysis', {connection, limiter, settings});

const worker = new Worker(
	'analysis',
	async job => {
		console.log(job.data);
		// Spawn new child process to call the python script
		const python = spawn('python3', ['../packages/tactics-generator/main.py']);
		// Collect data from script
		python.stdout.on('data', function (data) {
			console.log('Pipe data from python script ...');
			console.log(data.toString());
		});
		// In close event we are sure that stream from child process is closed
		python.on('close', code => {
			console.log(`child process close all stdio with code ${code}`);
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

analysisQueue.on('active', job => console.log(`${job.jobId} has activated!`));

export {analysisQueue};
