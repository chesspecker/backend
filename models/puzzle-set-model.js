import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleSetDefinition = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	puzzles: [{type: Schema.Types.ObjectId, ref: 'Puzzle'}],
	title: {type: String},
	length: {type: Number},
	tries: {type: Number},
	bestTime: {type: Number},
	rating: {type: Number},
});

const puzzleSetSchema = new mongoose.Schema(puzzleSetDefinition);
const PuzzleSet = mongoose.model('puzzleSet', puzzleSetSchema);

export {PuzzleSet};
