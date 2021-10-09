import mongoose from 'mongoose';

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

export const gameSchema = new mongoose.Schema(gameDefinition);
export const Game = mongoose.model('Game', gameSchema);

const gameModel = {
	definition: gameDefinition,
	schema: gameSchema,
	model: Game,
};

export default gameModel;
