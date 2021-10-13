/* eslint-disable camelcase */
import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleSetDefinition = new Schema({
	puzzleSet_id: {
		type: Number,
		unique: true,
		lowercase: true,
		required: true,
	},
	user: [{type: Schema.Types.ObjectId, ref: 'User'}],
	puzzles: [{type: Schema.Types.ObjectId, ref: 'Puzzle'}],
	length: {type: Number},
	tries: {type: Number},
	successRate: {type: Number},
	bestTime: {type: Number},
});

const puzzleSetSchema = new mongoose.Schema(puzzleSetDefinition);
const PuzzleSet = mongoose.model('puzzleSet', puzzleSetSchema);

export {PuzzleSet};
