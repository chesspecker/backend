import {env} from 'node:process';
import {config as _config} from 'dotenv';

_config();

export const db = {
	url: env.DB_URL,
	name: env.DB_NAME,
	debug: env.DB_DEBUG,
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
