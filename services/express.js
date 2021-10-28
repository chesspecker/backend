import process from 'node:process';
import {createServer} from 'node:http';
import express, {json} from 'express';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import {config, secrets} from '../config/config.js';
import auth from '../routes/auth.js';
import user from '../routes/user.js';
import set from '../routes/set.js';
import puzzle from '../routes/puzzle.js';
import healthCheck from '../routes/health-check.js';
import errorHandlerMiddleware from '../middlewares/error-handler.js';
import createClient from './redis.js';
import SocketService from './socket-io.js';

const corsOptions = {
	origin: [
		'https://chesspecker.com',
		'https://api.chesspecker.com',
		'https://www.chesspecker.com',
		`http://localhost:${config.port}`,
		`http://localhost:${config.frontPort}`,
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

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const sessionOptions = {
	name: 'chesspecker-sessions',
	resave: true,
	secret: secrets,
	saveUninitialized: true,
	cookie: {
		secure: false,
		httpOnly: false,
		maxAge: ONE_WEEK,
	},
};

if (config.status === 'prod') {
	const RedisStore = connectRedis(session);
	const client = createClient('sessions');
	sessionOptions.cookie.domain = 'chesspecker.com';
	sessionOptions.cookie.secure = true;
	sessionOptions.store = new RedisStore({client});
}

const app = express();

const httpServer = createServer(app);
app.set('socketio', SocketService.initialize(httpServer));
app.set('trust proxy', 1);

app.use(json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));

app.use('/auth', auth);
app.use('/healthCheck', healthCheck);
app.use('/set', set);
app.use('/puzzle', puzzle);
app.use('/user', user);

app.use(errorHandlerMiddleware);
app.use((_request, response) => {
	response.status(404).send('404 not found');
});

export const start = () => {
	httpServer.listen(config.port, error => {
		if (error) throw error;
		console.log(`Server started! pid: ${process.pid} and port: ${config.port}`);
	});
};
