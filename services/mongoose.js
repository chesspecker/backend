import mongoose from 'mongoose';
import {db} from '../config/config.js';

mongoose.connection.on('connected', () => {
	console.log('MongoDB is connected');
});

mongoose.connection.on('error', error => {
	console.log(`Could not connect to MongoDB because of ${error}`);
	throw error;
});

if (db.debug === true) {
	mongoose.set('debug', true);
}

export function connect() {
	mongoose.connect(db.url, {
		keepAlive: 1,
		useNewUrlParser: true,
		dbName: db.name,
	});

	return mongoose.connection;
}
