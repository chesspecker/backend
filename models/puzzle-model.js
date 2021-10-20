import mongoose from 'mongoose';

const {Schema} = mongoose;

const puzzleDefinition = new Schema({
	PuzzleId: {type: String},
	FEN: {type: String},
	Moves: {type: String},
	Rating: {type: Number},
	RatingDeviation: {type: Number},
	Popularity: {type: Number},
	NbPlays: {type: Number},
	Themes: [{type: String}],
	GameUrl: {type: String},
});

const PuzzleSchema = new mongoose.Schema(puzzleDefinition);
const Puzzle = mongoose.model('Puzzle', PuzzleSchema);

export {Puzzle};
