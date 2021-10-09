import process from 'node:process';
import express, {json} from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import {config, secrets, db} from '../config/config.js';
import auth from '../routes/auth.js';
import user from '../routes/user.js';

const app = express();
app.use(json());

const corsOptions = {
	origin: [
		'https://chesspecker.com',
		'https://api.chesspecker.com',
		'https://www.chesspecker.com',
		'http://localhost:3000',
	],
	methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization',
	],
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const storeOptions = {mongoUrl: db.url, dbName: db.name};

const sessionOptions = {
	resave: true,
	cookie: {
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
	},
	secret: secrets,
	saveUninitialized: false,
};

if (config.status === 'prod') {
	sessionOptions.store = MongoStore.create(storeOptions);
	sessionOptions.cookie.domain = 'chesspecker.com';
}

app.use(session(sessionOptions));
app.use('/auth', auth);
app.use('/user', user);

export const start = () => {
	app.listen(config.port, error => {
		if (error) {
			throw error;
		}

		console.log(`Server started! pid: ${process.pid} and port: ${config.port}`);
	});
};
