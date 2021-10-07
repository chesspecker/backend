import process from 'node:process';
import express, {json} from 'express';
import cors from 'cors';
import session from 'express-session';
import {port, secrets, db} from '../config/config.js';
import auth from '../routes/auth.js';
import user from '../routes/user.js';
import MongoStore from 'connect-mongo';

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

app.use(
	session({
		resave: true,
		cookie: {
			domain: 'chesspecker.com',
			sameSite: 'none',
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		},
		secret: secrets,
		store: MongoStore.create(storeOptions),
		saveUninitialized: false,
	}),
);
app.use('/auth', auth);
app.use('/user', user);

const port_ = port || 3000;

export const start = () => {
	app.listen(port_, error => {
		if (error) {
			throw error;
		}

		console.log(`Server started : pid ${process.pid}`);
	});
};
