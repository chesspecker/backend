import {Server} from 'socket.io';

let io = null;

const SocketService = {
	initialize(server) {
		io = new Server(server, {
			cors: {
				origin: 'https://www.chesspecker.com',
				methods: ['GET', 'POST'],
				transports: ['websocket', 'polling'],
				credentials: true,
			},
		});

		io.engine.on('connection_error', error => {
			console.log(`Socket error, code : ${error.code}`); // The error code, see https://socket.io/docs/v4/server-instance/#serverengine
			console.log(`Socket error, message : ${error.message}`); // The error message, for example "Session ID unknown"
			console.log(`Socket error, context : ${error.context}`); // Some additional error context
		});

		return io;
	},

	getInstance() {
		return io;
	},
};

export default SocketService;
