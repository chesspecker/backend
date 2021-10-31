import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleSetDefinition = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	puzzles: [
		{
			_id: {type: Schema.Types.ObjectId, ref: 'Puzzle'},
			PuzzleId: {type: String},
			played: {type: Boolean},
			order: {type: Number},
			mistakes: {type: Number},
			timeTaken: {type: Number},
			grade: {type: Number},
			interval: {type: Number},
			repetition: {type: Number},
			easinessFactor: {type: Number},
		},
	],
	title: {type: String},
	length: {type: Number},
	chunkLength: {type: Number},
	cycles: {type: Number},
	spacedRepetition: {type: Boolean},
	currentTime: {type: Number},
	bestTime: {type: Number},
	rating: {type: Number},
	totalMistakes: {type: Number},
	totalPuzzlesPlayed: {type: Number},
	accuracy: {type: Number},
	level: {
		type: String,
		enum: [
			'easiest',
			'easier',
			'easy',
			'normal',
			'intermediate',
			'hard',
			'harder',
			'hardest',
		],
		default: 'normal',
	},
});

const puzzleSetSchema = new mongoose.Schema(puzzleSetDefinition);
const PuzzleSet = mongoose.model('puzzleSet', puzzleSetSchema);

export {PuzzleSet};
