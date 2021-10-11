import mongoose from 'mongoose';
import {User} from '../models/user-model.js';

const {Schema} = mongoose;

const chessVariants = [
	'standard',
	'chess960',
	'crazyhouse',
	'antichess',
	'atomic',
	'horde',
	'kingOfTheHill',
	'racingKings',
	'threeCheck',
];

const status = [
	'created',
	'started',
	'aborted',
	'mate',
	'resign',
	'stalemate',
	'timeout',
	'draw',
	'outoftime',
	'cheat',
	'noStart',
	'unknownFinish',
	'variantEnd',
];

const gameDefinition = new Schema({
	game_id: {
		type: String,
		unique: true,
		lowercase: true,
		required: true,
	},
	user: [{type: Schema.Types.ObjectId, ref: 'User'}],
	color: String,
	status: {
		type: String,
		enum: status,
		required: true,
	},
	variant: {
		type: String,
		enum: chessVariants,
		default: 'standard',
	},
	speed: String,
	perf: String,
	pgn: String,
	analyzed: Boolean,
});

const gameSchema = new mongoose.Schema(gameDefinition);
const Game = mongoose.model('Game', gameSchema);

const gameModel = {
	definition: gameDefinition,
	schema: gameSchema,
	model: Game,
};

gameSchema.post('save', async next => {
	try {
		const objectId = new mongoose.Types.ObjectId(this.user);
		console.log(objectId);
		const user = await User.findOneAndUpdate(
			{_id: objectId},
			{$inc: {gamesInDb: 1}},
		);
		console.log(user);
		return next();
	} catch (error) {
		return next(error);
	}
});

export {gameSchema, Game, gameModel};
