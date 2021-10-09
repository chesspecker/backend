import IORedis from 'ioredis';
import {redisConfig} from '../config/config.js';

export default function createClient() {
	const redisClient = new IORedis(redisConfig.uri);
	redisClient.on('error', error => console.log('Redis Client Error', error));
	redisClient.on('connect', () => console.log('Connected to redis !'));
	return redisClient;
}
