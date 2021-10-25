import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleSetDefinition = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	puzzles: [
		{
			_id: {type: Schema.Types.ObjectId, ref: 'Puzzle'},
			played: {type: Boolean},
			mistakes: {type: Number},
			timeTaken: {type: Number},
			interval: {type: Number},
			repetition: {type: Number},
			easinessFactor: {type: Number},
		},
	],
	title: {type: String},
	length: {type: Number},
	tries: {type: Number},
	currentTime: {type: Number},
	bestTime: {type: Number},
	rating: {type: Number},
	totalMistakes: {type: Number},
	totalPuzzlesPlayed: {type: Number},
	accuracy: {type: Number},
	level: {
		type: String,
		enum: ['easy', 'intermediate', 'hard'],
		default: 'intermediate',
	},
});

const puzzleSetSchema = new mongoose.Schema(puzzleSetDefinition);
const PuzzleSet = mongoose.model('puzzleSet', puzzleSetSchema);

export {PuzzleSet};
