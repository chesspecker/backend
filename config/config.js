import {env} from 'node:process';
import {config as _config} from 'dotenv';

_config();

export const db = {
	url: env.DB_URL,
	name: env.DB_NAME,
	debug: env.DB_DEBUG,
};

export const redisConfig = {
	uri: env.REDIS_URI,
};

export const auth = {
	LICHESS_CLIENT_ID: env.LICHESS_CLIENT_ID,
	LICHESS_CLIENT_SECRET: env.LICHESS_CLIENT_SECRET,
};

export const config = {
	port: env.APP_PORT || 8000,
	frontPort: env.FRONT_PORT || 3000,
	status: env.APP_ENV,
};

export const secrets = [...env.SESSION_SECRET];

export const siteUrl =
	env.APP_ENV === 'prod'
		? `https://api.chesspecker.com`
		: `http://localhost:${config.port}`;

export const siteRedirectUrl =
	env.APP_ENV === 'prod'
		? 'https://www.chesspecker.com'
		: `http://localhost:${config.frontPort}`;
