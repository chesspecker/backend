import {env} from 'node:process';
import {config as _config} from 'dotenv';

_config();

export const db = {
	url: env.DB_URL,
	name: env.DB_NAME,
};

export const auth = {
	LICHESS_CLIENT_ID: env.LICHESS_CLIENT_ID,
	LICHESS_CLIENT_SECRET: env.LICHESS_CLIENT_SECRET,
};

export const port = env.APP_PORT;
export const secrets = [...env.SESSION_SECRET];
